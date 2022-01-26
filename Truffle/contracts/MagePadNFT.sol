 //SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IMagePad} from "./IMagePad.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IMarketplace2} from "./IMarketplace2.sol";

contract MagePadNFT is ERC721 {    
    uint256 tokenId;
    IERC20 mageToken;
    address marketplaceAddress;

    event newNFT(uint256 tokenId);

    // Storing single NFT Data
    struct nftData {
        uint256 tokenAmount;
        address tokenAddress;
        uint256 mintingTime;
    }

    // Storing all NFTs
    mapping (uint256 => nftData) public allNFTs;

    constructor (address _mageTokenAddress, address _marketplaceAddress) ERC721 ("HourglassNFT", "HGNFT") {
        mageToken = IERC20(_mageTokenAddress);
        marketplaceAddress = _marketplaceAddress;
        tokenId = 1;
    }

    function mint(address _tokenAddress, address _magePadAddress) public payable returns(bool) {      
        //getting the locked tokens from the magepad into this nft
        uint256 _tokenAmount = IMagePad(_magePadAddress).transferProjectToken(_tokenAddress, msg.sender);
        _mint(msg.sender, tokenId);
        allNFTs[tokenId] = nftData(_tokenAmount, _tokenAddress, block.timestamp);
        emit newNFT(tokenId);
        tokenId = tokenId + 1;
        return true;
    }

    function withdrawStakedAmount(uint256 _tokenId, address _magePadAddress) public {
        require(msg.sender == ownerOf(_tokenId), "Only owner of the nft can withdraw the staked tokens");
        require(allNFTs[_tokenId].tokenAmount > 0, "Staked tokens were already withdrawed");
        require(IMagePad(_magePadAddress).checkUnlockStatus(allNFTs[_tokenId].tokenAddress) == true, "Project did not allow to claim these tokens");
        //additional require that no withdraw if the nft is on sale    

        uint256 _tokenAmount = allNFTs[_tokenId].tokenAmount;
        allNFTs[_tokenId].tokenAmount = 0;
        IERC20(allNFTs[_tokenId].tokenAddress).transfer(msg.sender, _tokenAmount);

        // payOut the reward amount
        uint256 _stakingPeriod = block.timestamp - allNFTs[_tokenId].mintingTime;
        IMagePad(_magePadAddress).payOutReward(allNFTs[_tokenId].tokenAddress, _stakingPeriod, msg.sender);
    }

    function putForSale(uint256 _tokenId, /*uint256 _price,*/ address _magePadNFTAddress) public returns(bool) {
      require(msg.sender == ownerOf(_tokenId), "Only owner of the nft can put it for sale");
      
      setApprovalForAll(marketplaceAddress, true);
      IMarketplace2(marketplaceAddress).setSale(_tokenId, _magePadNFTAddress); 

      return true;
    }

    function removeFromSale(uint256 _tokenId, address _magePadNFTAddress) public returns(bool) {
      require(msg.sender == ownerOf(_tokenId), "Only owner of the nft can remove it from sale");
      IMarketplace2(marketplaceAddress).removeSale(_tokenId, _magePadNFTAddress);
      return true;
    }
}