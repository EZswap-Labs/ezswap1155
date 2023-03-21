// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MyErc1155Token is ERC1155 {
    uint256 public constant Rock = 1;
    uint256 public constant Paper = 2;
    uint256 public constant Scissors = 3;

    constructor() public ERC1155("https://api.frank.hk/api/nft/demo/1155/marvel/{id}.json") {
        _mint(msg.sender, Rock, 100, "");
        _mint(msg.sender, Paper, 100, "");
        _mint(msg.sender, Scissors, 100, "");
    }
}