// /**
//  * @title ChallengeContract
//  */

pragma solidity 0.4.25;

// contract ERC20Interface {
//     function totalSupply() public view returns (uint);
//     function balanceOf(address tokenOwner) public view returns (uint balance);
//     function allowance(address tokenOwner, address spender) public view returns (uint remaining);
//     function transfer(address to, uint tokens) public returns (bool success);
//     function approve(address spender, uint tokens) public returns (bool success);
//     function transferFrom(address from, address to, uint tokens) public returns (bool success);

//     event Transfer(address indexed from, address indexed to, uint tokens);
//     event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
// }

// contract ChallengeMain {
//     address private owner;
//     address private tokenAddress;
//     uint private roomId;
//     uint private amount;
//     uint private prize;

//     enum State { Init, Ready, SuccessAndPaid, FailAndColleteced }

//     mapping (address => State) internal map;
//     mapping (uint => address) internal userId;


//     event Join(address indexed from, uint amount);
//     event SuccessAndPaid(uint userId);
//     event FailAndCollected(uint userId);

//     constructor(address _tokenAddress) public {
//         require(_tokenAddress != address(0), "insureumAddress must not be NULL value.");
//         tokenAddress = _tokenAddress;
//         owner = msg.sender;
//     }

//     function join(uint _userId, uint amount, uint gameId) public {
//         require(map[msg.sender] == State.Init, "Already have joined the challenge");
//         require(
//             ERC20Interface(tokenAddress).approve(this, amount),
//             "token.transferFrom failed !!"
//         );
//         require(
//             ERC20Interface(tokenAddress).transferFrom(msg.sender, address(this), amount),
//             "token.transferFrom failed !!"
//         );

//         map[msg.sender] = State.Ready;
//         userId[_userId] = msg.sender;
//     }

//     function setResult(uint _userId, bool _success) public {
//         // only owner
//         require(msg.sender == owner, "Only contract creator can setResult");
//         address userAddress = userId[_userId];
//         require(map[userAddress] == State.Ready, "State has to be Ready");

//         if(_success) {
//             emit SuccessAndPaid(_userId);
//             map[userAddress] = State.SuccessAndPaid;
//             require(ERC20Interface(tokenAddress).transfer(userAddress, prize), "token.transfer failed !!");
//         }
//         else{
//             emit FailAndCollected(_userId);
//             map[userAddress] = State.FailAndColleteced;
//             // require(ERC20Interface(tokenAddress).transfer(owner, prize), "token.transfer failed !!");
//         }
//     }

//     function getStateOfAddress(address _address) public view returns (State) {
//         return map[_address];
//     }

//     function getStateOfUser(uint _userId) public view returns (State){
//         address userAddress = userId[_userId];

//         return map[userAddress];
//     }

//     function reclaimToOwner() public {
//         require(msg.sender == owner, "Only contract creator can setResult");

//         uint balance = ERC20Interface(tokenAddress).balanceOf(this);

//         ERC20Interface(tokenAddress).transfer(owner, balance);
//     }
// }