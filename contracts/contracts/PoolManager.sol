// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import './SoleilToken.sol';

/// @title Soleil pool manager contract
/// @dev Alpha - do not use in production
contract PoolManager is Ownable {

    using SafeMath for uint256;
    
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

    /// @param _sllTokenAddress The address of the deployed SLL token contract
    /// @param _daiTokenAddress The address of the DAI token contract
    /// @param _chainlinkNodeAddress The address of the Chainlink node which is permitted to submit merkle roots to this contract
    /// @dev To decentralise the submission of merkle roots an array of Chainlink nodes may need to be permitted going forward
    constructor(address _sllTokenAddress, address _daiTokenAddress, address _chainlinkNodeAddress) {
        sllToken = SoleilToken(_sllTokenAddress);
        daiToken = IERC20(_daiTokenAddress);
        chainlinkNodeAddress = _chainlinkNodeAddress;
        currentDaiPaymentCycleStartBlock = block.number;
        currentSllPaymentCycleStartBlock = block.number;
    }

    /// @notice After approving this contract to spend the user's DAI, call this function to set a distribution schedule for the DAI, for up to 100 days from now
    /// @param _amount The amount of DAI to be included in the distribution schedule
    /// @param _numOfDays The number of days from now to distribute the DAI to solar sites over 
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

    /// @notice Only permit the Chainlink node regsitered in the contract constructor to call a function with this modifier
    modifier onlyChainlinkNode() {
        require(chainlinkNodeAddress == msg.sender,'Only Chainlink node can call this function');
        _;
    }

    /// @notice Submit a merkle root for the SLL earnings data. Begins a new SLL payment cycle
    /// @param _root The merkle root
    function submitSllMerkleRoot(bytes32 _root) public onlyChainlinkNode returns(bool) {
        sllRoots[numSllPaymentCycles] = _root;

        startNewSllPaymentCycle();

        return true;
    }

    /// @notice Submit a merkle root for the DAI earnings data. Begins a new DAI payment cycle
    /// @param _root The merkle root
    function submitDaiMerkleRoot(bytes32 _root) public onlyChainlinkNode returns(bool) {
        daiRoots[numDaiPaymentCycles] = _root;

        startNewDaiPaymentCycle();

        return true;
    }

    /// @notice Claim SLL tokens by submitting an amount and a merkle proof. Allows for claims of partial claimable amounts. SLL tokens are minted by this contract
    /// @param _value The amount of SLL this claim is for
    /// @param _proof A merkle proof to be verified against the contract's latest SLL merkle root
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

    /// @notice Claim DAI by submitting an amount and a merkle proof. Allows for claim of partial claimable amounts
    /// @param _value The amount of DAI this claim is for
    /// @param _proof A merkle proof to be verified against the contract's latest DAI merkle root
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

    /// @notice A dev function to allow withdrawal of test DAI from the contract. Preferably not required in production version of this contract
    /// @param The amount of DAI to withdraw
    /// @param The address to send the DAI to
    function masterWithdrawDai(uint _value, address _recipient) onlyOwner public returns(bool) {
      require(daiToken.balanceOf(address(this)) >= _value, "The PoolManager does not have enough DAI to make this withdrawal.");
      daiToken.transferFrom(address(this), _recipient, _value);
      return true;
    }

    /// @notice Fetch the claimable DAI for the msg sender with a merkle proof
    /// @param _proof The merkle proof
    /// @dev The claimable amount is equal to the amount in the cumulative earnings data stream minus the amount already claimed by the user
    /// @return The claimable amount of DAI
    function daiBalanceForProof(bytes memory _proof) public view returns(uint256) {
        return daiBalanceForProofWithAddress(msg.sender, _proof);
    }

    /// @notice Fetch the claimable SLL for the msg sender with a merkle proof
    /// @param _proof The merkle proof
    /// @dev The claimable amount is equal to the amount in the cumulative earnings data stream minus the amount already claimed by the user
    /// @return The claimable amount of SLL
    function sllBalanceForProof(bytes memory _proof) public view returns(uint256) {
        return sllBalanceForProofWithAddress(msg.sender, _proof);
    }

    /// @notice Start a new DAI payment cycle
    function startNewDaiPaymentCycle() internal onlyChainlinkNode returns(bool) {
        require(block.number > currentDaiPaymentCycleStartBlock);

        emit DaiPaymentCycleEnded(numDaiPaymentCycles, currentDaiPaymentCycleStartBlock, block.number);

        numDaiPaymentCycles = numDaiPaymentCycles.add(1);
        currentDaiPaymentCycleStartBlock = block.number.add(1);

        return true;
    } 

    /// @notice Start a new SLL payment cycle
    function startNewSllPaymentCycle() internal onlyChainlinkNode returns(bool) {
        require(block.number > currentSllPaymentCycleStartBlock);

        emit SllPaymentCycleEnded(numSllPaymentCycles, currentSllPaymentCycleStartBlock, block.number);

        numSllPaymentCycles = numSllPaymentCycles.add(1);
        currentSllPaymentCycleStartBlock = block.number.add(1);

        return true;
    } 

    /// @notice Fetch the claimable DAI for an address with a merkle proof
    /// @param _address The address to check DAI balance of
    /// @param _proof The merkle proof
    /// @dev The claimable amount is equal to the amount in the cumulative earnings data stream minus the amount already claimed by the user
    /// @return The claimable amount of DAI
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
        
        if (daiWithdrawn[_address] < cumulativeAmount && MerkleProof.verify(_proof, daiRoots[daiPaymentCycleNumber], leaf)) {
          return cumulativeAmount.sub(daiWithdrawn[_address]);
        } else {
          return 0;
        }
    }

    /// @notice Fetch the claimable SLL for an address with a merkle proof
    /// @param _address The address to check SLL balance of
    /// @param _proof The merkle proof
    /// @dev The claimable amount is equal to the amount in the cumulative earnings data stream minus the amount already claimed by the user
    /// @return The claimable amount of SLL
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
        if (sllWithdrawn[_address] < cumulativeAmount && MerkleProof.verify(_proof, sllRoots[sllPaymentCycleNumber], leaf)) {
          return cumulativeAmount.sub(sllWithdrawn[_address]);
        } else {
          return 0;
        }
    }

    /// @notice Split a byte array into a specified number of bytes32 data types
    /// @param byteArray The byte array to split
    /// @param numBytes32 The desired amount of bytes32 data types
    /// @return An array of the bytes32 data types and a second array of any remainder bytes32 data types beyond the desired amount
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
