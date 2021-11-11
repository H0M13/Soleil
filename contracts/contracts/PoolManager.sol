// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PoolManager is Ownable, ChainlinkClient {

    IERC20 public soleilToken;

    // The solar-power-generating sites registered in the dapp
    address[] public solarSites;
    mapping(address => mapping(address => uint256)) public earnedTokensBalance;

    // The users who have staked funds in the dapp
    address[] public stakers;
    mapping(address => mapping(address => uint256)) public stakingBalance;
    mapping(address => uint256) public uniqueTokensStaked;

    // Contract config
    address[] public allowedTokens;
    address public oracle;
    bytes32 public jobId;
    uint256 private fee;

    // Emitted when Chainlink node pushes energy data to this contract
    event EnergyDataReceived(bytes32 data);

    constructor(address _soleilTokenAddress) public {
        soleilToken = IERC20(_soleilTokenAddress);
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }

    function setOracle(address _oracle) public onlyOwner {
        oracle = _oracle;
    }

    function setJobId(bytes32 _jobId) public onlyOwner {
        jobId = _jobId;
    }

    function addAllowedTokens(address token) public onlyOwner {
        allowedTokens.push(token);
    }

    function addTokensToPool(uint256 _amount, address token) public {
        // Require amount greater than 0
        require(_amount > 0, "amount cannot be 0");
        if (tokenIsAllowed(token)) {
            updateUniqueTokensStaked(msg.sender, token);
            IERC20(token).transferFrom(msg.sender, address(this), _amount);
            stakingBalance[token][msg.sender] =
                stakingBalance[token][msg.sender] +
                _amount;
            if (uniqueTokensStaked[msg.sender] == 1) {
                stakers.push(msg.sender);
            }
        }
    }

    function withdrawTokens(address token) public {
        // Fetch balance
        uint256 balance = stakingBalance[token][msg.sender];
        require(balance > 0, "staking balance cannot be 0");
        IERC20(token).transfer(msg.sender, balance);
        stakingBalance[token][msg.sender] = 0;
        uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;
    }

    function tokenIsAllowed(address token) public returns (bool) {
        for (
            uint256 allowedTokensIndex = 0;
            allowedTokensIndex < allowedTokens.length;
            allowedTokensIndex++
        ) {
            if (allowedTokens[allowedTokensIndex] == token) {
                return true;
            }
        }
        return false;
    }

    function updateUniqueTokensStaked(address user, address token) internal {
        if (stakingBalance[token][user] <= 0) {
            uniqueTokensStaked[user] = uniqueTokensStaked[user] + 1;
        }
    }

    function issueTokens() public onlyOwner {
        for (
            uint256 stakersIndex = 0;
            stakersIndex < stakers.length;
            stakersIndex++
        ) {
            address recipient = stakers[stakersIndex];

            // TODO: Get earned tokens from generated mWh data
            soleilToken.transfer(recipient, getEarnedSoleilValue(recipient));
        }
    }

    function getEarnedSoleilValue(address user) public view returns (uint256) {
        uint256 totalValue = 0;
        if (uniqueTokensStaked[user] > 0) {
            for (
                uint256 allowedTokensIndex = 0;
                allowedTokensIndex < allowedTokens.length;
                allowedTokensIndex++
            ) {
                // TODO - Calculate amount and add to totalValue
            }
        }
        return totalValue;
    }

    /// @notice Request today's energy data on all sites from Chainlink node
    /// @return requestId - ID of Chainlink request
    function requestEnergyData() public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
            
        requestId = sendChainlinkRequestTo(oracle, request, fee);

        return requestId;
    }
  
    /// @notice Callback function to receive response
    /// @param _requestId - ID of Chainlink request
    /// @param _data - The resulting energy data in bytes32 format
    function fulfill(bytes32 _requestId, bytes32 _data) public recordChainlinkFulfillment(_requestId)
    {
        emit EnergyDataReceived(_data);
    }
}