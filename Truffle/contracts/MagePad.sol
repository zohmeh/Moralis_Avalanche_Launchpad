 //SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract MagePad {

    address owner;
    address magePadNFTAddress;

    struct Project {
        uint256 launchingTokenBalance;
        uint256 rewardingTokenBalance;
        address projectOwner;
        uint256 projectEndingTime;
        uint256 conversionRate;
        uint256 lockedPercentage;
        bool allowUnlocking;
        uint256 interest;
    }

    struct Investor {
        address investorAddress;
        address investedToken;
        uint256 lockedAmount;
    }

    //mapping the projecttoken to projects
    mapping(address => Project) public projects;
    //mapping the investor to invested tokens
    mapping(address => mapping(address => Investor)) public investors;

    //list with all investors
    address[] allInvestors;
    
    constructor(address _magePadNFTAddress) {
        owner = msg.sender;
        magePadNFTAddress = _magePadNFTAddress;
    }

    function payOutReward(address _tokenAddress, uint256 _time, address _receiver) public {
        uint256 _rewardAmount = _time * projects[_tokenAddress].interest; 
        projects[_tokenAddress].rewardingTokenBalance = projects[_tokenAddress].rewardingTokenBalance - _rewardAmount;
        IERC20(_tokenAddress).transfer(_receiver, _rewardAmount);
    }

    function createProject(address _tokenAddress, uint256 _amount, uint256 _projectDuration, uint256 _conversionRate, uint256 _lockedPercentage) public {
        uint256 _projectEndingTime = block.timestamp + _projectDuration;
        projects[_tokenAddress] = Project((_amount / 2), (_amount / 2), msg.sender, _projectEndingTime, _conversionRate, _lockedPercentage, false, 500000000000);  
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);       
    }

    function invest(address _tokenAddress, uint256 _amount) public payable {
        require(investors[msg.sender][_tokenAddress].investorAddress == address(0), "You already invested in this project");
        require(projects[_tokenAddress].launchingTokenBalance >= _amount, "Not enough balance to send");
        uint256 _lockedAmount = _amount * projects[_tokenAddress].lockedPercentage / 100;
        uint256 _sendingAmount = _amount - _lockedAmount;        
        investors[msg.sender][_tokenAddress] = Investor(msg.sender, _tokenAddress, _lockedAmount);

        projects[_tokenAddress].launchingTokenBalance = projects[_tokenAddress].launchingTokenBalance - _amount;
        address payable projectOwner = payable(projects[_tokenAddress].projectOwner);
        projectOwner.transfer(msg.value);

        allInvestors.push(msg.sender);
        IERC20(_tokenAddress).transfer(msg.sender, _sendingAmount);
    }

    function unlockTokens(address _tokenAddress) public {
        require(projects[_tokenAddress].projectOwner == msg.sender, "Only project owner can unlock tokens");
        require(projects[_tokenAddress].allowUnlocking == false, "Tokens already unlocked");
        projects[_tokenAddress].allowUnlocking = true;
        projects[_tokenAddress].interest = 1000000000000;

        //sending all locked tokens to their owners
        for(uint256 i = 0; i < allInvestors.length; i++) {
            uint256 _balance = investors[allInvestors[i]][_tokenAddress].lockedAmount;
            investors[allInvestors[i]][_tokenAddress].lockedAmount = 0;
            if(_balance > 0) {
                IERC20(_tokenAddress).transfer(allInvestors[i], _balance);
            }
        }
    }

    function transferProjectToken(address _tokenAddress, address _investorAddress) public returns(uint256){
        uint256 _sendingBalance = investors[_investorAddress][_tokenAddress].lockedAmount;
        investors[_investorAddress][_tokenAddress].lockedAmount = 0;
        IERC20(_tokenAddress).transfer(magePadNFTAddress, _sendingBalance);
        return _sendingBalance;
    }

    function withdrawFunds(address _tokenAddress) public {
        require(msg.sender == projects[_tokenAddress].projectOwner, "Only creator of project can withdraw the funds");
        require(projects[_tokenAddress].launchingTokenBalance > 0, "No funds available");
        require(block.timestamp >= projects[_tokenAddress].projectEndingTime, "Project is still ongoing");

        uint256 balance = projects[_tokenAddress].launchingTokenBalance;
        projects[_tokenAddress].launchingTokenBalance = 0;

        IERC20(_tokenAddress).transfer(msg.sender, balance);
    }

    function getProjectEndingTime(address _superTokenAddress) public view returns(uint256) {
        return (projects[_superTokenAddress].projectEndingTime);
    }

    function getInvestor(address _tokenAddress, address _investorAddress) public view returns(uint256) {
        return investors[_investorAddress][_tokenAddress].lockedAmount;
    }

    function checkUnlockStatus(address _tokenAddress) public view returns(bool) {
        return projects[_tokenAddress].allowUnlocking;
    }
}