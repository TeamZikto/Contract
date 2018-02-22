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
	- One token in wei : 10^14 = 100000000000000 
- 3. MultiSigWallet : Ether Wallet for crowdsale
- CROWDSALE.sol : token sale contract
	- token 0xb68c9dEFc9EaafE164B6A7F8559ed114B804475a
	- pricing 0x60e126A80307bBB5d8D7ffA12CD89f9B26EAD075
	- wallet 0x10a653486137b6A354d4c752b0255B602182fFc9
	- start 1519257600
	- end 1520640000
	- beneficiary 0x8154CE4B734e0Ee8104Ae6E5d9AFC32CBC7e5cB7
- Issuer.sol : token transfer contract

## Functions
### ISR
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

### KYC Crowdsale
- 

## Link
- https://github.com/OpenZeppelin/zeppelin-solidity
- https://github.com/TokenMarketNet/ico


- https://ico.readthedocs.io/en/latest/
- http://solidity.readthedocs.io/en/develop/contracts.html#arguments-for-base-constructors

## Account
c52afffe1000d66648cee67cd172f178ee1021f19ee7157f6f7c9526aabefe61

- Owner
https://rinkeby.etherscan.io/address/0x8154CE4B734e0Ee8104Ae6E5d9AFC32CBC7e5cB7
- User1
https://rinkeby.etherscan.io/address/0x3DBD8B5e68209c36A5DD46b8A93c79552E686C06

- ISR Contract
https://rinkeby.etherscan.io/token/0xb68c9dEFc9EaafE164B6A7F8559ed114B804475a
- Pricing
https://rinkeby.etherscan.io/address/0x60e126A80307bBB5d8D7ffA12CD89f9B26EAD075
- Wallet
https://rinkeby.etherscan.io/address/0x10a653486137b6A354d4c752b0255B602182fFc9
- Issuer
https://rinkeby.etherscan.io/address/0x222B80cBf39645D4db38E8228Bb3524fD27f0f2B
- KYC Crowd Sale
https://rinkeby.etherscan.io/address/0x5609c1448fbF8Ddd7F41023f772f91cCA9Ca6Ea5
- Crowd Sale
https://rinkeby.etherscan.io/address/0xaE4c4c86A84e5B0A45cB1eBdC8ee31c0633308e1

## AppCoin
- token : https://etherscan.io/token/0x1a7a8bd9106f2b8d977e08582dc7d24c723ab0db
- Sale
	- Sale 소스는 모두 동일 
	- pricing 다름 
	- AppCoinsPresale
		- https://etherscan.io/address/0xef0f5d9a8435e217038d6417670013cc06aa5e38#readContract
		- Multi Sig Wallet : https://etherscan.io/address/0x5311724c476327db0d5d1fc41cc58a466f3974bd
		- Pricing : https://etherscan.io/address/0xe74be15ae490c348fd75615ceff8657f30ac074c#code
	- AppCoinsCrowdsale
		- https://etherscan.io/address/0xbed45823677e242081f97e2a7c8422f0d9d6b006
		- Multi Sig Wallet : https://etherscan.io/address/0x9e1836e45e88c92926105910d4a5988a1f677181
		- Pricing : https://etherscan.io/address/0x5abc5fb8a0f627df18507664afae3d30649f058d
	- AppCoinsCrowdsale_2 
		- https://etherscan.io/address/0xf42c06a58d4e538b6856afc206b13c530263c2c2
		- Multi Sig Wallet : https://etherscan.io/address/0x71e7c73375efbefdf7b4be67e768d9038dde2488
		- Pricing : https://etherscan.io/address/0x45497ae582794ac6c110ccf6806f652777026889

- Tom : https://etherscan.io/tx/0x186b3399e63d35954040943c28949adb0004b567e219083e7b789890d8e280ac
- 이상한 crowd
	0xbffc17a5a0132fc5db53a00a9e2294cd13f798f031b7941411b1a59bba648fe7 0x2261a56324031cdfdca2011f34740d22174d5e5e 
	0xed88b2241fb26b223abf0692dbddde5b1c867acca228eb873bff14e93ed7b131 0xb41a843673347cd32d3196c94208e2f7a0145dbb	
	0xfb7ab527ea4531638a1c48c8983d1f7fab508a183e770cf0f16a2547b598f231 0xc3dedf8faefb7a3dda8014c66e61a05bf9037d6f 		
	0x91af3f95854d83834a0fc2f7c4bd7bd223a6faaa469b6193d7acc81097dc3a9e 0x3f78c83f85fe41621e3cf81c38ccf917e3852a0a	
	0x28d47dfe32d5c425cc993b644652e084c1c15d51ca24bff9a1d8e1f3f62c7038 0xbd37ae6c4d37fb5ab14c656f96ab9910289e500d 		
	0x178028b2cdbedada827c17e695c6d605bb5d9fb6c37b944fd62f1a4a5e17e332 0x2261a56324031cdfdca2011f34740d22174d5e5e