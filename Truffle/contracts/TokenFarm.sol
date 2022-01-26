 //SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

contract TokenFarm {
    address[] public allowedTokens;
    //mapping tokenAddress => stakerAddress => amount
    mapping(address => mapping(address => uint256)) public stakingBalance;
    address[] public stakers;
    mapping(address => uint256) public uniqueTokensStaked;
    IERC20 public mageToken;

    constructor(address _mageTokenAddress) {
        mageToken = IERC20(_mageTokenAddress);
    }

    function stakeTokens(uint256 _amount, address _token, address _nftowner) public {
        require(_amount > 0, "Amount needs to be more than zero");
        //require(tokenIsAllowed(_token), "Token is not allowed to be staked");

        //ntf must approve TokenFarm contract befor calling the stakeTokens function
        ISuperToken(_token).transferFrom(msg.sender, address(this), _amount);
        //updateUniqueTokensStaked(msg.sender, _token);
        stakingBalance[_token][_nftowner] = stakingBalance[_token][_nftowner] + _amount;
        //if(uniqueTokensStaked[msg.sender] == 1) {
        //    stakers.push(msg.sender);
        //}
    }

    function _claimTokens(address _nftowner, uint256 _balance) internal {
        mageToken.transfer(_nftowner, (2 * _balance));
        /*for(uint256 stakersIndex = 0; stakersIndex < stakers.length; stakersIndex++) {
            address reciepient = stakers[stakersIndex];
            uint256 amount = 10;
            //send them a token reward
            //based on their total value locked
            mageToken.transfer(reciepient, amount);
        }*/
    }

    function unstakeTokens(address _token, address _nftowner) public {
        uint256 balance = stakingBalance[_token][_nftowner];
        require(balance > 0, "Staking cannot be zero");
        stakingBalance[_token][_nftowner] = 0;
        //uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;
        _claimTokens(_nftowner, balance);
        ISuperToken(_token).transfer(msg.sender, balance);
    }
/*
    function updateUniqueTokensStaked(address _user, address _token) internal {
        if(stakingBalance[_token][_user] <= 0) {
            uniqueTokensStaked[_user] = uniqueTokensStaked[_user] + 1;
        }
    }
*/
    function updateNFTOwner(address _token, address _oldowner, address _newowner) public {
        uint256 balance = stakingBalance[_token][_oldowner];
        stakingBalance[_token][_oldowner] = 0;
        stakingBalance[_token][_newowner] = stakingBalance[_token][_newowner] + balance; 
    }

    function tokenIsAllowed(address _token) public view returns(bool) {
        for(uint256 allowedTokensIndex = 0; allowedTokensIndex < allowedTokens.length; allowedTokensIndex++) {
            if(allowedTokens[allowedTokensIndex] == _token) {
                return true;
            }
        }
        return false;
    }

    function addAllowedTokens(address _token) public {
        allowedTokens.push(_token);
    }
}