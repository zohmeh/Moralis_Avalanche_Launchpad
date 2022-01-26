 //SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./MagePadNFT.sol";

contract Marketplace {

    struct Sale {
        uint256 tokenId;
        bool isActive;
        uint256 price;
        uint256 index;
    }
    
    //tokenId => Saledata and SaleList
    mapping(uint256 => Sale) public saleMap;
    Sale[] saleList;    
    
    address public owner;

    constructor() {
        require(address(this) != address(0));
        owner = msg.sender;
    }

    function setSale(uint256 _tokenId, uint256 _price, address _magePadNFTAddress) public {
        require(saleMap[_tokenId].isActive == false, "There is already an offer for this NFT");
        require(MagePadNFT(_magePadNFTAddress).isApprovedForAll(MagePadNFT(_magePadNFTAddress).ownerOf(_tokenId), address(this)), "The Marketplace is not approved as operator for your token");

        Sale memory _sale = Sale({
            tokenId: _tokenId,
            isActive: true,
            price: _price,
            index: saleList.length
        });

        saleList.push(_sale);
        saleMap[_tokenId] = _sale;

    }

    function removeSale(uint256 _tokenId) public {
        require(saleMap[_tokenId].isActive == true, "There is no offer for this NFT");

        delete saleMap[_tokenId];
        uint256 _offerId;
        for(_offerId = 0; _offerId < saleList.length; _offerId++){
            if(saleList[_offerId].tokenId == _tokenId) {
                saleList[_offerId].isActive = false;
            }
        }
    }

    function buyNFT(uint256 _tokenId, address _magePadNFTAddress) public payable {
        require(saleMap[_tokenId].isActive == true, "There is no offer for this NFT");
        require(msg.value == saleMap[_tokenId].price, "Please send the correct Price for this NFT");

        delete saleMap[_tokenId];
        for(uint256 _saleId = 0; _saleId < saleList.length; _saleId++){
            if(saleList[_saleId].tokenId == _tokenId) {
                saleList[_saleId].isActive = false;
            }
        }

        MagePadNFT(_magePadNFTAddress).approve(msg.sender, _tokenId);
        address payable originalOwner = payable(MagePadNFT(_magePadNFTAddress).ownerOf(_tokenId));
        MagePadNFT(_magePadNFTAddress).safeTransferFrom(originalOwner, msg.sender, _tokenId); 
        originalOwner.transfer(msg.value);

    }
}