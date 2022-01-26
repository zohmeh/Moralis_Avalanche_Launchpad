 //SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./MagePadNFT.sol";

contract Marketplace2 {

    struct Sale {
        uint256 tokenId;
        bool isActive;
        uint256 price;
        //uint256 index;
        bool offerAccepted;
        address bidder;
        uint256 biddingBlockTime;
    }
    
    //address => tokenId => Saledata
    mapping(address => mapping(uint256 => Sale)) public saleMap;

    //storing the tokenId for which a bid was made
    uint256[] public tokensWithBids;

    address operator;
    event NewSale(uint256 tokenId, address magePadNFTAddress);
    event RemoveSale(uint256 tokenId, address magePadNFTAddress);
    event SoldNFT(uint256 tokenId, address magePadNFTAddress);
    event NewOffer(uint256 tokenId, uint256 price, address caller);
    event OfferAccepted(uint256 tokenId, address magePadNFTAddress, address caller);

    constructor() {
        require(address(this) != address(0));
        operator = msg.sender;
    }

    function checkForUpdate(address magePadNFTAddress) public view returns(uint256[] memory) {
        uint256[] memory bidsToStop = new uint256[](tokensWithBids.length);
        uint256 counter = 0;
        for(uint256 i = 0; i < tokensWithBids.length; i++) {
            if(saleMap[magePadNFTAddress][tokensWithBids[i]].isActive == true && saleMap[magePadNFTAddress][tokensWithBids[i]].biddingBlockTime > 0 && block.timestamp >= saleMap[magePadNFTAddress][tokensWithBids[i]].biddingBlockTime + 3 days) {
                bidsToStop[counter] = tokensWithBids[i];
                counter = counter + 1;
            }
        }
        return bidsToStop;        
    }

    function performUpdate(uint256[] memory _bidsToStop, address magePadNFTAddress) public {
        for(uint256 i = 0; i < _bidsToStop.length; i++) {
            saleMap[magePadNFTAddress][_bidsToStop[i]].price = 0;
            saleMap[magePadNFTAddress][_bidsToStop[i]].bidder = address(0);
            saleMap[magePadNFTAddress][_bidsToStop[i]].biddingBlockTime = 0;
        }
    }

    function setSale(uint256 tokenId, address magePadNFTAddress) public {
        //this will be paid by the nftowner
        require(saleMap[magePadNFTAddress][tokenId].isActive == false, "There is already an offer for this NFT");
        require(MagePadNFT(magePadNFTAddress).isApprovedForAll(MagePadNFT(magePadNFTAddress).ownerOf(tokenId), address(this)), "The Marketplace is not approved as operator for your token");

        saleMap[magePadNFTAddress][tokenId] = Sale(tokenId, true, 0, false, address(0), 0);
        
        emit NewSale(tokenId, magePadNFTAddress);
    }

    function removeSale(uint256 tokenId, address magePadNFTAddress) public {
        //this will be paid by the nftowner
        require(saleMap[magePadNFTAddress][tokenId].isActive == true, "There is no ongoing sale for this NFT");
        require(saleMap[magePadNFTAddress][tokenId].price == 0, "Cannot remove from sale when an offer was already made");
        require(saleMap[magePadNFTAddress][tokenId].offerAccepted == false, "Cannot remove from sale when an offer was already accepted");

        delete saleMap[magePadNFTAddress][tokenId];

        emit RemoveSale(tokenId, magePadNFTAddress);
    }

    function buyNFT(uint256 tokenId, address magePadNFTAddress) public payable {
        //this will be paid buy the actual buyer
        require(saleMap[magePadNFTAddress][tokenId].isActive == true, "There is no sale for this NFT");
        require(saleMap[magePadNFTAddress][tokenId].offerAccepted == true, "There is no sale for this NFT");
        require(msg.value == saleMap[magePadNFTAddress][tokenId].price, "Please send the correct Price for this NFT");
        require(msg.sender == saleMap[magePadNFTAddress][tokenId].bidder, "Not your bid was accepted");

        delete saleMap[magePadNFTAddress][tokenId];

        MagePadNFT(magePadNFTAddress).approve(msg.sender, tokenId);
        address payable originalOwner = payable(MagePadNFT(magePadNFTAddress).ownerOf(tokenId));
        MagePadNFT(magePadNFTAddress).safeTransferFrom(originalOwner, msg.sender, tokenId); 
        originalOwner.transfer(msg.value);

        emit SoldNFT(tokenId, magePadNFTAddress);
    }

    function makePriceOffer(uint256 tokenId, uint256 price, address caller, address magePadNFTAddress) public {
        //this will be paid by the operator
        //actual bidder calls a moralis cloud function that is the operator, that will do the transaction, so bidding for the user is or free
        require(msg.sender == operator, "Only the operator can call this function");
        require(saleMap[magePadNFTAddress][tokenId].isActive == true, "There is no sale for this NFT");
        require(price > saleMap[magePadNFTAddress][tokenId].price, "Make a higher bid");
        saleMap[magePadNFTAddress][tokenId].price = price;
        saleMap[magePadNFTAddress][tokenId].bidder = caller;
        saleMap[magePadNFTAddress][tokenId].biddingBlockTime = block.timestamp;

        tokensWithBids.push(tokenId);

        emit NewOffer(tokenId, price, caller);
    }

    function acceptOffer(uint256 tokenId, address magePadNFTAddress, address caller) public {
        //this will be paid by the operator
        //his is called by a moralis cloudfunction
        require(msg.sender == operator, "Only the operator can call this function");
        require(MagePadNFT(magePadNFTAddress).ownerOf(tokenId) == caller);
        saleMap[magePadNFTAddress][tokenId].offerAccepted = true;

        emit OfferAccepted(tokenId, magePadNFTAddress, caller);
    }
}