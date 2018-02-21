## Requirment
- solidty 0.4.18 above


## ISR
- name : Insureum
- syombol : ISR
- initialSupply : 297M (297000000000000000000000000)
- decimals : 18


## SRC
- 1. ISR.sol : ERC20 Token
- 2. PricingStrategy.sol : Interface for defining crowdsale pricing
- 3. MultiSigWallet : Ether Wallet for crowdsale
- CROWDSALE.sol : token sale contract

- Issuer.sol : token transfer contract

## Functions
- ERC20
	- Total Supply
	- Balance Of
	- Transfer
	- Allowance
	- TransferFrom
	- Approve
- ReleasableToken
	- Set Release Agent : Set the contract that can call release and make the token transferable.
	- Set Transfer Agent : Owner can allow a particular address (a crowdsale contract) to transfer tokens despite the lock up period
	- Release Token Transfer : Can be called only from the release agent that is the final ICO contract. It is only called if the crowdsale has been succes
- MintableToken
	- Mint : Create new tokens and allocate them to an address
	- Set Mint Agent : 
- UpgradeableToken 
	- Upgrade : Allow the token holder to upgrade some of their tokens to a new contract.
	- Set Upgrade Agent
	- Set Upgrade Master
- CrowdsaleToken
	- Set Token Information : Owner can update token information here.
- StandardToken
	- Increase Approval
	- Decrease Approval
- Ownable
	- Transfer Ownership
- AMLToken
	- Transfer To Onwer : owner can reclaim the tokens to from a participant

## Link
- https://github.com/OpenZeppelin/zeppelin-solidity
- https://github.com/TokenMarketNet/ico


- https://ico.readthedocs.io/en/latest/
- http://solidity.readthedocs.io/en/develop/contracts.html#arguments-for-base-constructors

## Account
- Owner
0x8154CE4B734e0Ee8104Ae6E5d9AFC32CBC7e5cB7
- User1
0x3DBD8B5e68209c36A5DD46b8A93c79552E686C06

- ISR Contract
0xb68c9dEFc9EaafE164B6A7F8559ed114B804475a


## AppCoin
- token : https://etherscan.io/token/0x1a7a8bd9106f2b8d977e08582dc7d24c723ab0db
- Crowd Pre Sale : https://etherscan.io/address/0xef0f5d9a8435e217038d6417670013cc06aa5e38#readContract
- Multi Sig Wallet : https://etherscan.io/address/0x5311724c476327db0d5d1fc41cc58a466f3974bd
- FlatPricing :https://etherscan.io/address/0xe74be15ae490c348fd75615ceff8657f30ac074c#code