var InsureumActivity = artifacts.require("./InsureumActivity.sol");

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

    before("setup", async function() {
        console.log("Start before hook..");
        // 인슈어리움 스마트 컨트랙트 디프로이하기
        insureum = await InsureumActivity.new();
        // Owner 설정 체크 
        return true;
    });
    
    it("function - Set Result", async function(){
        await insureum.setActivity(1, 2, 3, '2019-2-2', '20');
        await insureum.setActivity(2, 2, 3, '2019-2-3', '30');
        await insureum.setActivity(3, 2, 3, '2019-2-4', '40');
        await insureum.setActivity(4, 2, 3, '2019-2-2', '50');

        const r = await insureum.getSteps(2);


        console.log(r);
    });


});  //End of contract 1

