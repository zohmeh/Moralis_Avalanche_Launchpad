 //SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarketplace2 {

    function setSale(uint256 tokenId, address magePadNFTAddress) external;
    function removeSale(uint256 tokenId, address magePadNFTAddress) external;
    function buyNFT(uint256 tokenId, address magePadNFTAddress) external payable;
    function makePriceOffer(uint256 tokenId, uint256 price, address caller, address magePadNFTAddress) external;
    function acceptOffer(uint256 tokenId, address magePadNFTAddress, address caller) external;
}