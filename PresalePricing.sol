/**
 * This smart contract code is Copyright 2017 TokenMarket Ltd. For more information see https://tokenmarket.net
 *
 * Licensed under the Apache License, version 2.0: https://github.com/TokenMarketNet/ico/blob/master/LICENSE.txt
 */

pragma solidity ^0.4.18;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() public {
    owner = msg.sender;
  }


  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }


  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));      
    owner = newOwner;
  }

}

/**
 * Interface for defining crowdsale pricing.
 */
contract PricingStrategy {

  /** Interface declaration. */
  function isPricingStrategy() public pure returns (bool) {
    return true;
  }

  /** Self check if all references are correctly set.
   *
   * Checks that pricing strategy matches crowdsale parameters.
   */
  function isSane(address crowdsale) public pure returns (bool) {
    require(crowdsale != address(0));
    return true;
  }

  /**
   * @dev Pricing tells if this is a presale purchase or not.
     @param purchaser Address of the purchaser
     @return False by default, true if a presale purchaser
   */
  function isPresalePurchase(address purchaser) public pure returns (bool) {
    require(purchaser != address(0));
    return false;
  }

  /**
   * When somebody tries to buy tokens for X eth, calculate how many tokens they get.
   *
   *
   * @param value - What is the value of the transaction send in as wei
   * @param tokensSold - how much tokens have been sold this far
   * @param weiRaised - how much money has been raised this far in the main token sale - this number excludes presale
   * @param msgSender - who is the investor of this transaction
   * @param decimals - how many decimal units the token has
   * @return Amount of tokens the investor receives
   */
  function calculatePrice(uint value, uint weiRaised, uint tokensSold, address msgSender, uint decimals) public constant returns (uint tokenAmount);
}

/**
 * This smart contract code is Copyright 2017 TokenMarket Ltd. For more information see https://tokenmarket.net
 *
 * Licensed under the Apache License, version 2.0: https://github.com/TokenMarketNet/ico/blob/master/LICENSE.txt
 */


/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
    
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
  
}


/**
 * Fixed crowdsale pricing - everybody gets the same price.
 */
contract FlatPricing is PricingStrategy {

  using SafeMath for uint256;

  /* How many weis one token costs */
  uint public oneTokenInWei;

  function FlatPricing(uint _oneTokenInWei) public {
    require(_oneTokenInWei > 0);
    oneTokenInWei = _oneTokenInWei;
  }

  /**
   * Calculate the current price for buy in amount.
   *
   */
  function calculatePrice(uint value, uint /*weiRaised*/, uint /*tokensSold*/, address /*msgSender*/, uint decimals) public constant returns (uint) {
    uint multiplier = 10 ** decimals;
    return value.mul(multiplier) / oneTokenInWei;
  }

}

/**
 * Fixed crowdsale pricing - everybody gets the same price.
 */
contract FlatMinMaxPricing is PricingStrategy {

  using SafeMath for uint256;

  /* How many weis one token costs */
  uint public oneTokenInWei;
  uint public minWei;
  uint public maxWei;

  function FlatMinMaxPricing(uint _oneTokenInWei, uint _minWei, uint _maxWei) public {
    require(_oneTokenInWei > 0);
    require(_minWei > 0);
    require(_maxWei > 0);
    oneTokenInWei = _oneTokenInWei;
    minWei = _minWei;
    maxWei = _maxWei;
  }

  /**
   * Calculate the current price for buy in amount.
   *
   */
  function calculatePrice(uint value, uint /*weiRaised*/, uint /*tokensSold*/, address /*msgSender*/, uint decimals) public constant returns (uint) {
    if (value < minWei) {
      return 0;
    }
    if (vale > maxWei) {
      return 0;
    }
    uint multiplier = 10 ** decimals;
    return value.mul(multiplier) / oneTokenInWei;
  }

}


/**
 * Fixed crowdsale pricing - everybody gets the same price.
 */
contract PresalePricing is PricingStrategy, Ownable {

  using SafeMath for uint256;

  mapping (address => uint) public preicoAddresses;

  function PresalePricing() public {

  }

  function setPreicoAddress(address preicoAddress, uint pricePerToken)
    public
    onlyOwner
  {
    preicoAddresses[preicoAddress] = pricePerToken;
  }

  /**
   * Calculate the current price for buy in amount.
   *
   */
  function calculatePrice(uint value, uint /*weiRaised*/, uint /*tokensSold*/, address msgSender, uint decimals) public constant returns (uint) {
    uint multiplier = 10 ** decimals;

    // This investor is coming through pre-ico
    if(preicoAddresses[msgSender] <= 0) {
      return 0;
    }
    return value.mul(multiplier) / preicoAddresses[msgSender];
  }

}