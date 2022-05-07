// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface ISmileyNFT is IERC721 {
    //fired when new smiley is created
    event SmileyMinted(uint256 indexed smiileyId);

    //create a new smiley
    //only minter should be allowed
    function mint() external returns (uint256);

    //allow owner to set minter contract
    function setMinter(address _minter) external;

    //change the implementation of an attribute contract
    function changeAttributeContract(address newContract, uint256 index)
        external;

    //return points of a desired token
    function getPoints(uint256 tokenId) external returns (uint256);
}
