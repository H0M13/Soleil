// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StpProperty is ERC721, Ownable {

    struct Property {
        string propertyNameOrNumber;
        string streetName;
        string postCode;
    }

    Property[] public properties;
    string private _baseURIextended;

    event CreateProperty(uint256 tokenId);

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {
    }

    function createProperty (
        address propertyOwner,
        string memory propertyNameOrNumber,
        string memory streetName,
        string memory postCode
    ) public onlyOwner {
        uint256 newPropertyId = properties.length;
        properties.push(
            Property(
                propertyNameOrNumber,
                streetName,
                postCode
            )
        );
        _safeMint(propertyOwner, newPropertyId);
        emit CreateProperty(newPropertyId);
    }

    function setBaseURI(string memory baseURI_) external onlyOwner() {
        _baseURIextended = baseURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    function getNumberOfProperties() public view returns (uint256) {
        return properties.length; 
    }

    function getPropertyDetails(uint256 tokenId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory
        )
    {
        return (
            properties[tokenId].propertyNameOrNumber,
            properties[tokenId].streetName,
            properties[tokenId].postCode
        );
    }
}