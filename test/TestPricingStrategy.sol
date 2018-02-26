pragma solidity ^0.4.18;

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

contract TestPricingStrategy {
	PricingStrategy public pricingStrategy;

	function TestPricingStrategy(PricingStrategy _pricingStrategy) public{
		pricingStrategy = _pricingStrategy;
	}

	function pricing(uint value) public constant returns (uint) {
		 uint tokenAmount = pricingStrategy.calculatePrice(value, 0, 0, msg.sender, 18);
		 return tokenAmount;
	}


}