// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MerkleDropManager {

    bytes32 public root;
    ERC20Interface public droppedToken;

    uint public initialBalance;
    uint public remainingValue;  // The total of not withdrawn entitlements
    uint public spentTokens;  // The total tokens withdrawn

    mapping (address => bool) public withdrawn;

    event Withdraw(address recipient, uint value);

    constructor(ERC20Interface _droppedToken, uint _initialBalance, bytes32 _root, uint _decayStartTime, uint _decayDurationInSeconds) public {
        // The _initialBalance should be equal to the sum of airdropped tokens
        droppedToken = _droppedToken;
        initialBalance = _initialBalance;
        remainingValue = _initialBalance;
        root = _root;
    }

    function withdraw(uint value, bytes32[] memory proof) public {
        require(value != 0, "The withdraw amount must not be zero.");
        require(verifyEntitled(msg.sender, value, proof), "The proof could not be verified.");
        // TODO: Alter to support multiple drops
        require(!withdrawn[msg.sender], "You have already withdrawn your entitled token.");
        require(droppedToken.balanceOf(address(this)) >= value, "The MerkleDropManager does not have enough tokens to make this withdrawal.");

        withdrawn[msg.sender] = true;
        remainingValue -= value;
        spentTokens += value;

        require(droppedToken.transfer(msg.sender, value));
        emit Withdraw(msg.sender, value);
    }

    function verifyEntitled(address recipient, uint value, bytes32[] memory proof) public view returns (bool) {
        // We need to pack the 20 bytes address to the 32 bytes value
        // to match with the proof made with the merkle-drop package
        bytes32 leaf = keccak256(abi.encodePacked(recipient, value));
        return verifyProof(leaf, proof);
    }

    function verifyProof(bytes32 leaf, bytes32[] memory proof) internal view returns (bool) {
        bytes32 currentHash = leaf;

        for (uint i = 0; i < proof.length; i += 1) {
            currentHash = parentHash(currentHash, proof[i]);
        }

        return currentHash == root;
    }

    function parentHash(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        if (a < b) {
            return keccak256(abi.encode(a, b));
        } else {
            return keccak256(abi.encode(b, a));
        }
    }
}