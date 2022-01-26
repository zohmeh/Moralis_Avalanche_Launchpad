 //SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarketplace {

    function setSale(uint256 _tokenId, uint256 _price, address _magePadNFTAddress) external;
    function removeSale(uint256 _tokenId) external;
    function buyNFT(uint256 _tokenId, address _magePadNFTAddress) external payable;
}