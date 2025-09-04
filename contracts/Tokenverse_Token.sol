// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenverseToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("TokenverseToken", "TVT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /// @dev Mint new tokens (only owner can call)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
