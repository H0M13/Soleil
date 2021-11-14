// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleDropManager is Ownable {

    bytes32 public sllRoot;
    bytes32 public daiRoot;
    IERC20 public sllToken;
    IERC20 public daiToken;

    uint public withdrawnDaiTokens;  // The total DAI withdrawn
    uint public withdrawnSllTokens;  // The total SLL withdrawn

    mapping (address => uint256) public sllWithdrawn;
    mapping (address => uint256) public daiWithdrawn;

    mapping (address => bytes32) public lastClaimedDaiDropRoot; // The root of the last DAI drop claimed by the address
    mapping (address => bytes32) public lastClaimedSllDropRoot; // The root of the last SLL drop claimed by the address

    event Withdraw(address recipient, uint value, string ticker);

    constructor(address _sllTokenAddress, address _daiTokenAddress) public {
        sllToken = IERC20(_sllTokenAddress);
        daiToken = IERC20(_daiTokenAddress);
    }

    function setSllMerkleRoot(bytes32 _root) public {
        root = _root;
    }

    function setDaiMerkleRoot(bytes32 _root) public {
        root = _root;
    }

    function withdrawSll(uint value, bytes32[] memory proof) public {
        require(value != 0, "The withdraw amount must not be zero.");
        require(verifyEntitled(msg.sender, value, proof), "The proof could not be verified.");
        require(lastClaimedSllDropRoot[msg.sender] != sllRoot, "You have already withdrawn tokens in the most recent SLL drop.");
        require(sllToken.balanceOf(address(this)) >= value, "The MerkleDropManager does not have enough SLL to make this withdrawal.");

        lastClaimedSllDropRoot[msg.sender] = root;
        sllWithdrawn += value;

        require(sllToken.transfer(msg.sender, value));
        emit Withdraw(msg.sender, value, 'SLL');
    }

    function withdrawDai(uint value, bytes32[] memory proof) public {
        require(value != 0, "The withdraw amount must not be zero.");
        require(verifyEntitled(msg.sender, value, proof), "The proof could not be verified.");
        require(lastClaimedDaiDropRoot[msg.sender] != daiRoot, "You have already withdrawn tokens in the most recent DAI drop.");
        require(daiToken.balanceOf(address(this)) >= value, "The MerkleDropManager does not have enough DAI to make this withdrawal.");

        lastClaimedDaiDropRoot[msg.sender] = root;
        daiWithdrawn += value;

        require(daiToken.transfer(msg.sender, value));
        emit Withdraw(msg.sender, value, 'DAI');
    }

    function verifyEntitled(address recipient, uint value, bytes32[] memory proof, bool dai) public view returns (bool) {
        // We need to pack the 20 bytes address to the 32 bytes value
        // to match with the proof made with the merkle-drop package
        bytes32 leaf = keccak256(abi.encodePacked(recipient, value));
        return verifyProof(leaf, proof, dai);
    }

    function verifyProof(bytes32 leaf, bytes32[] memory proof, bool dai) internal view returns (bool) {
        bytes32 currentHash = leaf;

        for (uint i = 0; i < proof.length; i += 1) {
            currentHash = parentHash(currentHash, proof[i]);
        }

        if (dai) {
            return currentHash == daiRoot;
        }
        return currentHash == sllRoot;
    }

    function parentHash(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        if (a < b) {
            return keccak256(abi.encode(a, b));
        } else {
            return keccak256(abi.encode(b, a));
        }
    }
}