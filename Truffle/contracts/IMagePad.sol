 //SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMagePad {

    function getInvestor(address _tokenAddress, address _investorAddress) external view returns(uint256);
    function checkUnlockStatus(address _tokenAddress) external view returns(bool);
    function createProject(address _tokenAddress, uint256 _amount, uint256 _projectDuration, uint256 _conversionRate, uint256 _lockedPercentage) external;
    function invest(address _tokenAddress, uint256 _amount) external payable;
    function unlockTokens(address _tokenAddress) external;
    function withdrawFunds(address _tokenAddress) external;
    function getProjectEndingTime(address _superTokenAddress) external view returns(uint256);
    function transferProjectToken(address _tokenAddress, address _investorAddress) external returns(uint256);
    function payOutReward(address _tokenAddress, uint256 _time, address _receiver) external;
}