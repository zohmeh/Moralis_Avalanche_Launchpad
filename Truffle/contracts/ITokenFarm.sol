 //SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITokenFarm {
    function stakeTokens(uint256 _amount, address _token, address _nftowner) external;
    function unstakeTokens(address _token, address _nftowner) external;
    function updateNFTOwner(address _token, address _oldowner, address _newowner) external;
    function tokenIsAllowed(address _token) external view returns(bool);
    function addAllowedTokens(address _token) external;
}