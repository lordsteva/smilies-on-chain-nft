// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISmileyAttribute.sol";
import { Base64 } from "base64-sol/base64.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SmileyNFT is ERC721, Ownable {
  //counter for incremental token ids
  using Counters for Counters.Counter;
  //allows usage of toString
  using Strings for uint256;

  //token id tracker
  Counters.Counter private _tokenIds;
  //attribute contracts
  ISmileyAttribute[] private attributes;
  //address that can create a new NFT
  address private minter;
  //maps token to its attributes
  mapping(uint256 => uint80[]) private metadata;

  //---------------------------------------
  //MODIFIERS
  modifier minterOnly() {
    require(_msgSender() == minter, "Minter only");
    _;
  }

  constructor(ISmileyAttribute[] memory _attributes) ERC721("Smiley", "SML") {
    minter = msg.sender;
    attributes = _attributes;
  }

  //---------------------------------------
  //FUNCTIONS

  //returns ERC721 compatible metadata for on-chain svg
  function tokenURI(uint256 tokenId)
    public
    view
    override
    returns (string memory)
  {
    require(_exists(tokenId), "ERC721: nonexistent token");
    uint80[] storage _metadata = metadata[tokenId];
    string memory _attributes = "[";

    for (uint24 i = 0; i < attributes.length; i++) {
      _attributes = string(
        abi.encodePacked(
          _attributes,
          i == 0 ? "" : ",",
          '{"trait_type":"',
          attributes[i].getAttributeName(),
          '","value":"',
          attributes[i].getValueName(_metadata[i]),
          '"}'
        )
      );
    }

    _attributes = string(abi.encodePacked(_attributes, "]"));

    string memory json = string(
      abi.encodePacked(
        "{",
        '"description": "Smiley :)",',
        '"name":"On-chain Smiley #',
        tokenId.toString(),
        '","attributes":',
        _attributes,
        ',"image_data":"',
        (createSVG(_metadata)),
        '"}'
      )
    );

    return
      string(
        abi.encodePacked(
          "data:application/json;base64,",
          Base64.encode(bytes(json))
        )
      );
  }

  //creates bse64 svg for given nft
  function createSVG(uint80[] memory nftData)
    internal
    view
    returns (string memory)
  {
    string memory data = "";
    for (uint16 i = 0; i < attributes.length; i++) {
      data = string(
        abi.encodePacked(data, attributes[i].getSVGData(nftData[i]))
      );
    }
    data = string(
      abi.encodePacked(
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">',
        data,
        "</svg>"
      )
    );
    return
      string(
        abi.encodePacked("data:image/svg+xml,", Base64.encode(bytes(data)))
      );
  }

  //creates a new NFT
  function mint() public minterOnly returns (uint256) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _mint(msg.sender, newItemId);
    for (uint16 i = 0; i < attributes.length; i++) {
      metadata[newItemId].push(attributes[i].pickRandomValue());
    }
    return newItemId;
  }
}
