pragma solidity ^0.4.18;

contract TestPayable {
	event pay1();
	event pay2();
	event pay3();

	function TestPayable() public{
	}
	
	function buy(address add) public payable {
		require(add != address(0));  
		pay3();
	}

	function buy2() public payable {
		pay2();
	}

	function buy() public payable {
		pay1();
	}
}