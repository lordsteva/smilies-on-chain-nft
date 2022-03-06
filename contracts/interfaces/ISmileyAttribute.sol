// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ISmileyAttribute {
  //returns name of the attributte
  function getAttributeName() external view returns (string memory);

  //retrives name of i-th value
  function getValueName(uint80 index) external view returns (string memory);

  //returns SVG string of i-th value
  function getSVGData(uint80 index) external view returns (string memory);

  //"randomly" picks value taking weights into consideration
  function pickRandomValue() external view returns (uint80 value);

  //return how much points certain value worth
  function getPoints(uint80 index) external view returns (uint256 value);
}
