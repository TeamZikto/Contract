pragma solidity ^0.4.25;

import "./AMLToken.sol";

contract BatchTransfer is Ownable {
  using SafeMath for uint256;

  address 	public agent;
  AMLToken 	public token;

  event SetToken(address token);

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier onlyAgent() {
    require(msg.sender == agent);
    _;
  }

  constructor() public {
    token = AMLToken(0);
    agent = address(0);
  }

  /*
   * Only owner can set an agent for batch transfer. if agent == address(0), it means reset/clear.
   */
  function setBatchTransferAgent(address addr) onlyOwner public {
    /* `addr` can be address(0)` that means reset */
    agent = addr;
  }

  /*
   * Only owner can set token for batch transferring. if addr == address(0), it means reset/clear.
   * And of course, `addr` can not be owner.
   */
  function setToken(address addr) onlyOwner public {
    require(addr != msg.sender);
    token = AMLToken(addr);
    emit SetToken(addr);
  }

  /*
   * When _needCompute is true, the _values must be with decimal point. This is useful for some case like airdrop.
   & If it is false, the _values must be (multiplied with 10^18).
   */
  function batch_transfer(address[] _to, uint256[] _values, uint256 _total, bool _needCompute) onlyAgent public {

    require(token != address(0));
    require(agent != address(0));

    uint256 decimalFactor = (_needCompute) ? 10**uint256(18) : 1;

    // caller must confirm the sum of `_values` are same with value of `_total`
    require(token.balanceOf(this) >= (_total * decimalFactor));

    uint16 i = 0;
    uint16 length = uint16(_to.length);
    while (i < length) {
      // Tokens will be charged to `this` contract (BulkTranser), not the caller account.
      // Gas will be charged to the caller account.
      token.transfer(_to[i], _values[i] * decimalFactor);
      i += 1;
    }
  }

  function balanceOf() public view onlyAgent returns (uint256 balance) {
    require(token != address(0));
    return token.balanceOf(this);
  }
}
