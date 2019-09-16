var InsureumMultiSigAudit = artifacts.require("./Challenge.sol");
var InsureumToken = artifacts.require("./InsureumToken.sol");
var Challenge = artifacts.require("./Challenge.sol");

// Add the web3 node module
// var Web3 = require('web3');

const truffleAssert = require('truffle-assertions');

// An extra module is required for this, use npm to install before running
// var Tx = require('ethereumjs-tx');
// var BN = web3.utils.BN;

// ------------------------------------------------------------------
// Unit Test #1: InsureumMultiSigAudit-ReleaseFund
// ------------------------------------------------------------------
contract('Challenge',  async function(accounts){
    var insureum;
    var insurance;
    var challenge;

    const joinAmount = 10000 * Math.pow(10, 18);
    const prizeAmount = 12000 * Math.pow(10, 18);

    var InsureumOwner = accounts[0];
    var InsuranceContract = accounts[0];
    var challenger1 = accounts[1];
    var challenger2 = accounts[2];

    const userId1 = 123;
    const userId2 = 234;

    console.log("InsureumOwner : ", InsureumOwner);
    console.log("Accounts : ", accounts);

    before("setup", async function() {
        console.log("Start before hook..");
        // 인슈어리움 스마트 컨트랙트 디프로이하기
        insureum = await InsureumToken.new({from:InsuranceContract});
        // Owner 설정 체크 
        InsureumOwner = await insureum.owner.call();
        assert.equal(InsureumOwner, accounts[0], 'Insureum Owner is not accounts[0]');

        // 릴리스 에이전트  설정 체크 
        await insureum.setReleaseAgent(InsureumOwner, {from:InsureumOwner});
        assert.equal( await insureum.releaseAgent.call(), InsureumOwner,'Release agent properly not set');

       // 릴리스 토큰  설정 체크 
        await insureum.releaseTokenTransfer({from:InsureumOwner});

        // BAN v1.0 스마트 컨트랙트 디프로이하기
        challenge = await Challenge.new(insureum.address, 10, joinAmount, prizeAmount);
        
        var seedISR = joinAmount;

        await insureum.transfer(challenger1, seedISR, {from:InsureumOwner});
        await insureum.transfer(challenger2, seedISR, {from:InsureumOwner});
        // await insureum.transfer(challenge.address, seedISR * 10, {from:InsureumOwner});

        return true;
    });
    
    it("function - Join", async function(){
        // const initialBalance = await insureum.balanceOf.call(challenge.address);
        // console.log(initialBalance)
        await insureum.approve(challenge.address, joinAmount, {from:challenger1});
        await challenge.join(userId1, {from:challenger1});

        assert.equal( await insureum.balanceOf.call(challenge.address), joinAmount, 'Join Failed');
        assert.equal( await challenge.getStateOfUser.call(userId1), 1, 'Not Ready');
        assert.equal( await challenge.getStateOfAddress.call(challenger1), 1, 'Not Ready');

        await insureum.approve(challenge.address, joinAmount, {from:challenger2});
        await challenge.join(userId2, {from:challenger2});

        assert.equal( await insureum.balanceOf.call(challenge.address), joinAmount * 2, 'Join Failed');
        assert.equal( await challenge.getStateOfUser.call(userId2), 1, 'Not Ready');
        assert.equal( await challenge.getStateOfAddress.call(challenger2), 1, 'Not Ready');        
    });

    it("function - Set Result", async function(){
        await challenge.setResult(userId1, true);
        assert.equal( await insureum.balanceOf.call(challenger1), prizeAmount, 'Join Failed');

        await challenge.setResult(userId2, false);
        assert.equal( await insureum.balanceOf.call(challenger2), 0, 'Join Failed');
    });

    
    it("function - Finalize ", async function(){
        assert.notEqual( await insureum.balanceOf.call(challenge.address), 0, 'Join Failed');
        await challenge.reclaimToOwner();
        assert.equal( await insureum.balanceOf.call(challenge.address), 0, 'Join Failed');
    });

});  //End of contract 1

