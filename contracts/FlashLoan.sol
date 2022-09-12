// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./Token.sol";

contract FlashLoan{
    Token public token;

    constructor(address _tokenAddress) {
        token = Token(_tokenAddress);
    }

    function depositTokens(uint _amount) external{
        token.transferFrom(msg.sender, address(this), _amount);
    }
}
