// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import './SoleilToken.sol';

contract PoolManager is Ownable {

    using SafeMath for uint256;
    using MerkleProof for bytes32[];
    
    mapping(uint256 => bytes32) daiRoots;
    mapping(uint256 => bytes32) sllRoots;
    
    uint256 currentDaiPaymentCycleStartBlock;
    uint256 currentSllPaymentCycleStartBlock;

    SoleilToken public sllToken;
    IERC20 public daiToken;

    address public chainlinkNodeAddress;

    uint public withdrawnDaiTokens;  // The total DAI withdrawn
    uint public withdrawnSllTokens;  // The total SLL withdrawn

    uint256 public numDaiPaymentCycles = 1;
    uint256 public numSllPaymentCycles = 1;
    mapping (address => uint256) public sllWithdrawn;
    mapping (address => uint256) public daiWithdrawn;

    mapping (uint256 => uint256) public timestampToDaiToDistribute;
    mapping (address => mapping (uint256 => uint256)) public addressToTimestampToDaiToDistribute;

    event DaiPaymentCycleEnded(uint256 daiPaymentCycle, uint256 startBlock, uint256 endBlock);
    event SllPaymentCycleEnded(uint256 sllPaymentCycle, uint256 startBlock, uint256 endBlock);
    event Withdraw(address indexed recipient, uint value, string ticker);
    event DaiPayoutScheduleSet(uint256 amount, uint256 numOfDays);

    constructor(address _sllTokenAddress, address _daiTokenAddress, address _chainlinkNodeAddress) {
        sllToken = SoleilToken(_sllTokenAddress);
        daiToken = IERC20(_daiTokenAddress);
        chainlinkNodeAddress = _chainlinkNodeAddress;
        currentDaiPaymentCycleStartBlock = block.number;
        currentSllPaymentCycleStartBlock = block.number;
    }

    function setDaiPayoutSchedule(uint256 _amount, uint256 _numOfDays) public returns(bool) {
        require(_numOfDays <= 100, "100 days maximum schedule length exceeded.");
        uint256 allowance = daiToken.allowance(msg.sender, address(this));
        require(allowance >= _amount, "Insufficient DAI token allowance");
        daiToken.transferFrom(msg.sender, address(this), _amount);
        uint256 dailyDistribution = _amount.div(_numOfDays);
        uint256 fullDaysSinceEpoch = block.timestamp.div(86400);
        uint256 timestamp = 0;
        for(uint i=0; i < _numOfDays; i++){
          timestamp = fullDaysSinceEpoch.add(i.add(1)).mul(1 days);
            timestampToDaiToDistribute[timestamp] = timestampToDaiToDistribute[timestamp].add(dailyDistribution);
            addressToTimestampToDaiToDistribute[msg.sender][timestamp] = addressToTimestampToDaiToDistribute[msg.sender][timestamp].add(dailyDistribution);
        }
        emit DaiPayoutScheduleSet(_amount, _numOfDays);
        return true;
    }

    modifier onlyChainlinkNode() {
        require(chainlinkNodeAddress == msg.sender,'Only Chainlink node can call this function');
        _;
    }

    function submitSllMerkleRoot(bytes32 _root) public onlyChainlinkNode returns(bool) {
        sllRoots[numSllPaymentCycles] = _root;

        startNewSllPaymentCycle();

        return true;
    }

    function submitDaiMerkleRoot(bytes32 _root) public onlyChainlinkNode returns(bool) {
        daiRoots[numDaiPaymentCycles] = _root;

        startNewDaiPaymentCycle();

        return true;
    }

    function withdrawSll(uint256 _value, bytes memory _proof) public {
        require(_value != 0, "The withdraw amount must not be zero.");

        // Calculate how much SLL the user may withdraw
        uint256 balance = sllBalanceForProof(_proof);
        require(balance >= _value, "The proof could not be verified.");

        sllWithdrawn[msg.sender] = sllWithdrawn[msg.sender].add(_value);

        sllToken.mint(msg.sender, _value);
        withdrawnSllTokens += _value;
        emit Withdraw(msg.sender, _value, 'SLL');
    }

    function withdrawDai(uint256 _value, bytes memory _proof) public {
        require(_value != 0, "The withdraw amount must not be zero.");
        require(daiToken.balanceOf(address(this)) >= _value, "The PoolManager does not have enough DAI to make this withdrawal.");

        // Calculate how much DAI the user may withdraw
        uint256 balance = daiBalanceForProof(_proof);
        require(balance >= _value, "The proof could not be verified.");

        daiWithdrawn[msg.sender] = daiWithdrawn[msg.sender].add(_value);

        require(daiToken.transfer(msg.sender, _value));
        withdrawnDaiTokens += _value;
        emit Withdraw(msg.sender, _value, 'DAI');
    }

    function masterWithdrawDai(uint _value, address _recipient) onlyOwner public returns(bool) {
      require(daiToken.balanceOf(address(this)) >= _value, "The PoolManager does not have enough DAI to make this withdrawal.");
      daiToken.transferFrom(address(this), _recipient, _value);
      return true;
    }

    function daiBalanceForProof(bytes memory _proof) public view returns(uint256) {
        return daiBalanceForProofWithAddress(msg.sender, _proof);
    }

    function sllBalanceForProof(bytes memory _proof) public view returns(uint256) {
        return sllBalanceForProofWithAddress(msg.sender, _proof);
    }

    function startNewDaiPaymentCycle() internal onlyOwner returns(bool) {
        require(block.number > currentDaiPaymentCycleStartBlock);

        emit DaiPaymentCycleEnded(numDaiPaymentCycles, currentDaiPaymentCycleStartBlock, block.number);

        numDaiPaymentCycles = numDaiPaymentCycles.add(1);
        currentDaiPaymentCycleStartBlock = block.number.add(1);

        return true;
    } 

    function startNewSllPaymentCycle() internal onlyOwner returns(bool) {
        require(block.number > currentSllPaymentCycleStartBlock);

        emit SllPaymentCycleEnded(numSllPaymentCycles, currentSllPaymentCycleStartBlock, block.number);

        numSllPaymentCycles = numSllPaymentCycles.add(1);
        currentSllPaymentCycleStartBlock = block.number.add(1);

        return true;
    } 

    function daiBalanceForProofWithAddress(address _address, bytes memory proof) public view returns(uint256) {
        bytes32[] memory meta;
        bytes32[] memory _proof;

        (meta, _proof) = splitIntoBytes32(proof, 2);
        if (meta.length != 2) { return 0; }

        uint256 daiPaymentCycleNumber = uint256(meta[0]);
        uint256 cumulativeAmount = uint256(meta[1]);
        if (daiRoots[daiPaymentCycleNumber] == 0x0) { return 0; }

        bytes32 leaf = keccak256(
                                 abi.encodePacked(
                                                  _address,
                                                  cumulativeAmount
                                                  )
                                 );
        if (daiWithdrawn[_address] < cumulativeAmount &&
            _proof.verify(daiRoots[daiPaymentCycleNumber], leaf)) {
          return cumulativeAmount.sub(daiWithdrawn[_address]);
        } else {
          return 0;
        }
    }

    function sllBalanceForProofWithAddress(address _address, bytes memory proof) public view returns(uint256) {
        bytes32[] memory meta;
        bytes32[] memory _proof;

        (meta, _proof) = splitIntoBytes32(proof, 2);
        if (meta.length != 2) { return 0; }

        uint256 sllPaymentCycleNumber = uint256(meta[0]);
        uint256 cumulativeAmount = uint256(meta[1]);
        if (sllRoots[sllPaymentCycleNumber] == 0x0) { return 0; }

        bytes32 leaf = keccak256(
                                 abi.encodePacked(
                                                  _address,
                                                  cumulativeAmount
                                                  )
                                 );
        if (sllWithdrawn[_address] < cumulativeAmount &&
            _proof.verify(sllRoots[sllPaymentCycleNumber], leaf)) {
          return cumulativeAmount.sub(sllWithdrawn[_address]);
        } else {
          return 0;
        }
    }

    function splitIntoBytes32(bytes memory byteArray, uint256 numBytes32) internal pure returns (bytes32[] memory bytes32Array,
                                                                                        bytes32[] memory remainder) {
        if ( byteArray.length % 32 != 0 ||
             byteArray.length < numBytes32.mul(32) ||
             byteArray.length.div(32) > 50) { // Arbitrarily limiting this function to an array of 50 bytes32's to conserve gas

          bytes32Array = new bytes32[](0);
          remainder = new bytes32[](0);
          return (bytes32Array, remainder);
        }

        bytes32Array = new bytes32[](numBytes32);
        remainder = new bytes32[](byteArray.length.sub(64).div(32));
        bytes32 _bytes32;
        for (uint256 k = 32; k <= byteArray.length; k = k.add(32)) {
          assembly {
            _bytes32 := mload(add(byteArray, k))
          }
          if(k <= numBytes32*32){
            bytes32Array[k.sub(32).div(32)] = _bytes32;
          } else {
            remainder[k.sub(96).div(32)] = _bytes32;
          }
        }
    }
}