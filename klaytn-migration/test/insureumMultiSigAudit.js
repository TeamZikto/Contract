var InsureumMultiSigAudit = artifacts.require("./InsureumMultiSigAudit.sol");
var InsureumToken = artifacts.require("./InsureumToken.sol");

// Add the web3 node module
// var Web3 = require('web3');

const truffleAssert = require('truffle-assertions');

// An extra module is required for this, use npm to install before running
// var Tx = require('ethereumjs-tx');
// var BN = web3.utils.BN;

// ------------------------------------------------------------------
// Unit Test #1: InsureumMultiSigAudit-ReleaseFund
// ------------------------------------------------------------------
contract('InsureumMultiSigAudit-ReleaseFund',  async function(accounts){
    
    var insureum;
    var insurance;

    var InsureumOwner = accounts[0];
    var InsuranceOwner = accounts[0];
    var InsuranceContract = accounts[0];
    var Insurer = accounts[1];
    var Insuree = accounts[2];

  
    const State = { 
        InitState : 0, 
        AcceptedPremium : 1, 
        Active: 2, 
        Claim: 3, 
        Settlement : 4,
        Released: 5, 
        Expired: 6, 
        Canceled: 7 }
    

    console.log("## Begin InsureumMultiSigAudit-ReleaseFund Test --------------------------------------------");
    console.log("InsureumOwner : ", InsureumOwner);
    console.log("InsuranceOwner : ", InsuranceOwner);
    console.log("InsuranceContract : ", InsuranceContract);

    before("setup", async function() {
        console.log(">> start before hook..")

        // 인슈어리움 스마트 컨트랙트 디프로이하기
        insureum = await InsureumToken.deployed();
        console.log("PASS await InsureumToken.deployed : ", insureum.address);
        
        // owner 설정 체크 
        InsuerumOwner = await insureum.owner.call();
        assert.equal(InsureumOwner, accounts[0], 'Insureum Owner is not accounts[0]');

        // 릴리스 에이전트  설정 체크 
        await insureum.setReleaseAgent(InsureumOwner, {from:InsureumOwner});
        assert.equal( await insureum.releaseAgent.call(), InsureumOwner,'Release agent properly not set');

       // 릴리스 토큰  설정 체크 
        await insureum.releaseTokenTransfer({from:InsuranceOwner});

        // BAN v1.0 스마트 컨트랙트 디프로이하기
        insurance = await InsureumMultiSigAudit.deployed();
        console.log("insurance = await InsureumMultiSigAudit.deployed : ", insurance.address);
        InsuranceOwner = await insurance.getOwner.call();
        console.log("InsuranceOwner : ", InsuranceOwner);
        assert.equal(InsuranceOwner, accounts[0], 'Insurancce Owner is the accounts[0]');

        // 테스트 용도 Insurer and Insuree 계정 추가 하기        
        await insurance.addInsurer(Insurer, {from: InsuranceOwner});
        await insurance.addInsuree(Insuree, {from: Insurer});
       

        // Insurer and Insuree 가 올ㄹ바르게 세팅되어 잇는지 체크하기
        assert.equal( await insurance.getInsurer.call(), Insurer, 'Insurer not set');
        assert.equal( await insurance.getInsuree.call(), Insuree, 'Insuree not set');

        InsuranceContract = insurance.address;

        // Test Insurer and Insuree, 컨트랙트로 토큰전송
        seedISR = web3.utils.toWei('10000', 'ether');
        console.log("var seedISR = 10000 * Math.pow(10, 18) ", seedISR);

        await insureum.transfer(InsuranceContract, seedISR, {from:InsuerumOwner});
        await insureum.transfer(Insurer, seedISR, {from:InsuerumOwner});
        await insureum.transfer(Insuree, seedISR, {from:InsuerumOwner});


        let mybalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("await insureum.balanceOf.call(InsuranceContract) = ", mybalance/10**18);
        assert.equal( await insureum.balanceOf.call(InsuranceContract), seedISR, 'InsuranceContract balance not equal');

        return true;
    });
    
    
    
    it("function depositPremium :", async function(){

        const quote = 500;
        var strQuote = quote.toString();
    
        tmpQuote = web3.utils.toWei(strQuote, 'ether');
        console.log("var tmpQuote in function depositPremium ", tmpQuote);

        
        //set approvement and check allowance
        await insureum.approve(InsuranceContract, tmpQuote, {from:Insuree});
        assert.equal( await insureum.allowance(Insuree, InsuranceContract), tmpQuote, 'approve error : Insuree, InsuranceContract');
    

        let initalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("initialBalance of Contract : ",initalBalance/10**18);
        let insureeBalance = await insureum.balanceOf.call(Insuree);
        console.log("initialBalance of Insuree : ",insureeBalance/10**18);

        // Initial Flag and  PremiumAmt;
        let tmpPremiumAmt = await insurance.getPremiumAmt.call();
        console.log("initalBalance of PremiumAmt : ",tmpPremiumAmt);

        // Check  Initial Status;
        assert.equal( await insurance.getState.call(), State.InitState, 'Initial Sate must be State.InitState');
        

        //invoke depositPremium !!!===================================
        let myresult = await insurance.depositPremium(quote, {from:Insuree});

        //Event Handling
        truffleAssert.eventEmitted(myresult, 'DepositedPremium', (ev) => {
            console.log("ev.Insuree=", ev.newInsuree);
            console.log("ev.premium=", ev.premium/10**18);

            return ev.newInsuree === Insuree && ev.premium/10**18 === quote;
        }, 'DepositedPremium should be emitted with correct parameters');

        console.log(" DepositedPremium Event Test :");
        truffleAssert.prettyPrintEmittedEvents(myresult);
        

    
        initalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("Final Balance of Contract : ",initalBalance/10**18);
        insureeBalance = await insureum.balanceOf.call(Insuree);
        console.log("Final Balance of Insuree : ",insureeBalance/10**18);

        
        // Final Status;
        assert.equal( await insurance.getState.call(), State.AcceptedPremium, 'Initial Sate must be State.AcceptedPremium');
        // Final InsurerAck;
        assert.equal( await insurance.getInsurerAck.call(), 0, 'getInsurerAck Sate must be State.InitState');
        // Final InsureeFlags;
        assert.equal( await insurance.getInsureeFlag.call(), 1, 'Initial Insuree Flag must be FALSE');     

        assert.notEqual(await insurance.getPremiumAmt.call() , 0, "PremiumAmt Should > Zero after depositPremium()");


    });

    it("function setIndemnity test", async function(){

        const quote = 1000;
        
        let strQuote = quote.toString();
        tmpQuote2 = web3.utils.toWei(strQuote, 'ether');
        console.log("PASS var tmpQuote2 = 10000 * Math.pow(10, 18) ", tmpQuote2);

        console.log("PASS before approve in function setIndemnity test function()");
        await insureum.approve(InsuranceContract, tmpQuote2, {from:Insurer});
        console.log("PASS after approve in function setIndemnity test function()");

         
        let initalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("initialBalance of Contract in setIndemnity() Test: ",initalBalance/10**18);
        let insurerBalance = await insureum.balanceOf.call(Insurer);
        console.log("initialBalance of Insurer in setIndemnity() Test: ",insurerBalance/10**18);


        // Initial Flag and  PremiumAmt;
        let tmpIndemnityAmt = await insurance.getIndemnityAmt.call();
        console.log("initalBalance of IndemnityAmt : ",tmpIndemnityAmt);     
        // Initial Status;
        assert.equal( await insurance.getState.call(), State.AcceptedPremium, 'Initial Sate must be State.AcceptedPremium');
        // Initial InsureeFlags;
        assert.equal( await insurance.getInsureeFlag.call(), 1, 'Initial Insuree Flag must be TRUE');


        //invoke setIndemnity !!! ================================
        let myresult =await insurance.setIndemnity(quote, {from:Insurer});

         //TODO Event Handling
         truffleAssert.eventEmitted(myresult, 'SetIndemnityEvent', (ev) => {
            console.log("ev.newInsurer=", ev.newInsurer);
            console.log("ev.premium=", ev.indemnity/10**18);

            return ev.newInsurer === Insurer && ev.indemnity/10**18 === quote;
        }, 'SetIndemnityEvent should be emitted with correct parameters');

        console.log("SetIndemnityEvent Test :");
        truffleAssert.prettyPrintEmittedEvents(myresult);

    
        initalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("Final Balance of Contract : ",initalBalance/10**18);
        insurerBalance = await insureum.balanceOf.call(Insurer);
        console.log("Final Balance of Insurer : ",insurerBalance/10**18);

        
        // Final Status;
        assert.equal( await insurance.getState.call(), State.Active, 'Final Sate must be State.AcceptedPremium');
        // Final InsureeFlags;
        assert.equal( await insurance.getInsureeFlag.call(), 1, 'Final Insuree Flag must be TRUE');
        // Final IndemnityAmt;
        assert.notEqual(await insurance.getIndemnityAmt.call() , 0, "IndemnityAmt Should > Zero after depositPremium()");


    });

    
    it("function Claim ", async function(){
        //defore
        // Initial Flag and  PremiumAmt;
        let tmpQuoteID = await insurance.getQuoteID.call();
        console.log("[Claim] initial Value of QuoteID : ",tmpQuoteID);     
        // Initial Status;
        assert.equal( await insurance.getState.call(), State.Active, 'Initial Sate must be State.Active');
        
        // ===invoke claim(uint256 _qoute_ID_value) public atState(State.Active) onlyInsuree
        quote_ID_value = 1000;
        let strQuote = quote_ID_value.toString();
        let tmpQuote2 = web3.utils.toWei(strQuote, 'ether');
        console.log("[Claim] Converted value tmpQuote2 = 10000 * Math.pow(10, 18) ", tmpQuote2);

        let myresult = await insurance.claim(tmpQuote2, {from:Insuree});
        

        //TODO Event Handling
        truffleAssert.eventEmitted(myresult, 'QuoteIDAdded', (ev) => {
            console.log("ev.value=", ev.value);

            return ev.value/(10**18) === quote_ID_value;
        }, 'QuoteIDAdded should be emitted with correct parameters');

        console.log("QuoteIDAdded Event Test :");
        truffleAssert.prettyPrintEmittedEvents(myresult);


        //after
        let tmpQuoteID2 = await insurance.getQuoteID.call();
        console.log("[Claim] Final value of QuoteID : ",tmpQuoteID2/(10**18));  
                
        // Initial Status;
        assert.equal( await insurance.getState.call(), State.Claim, 'Finale Sate must be State.Claim');
    

    });

    // 보험회사 손해사정후 quote 설정값 체크및 이벤트 체크하기
    it("function inspectSetQuote ", async function(){

        //defore
        // Initial Flag and  PremiumAmt;
        let tmpQuoteIR = await insurance.getQuoteIR.call();
        console.log("[inspectSetQuote] initial Value of QuoteIR : ",tmpQuoteIR);   
        let tmpQuoteFinal = await insurance.getQuoteFinal.call();
        console.log("[inspectSetQuote] initial Value of QuoteFinalIR : ",tmpQuoteFinal);     
        // Initial Status;
        assert.equal( await insurance.getState.call(), State.Claim, 'Initial Sate must be State.Claim');
        
        console.log("[inspectSetQuote]  ---before insurance.getState.call()=", await insurance.getState.call());

        //resetAck
        _qoute_IR_value = 990;
        let strQuote = _qoute_IR_value.toString();
        let tmpQuote2 = web3.utils.toWei(strQuote, 'ether');
        console.log("[inspectSetQuote] Converted value tmpQuote2 = 10000 * Math.pow(10, 18) ", tmpQuote2);

        let myresult = await insurance.inspectSetQuote(tmpQuote2, {from:Insurer});
        console.log("[inspectSetQuote] --after insurance.getState.call()=", await insurance.getState.call());

        //TODO Event Handling
        truffleAssert.eventEmitted(myresult, 'QuoteFinalAdded', (ev) => {
            console.log("ev.value=", ev.value);

            return ev.value/(10**18) === _qoute_IR_value;
        }, 'QuoteFinalAdded should be emitted with correct parameters');

        console.log("QuoteFinalAdded Event Test :");
        truffleAssert.prettyPrintEmittedEvents(myresult);


        //after
        let tmpQuoteID2 = await insurance.getQuoteIR.call();
        console.log("[inspectSetQuote] Final value of QuoteIR : ",tmpQuoteID2);
        let tmpQuoteFinal2 = await insurance.getQuoteFinal.call();
        console.log("[inspectSetQuote] Fianl Value of QuoteFinalIR : ",tmpQuoteFinal2);       
        
        // Final Status;
        // console.log("---await insurance.getState.call()=", await insurance.getState.call());
        assert.equal( await insurance.getState.call(), State.Settlement, 'Finale Sate must be State.Settlement');
    

    });


    it("function releaseFund test", async function(){
        
         // before balance of Contract 
        let initalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("PASS initialBalance of Contract in releaseFund() Test: ",initalBalance/10**18);
        let insureeBalance = await insureum.balanceOf.call(Insuree);
        console.log("PASS initialBalance of Insuree in releaseFund() Test: ",insureeBalance/10**18);

        // check ..getInsureeAck, getInsurerAck
        console.log("PASS Init getInsureeAck :", await insurance.getInsureeAck.call());
        console.log("PASS Init getInsurerAck :", await insurance.getInsurerAck.call());

        //after realse fund() -getQuoteFinal-------------------------
        console.log("PASS Final Quote :", await insurance.getQuoteFinal.call());
         
        //인슈어리가 ack 설정.;. 보험회사 손해사정 결과에 동의함
        await insurance.ackQuoteInsuree({from:Insuree});
        console.log("PASS await insurance.ackQuoteInsuree : ");

        // check ..getInsureeAck, getInsurerAck
        console.log("PASS After relasedFund, Final getInsureeAck :", await insurance.getInsureeAck.call());
        console.log("PASS After relasedFund, Final getInsurerAck :", await insurance.getInsurerAck.call());

          
        // ackQuoteInsuree()를 호출시  insurance.releaseFund({from:Insuree}) 가 자동으로 호출됨;
        console.log("PASS await insurance.releaseFund : ");


        let finalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("PASS Final Balance of Contract in releaseFund() Test: ",finalBalance/10**18);
        let insureeFBalance = await insureum.balanceOf.call(Insuree);
        console.log("PASS Final Balance of Insuree in releaseFund() Test: ",insureeFBalance/10**18);

        assert.equal( await insurance.getState.call(), State.Released, 'The last State must be State.Released');
        

    
    });


    it("I can't claim", async function(){
        try{
            await insurance.claim({from:accounts[9]});
            
        }
        catch(e){
            expect(e).to.be.instanceOf(Error);
            return
        }
        expect.fail(null,null, 'Should not be here');
    });

});  //End of contract 1


// ------------------------------------------------------------------
// Unit Test #2: InsureumMultiSigAudit-ExpiredFund
// ------------------------------------------------------------------
contract('InsureumMultiSigAudit-ExpiredFund',  async function(accounts){

    var insureum;
    var insurance;
  
    var InsureumOwner = accounts[0];
    var InsuranceOwner = accounts[0];
    var InsuranceContract = accounts[0];
    var Insurer = accounts[1];
    var Insuree = accounts[2];
 
  
    const State = { 
        InitState : 0, 
        AcceptedPremium : 1, 
        Active: 2, 
        Claim: 3, 
        Settlement : 4,
        Released: 5, 
        Expired: 6, 
        Canceled: 7 }
    

    console.log("## Begin test InsureumMultiSigAudit-ExpiredFund   ------------");
    console.log("InsureumOwner : ", InsureumOwner);
    console.log("InsuranceOwner : ", InsuranceOwner);
    console.log("InsuranceContract : ", InsuranceContract);

    before("setup", async function() {
        console.log(">> start setup....")
        insureum = await InsureumToken.deployed();

        console.log("PASS insureum.address : ", insureum.address);
        InsuerumOwner = await insureum.owner.call();

        assert.equal(InsureumOwner, accounts[0], 'Insureum Owner is not accounts[0]');
        await insureum.setReleaseAgent(InsureumOwner, {from:InsureumOwner});

        assert.equal( await insureum.releaseAgent.call(), InsureumOwner,'Release agent properly not set');
        await insureum.releaseTokenTransfer({from:InsuranceOwner});
 
        
        insurance = await InsureumMultiSigAudit.deployed();
        InsuranceOwner = await insurance.getOwner.call();

        console.log("PASS insurance = await InsureumMultiSigAudit.deployed : ", insurance.address);
        console.log("PASS InsuranceOwner : ", InsuranceOwner);

        assert.equal(InsuranceOwner, accounts[0], 'Insurancce Owner is the accounts[0]');
        console.log("PASS before() :await insurance.getInsureeFlag.call()=", await insurance.getInsureeFlag.call());

               
        await insurance.addInsurer(Insurer, {from: InsuranceOwner});
        await insurance.addInsuree(Insuree, {from: Insurer});
        
        assert.equal( await insurance.getInsurer.call(), Insurer, 'Insurer not set');
        assert.equal( await insurance.getInsuree.call(), Insuree, 'Insuree not set');

        InsuranceContract = insurance.address;

        // 컨트랙트, 인슈어러에게 로 토큰전송
        const quote = 10000;  
        var strQuote = quote.toString();
    
        seedISR = web3.utils.toWei(strQuote, 'ether');
        console.log("PASS var seedISR = 10000 * Math.pow(10, 18) ", seedISR);

        await insureum.transfer(InsuranceContract, seedISR, {from:InsuerumOwner});
        await insureum.transfer(Insurer, seedISR, {from:InsuerumOwner});

        console.log("PASS await insureum.balanceOf.call(InsuranceContract) = ", await insureum.balanceOf.call(InsuranceContract));      
        assert.equal( await insureum.balanceOf.call(InsuranceContract), seedISR);

        return true;
    });
    
      
    // ==============================================
    it("function depositPremium :", async function(){

        const quote = 1000;
        
        var strQuote = quote.toString();
    
        tmpQuote = web3.utils.toWei(strQuote, 'ether');
        console.log("PASS before function depositPremium in ExpiredFund() ", tmpQuote);
        
        await insureum.transfer(Insuree, tmpQuote, {from:Insurer});

        await insureum.approve(InsuranceContract, tmpQuote, {from:Insurer});
        await insureum.approve(Insuree, tmpQuote, {from:Insurer});
        await insureum.approve(InsuranceContract, tmpQuote, {from:Insuree});

        console.log("PASS after function depositPremium in ExpiredFund() ", tmpQuote);

        let initalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("PASS initialBalance of Contract : ",initalBalance/10**18);
        let insureeBalance = await insureum.balanceOf.call(Insuree);
        console.log("PASS initialBalance of Insuree : ",insureeBalance/10**18);

        // Initial Flag and  PremiumAmt;
        let tmpPremiumAmt = await insurance.getPremiumAmt.call();
        console.log("PASS initalBalance of PremiumAmt : ",tmpPremiumAmt);

        // Initial Status;
        assert.equal( await insurance.getState.call(), State.InitState, 'Initial State must be State.InitState');


        //invoke depositPremium !!!===================================
        await insurance.depositPremium(quote, {from:Insuree});
    
        initalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("Final Balance of Contract : ",initalBalance/10**18);
        insureeBalance = await insureum.balanceOf.call(Insuree);
        console.log("Final Balance of Insuree : ",insureeBalance/10**18);

        
        // Final Status;
        assert.equal( await insurance.getState.call(), State.AcceptedPremium, 'Initial Sate must be State.AcceptedPremium');
        // Final InsurerAck;
        assert.equal( await insurance.getInsurerAck.call(), 0, 'getInsurerAck Sate must be State.InitState');
        // Final InsureeFlags;
        assert.equal( await insurance.getInsureeFlag.call(), 1, 'Initial Insuree Flag must be FALSE');

        assert.notEqual(await insurance.getPremiumAmt.call() , 0, "PremiumAmt Should > Zero after depositPremium()");


    });

    it("function setIndemnity test", async function(){

        const quote = 1000;
               
        var strQuote = quote.toString();
       
        tmpQuote = web3.utils.toWei(strQuote, 'ether');
        console.log("PASS before function setIndemnity in ExpiredFund() ", tmpQuote);
        // console.log("var seedISR = 10000 * Math.pow(10, 18) ", seedISR);

        await insureum.approve(InsuranceContract, tmpQuote, {from:Insurer});
        console.log("PASS after function setIndemnity in ExpiredFund() ", tmpQuote);
        
        let initalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("PASS initialBalance of Contract in setIndemnity() Test: ",initalBalance/10**18);
        let insurerBalance = await insureum.balanceOf.call(Insurer);
        console.log("PASS initialBalance of Insurer in setIndemnity() Test: ",insurerBalance/10**18);

        // Initial Flag and  PremiumAmt;
        let tmpIndemnityAmt = await insurance.getIndemnityAmt.call();
        console.log("initalBalance of IndemnityAmt : ",tmpIndemnityAmt);     
        // Initial Status;
        assert.equal( await insurance.getState.call(), State.AcceptedPremium, 'Initial Sate must be State.AcceptedPremium');
        // Initial InsureeFlags;
        assert.equal( await insurance.getInsureeFlag.call(), 1, 'Initial Insuree Flag must be TRUE');

        //invoke setIndemnity !!! ================================
        await insurance.setIndemnity(quote, {from:Insurer});
    
        initalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("Final Balance of Contract : ",initalBalance/10**18);
        insurerBalance = await insureum.balanceOf.call(Insurer);
        console.log("Final Balance of Insurer : ",insurerBalance/10**18);

        // Final Status;
        assert.equal( await insurance.getState.call(), State.Active, 'Final Sate must be State.AcceptedPremium');
        // Final InsureeFlags;
        assert.equal( await insurance.getInsureeFlag.call(), 1, 'Final Insuree Flag must be TRUE');
        // Final IndemnityAmt;
        assert.notEqual(await insurance.getIndemnityAmt.call() , 0, "IndemnityAmt Should > Zero after depositPremium()");


    });



    it("fuction ExpiredFund()", async function(){


        console.log("[ExpiredFund] await insurance.getState.call() =:",await insurance.getState.call());

        let quote = 1000;
               
        
        let initalBalance = await insureum.balanceOf.call(InsuranceContract);
        console.log("initialBalance of Contract in ExpiredFund() Test: ",initalBalance/10**18);
        let insureeBalance = await insureum.balanceOf.call(Insurer);
        console.log("initialBalance of Insurer in ExpiredFund() Test: ",insureeBalance/10**18);

        
        console.log("[ExpiredFund] await insurance.getPremiumAmt.call() =:",await insurance.getPremiumAmt.call());
        let myresult = await insurance.ExpiredFund({from:Insurer});

        //Event watch/listen using truffle-assertions
        truffleAssert.eventEmitted(myresult, 'ExpiredFundAction', (ev) => {
            console.log("ev.value=", ev.value);

            return ev.value/(10**18) === quote;
        }, 'ExpiredFundAction should be emitted with correct parameters');

        console.log("ExpiredFundAction Event Test :");
        truffleAssert.prettyPrintEmittedEvents(myresult);

        //check after balance
        let initalBalance2 = await insureum.balanceOf.call(InsuranceContract);
        console.log("Final of Contract in ExpiredFund() Test: ",initalBalance2/10**18);
        let insureeBalance2 = await insureum.balanceOf.call(Insurer);
        console.log("Final of Insurer in ExpiredFund() Test: ",insureeBalance2/10**18);



    });

    
});  //End of contract 2


// ------------------------------------------------------------------
// Unit Test #3: InsureumMultiSigAudit-Abnormal cases
// ------------------------------------------------------------------
contract('InsureumMultiSigAudit-Abnormal Cases',  async function(accounts){

    var insureum;
    var insurance;

 
    var InsureumOwner = accounts[0];
    var InsuranceOwner = accounts[0];
    var InsuranceContract = accounts[0];
    var Insurer = accounts[1];
    var Insuree = accounts[2];

  
    const State = { 
        InitState : 0, 
        AcceptedPremium : 1, 
        Active: 2, 
        Claim: 3, 
        Settlement : 4,
        Released: 5, 
        Expired: 6, 
        Canceled: 7 }
    

    console.log("## Begin test InsureumMultiSigAudit-Abnormal Cases   ------------");
    console.log("PASS InsureumOwner : ", InsureumOwner);
    console.log("PASS InsuranceOwner : ", InsuranceOwner);
    console.log("PASS InsuranceContract : ", InsuranceContract);


    before("setup", async function() {
        console.log(">> start setup...Abnormal Cases.")
        insureum = await InsureumToken.deployed();

        InsuerumOwner = await insureum.owner.call();
        assert.equal(InsureumOwner, accounts[0], 'Insureum Owner is not accounts[0]');

        await insureum.setReleaseAgent(InsureumOwner, {from:InsureumOwner});
        assert.equal( await insureum.releaseAgent.call(), InsureumOwner,'Release agent properly not set');

        await insureum.releaseTokenTransfer({from:InsuranceOwner}); 
        
        insurance = await InsureumMultiSigAudit.deployed();
        InsuranceOwner = await insurance.getOwner.call();

        assert.equal(InsuranceOwner, accounts[0], 'Insurancce Owner is the accounts[0]');
        
        await insurance.addInsurer(Insurer, {from: InsuranceOwner});
        await insurance.addInsuree(Insuree, {from: Insurer});

        assert.equal( await insurance.getInsurer.call(), Insurer, 'Insurer not set');
        assert.equal( await insurance.getInsuree.call(), Insuree, 'Insuree not set');

        InsuranceContract = insurance.address;

        // 컨트랙트로 토큰전송
        const quote2 = 10000;
        var strQuote = quote2.toString();

        seedISR = web3.utils.toWei(strQuote, 'ether');
        console.log("PASS var seedISR = 10000 * Math.pow(10, 18) ", seedISR);

        
        await insureum.transfer(InsuranceContract, seedISR, {from:InsuerumOwner});
        await insureum.transfer(Insurer, seedISR, {from:InsuerumOwner});
        
        console.log("PASS await insureum.balanceOf.call(InsuranceContract) = ", await insureum.balanceOf.call(InsuranceContract));
        assert.equal( await insureum.balanceOf.call(InsuranceContract), seedISR);

        const quote3 = 1000;
        var strQuote = quote3.toString();

        seedISR = web3.utils.toWei(strQuote, 'ether');
        console.log("PASS var seedISR = 10000 * Math.pow(10, 18) ", seedISR);

        await insureum.transfer(Insuree, seedISR, {from:Insurer});

        await insureum.approve(InsuranceContract, seedISR, {from:Insurer});
        await insureum.approve(Insuree, seedISR, {from:Insurer});
        await insureum.approve(InsuranceContract, seedISR, {from:Insuree});
        

        return true;
    });

    // depositPremium 함수에서 에 밸런스체크 하기
    it("I can't depositPremium-balanceChecker", async function(){

        try{

            
            let qoute = 3001;    // Insuree Balnce must be grater eq. than premuim        
            await insurance.depositPremium(qoute, {from:Insuree});
            
        }catch(e){
            expect(e).to.be.instanceOf(Error);
            return
        }
        expect.fail(null,null, 'Should not be here');
    });
    
    // depositPremium 함수에서 에 오버플로우 체크 하기
    it("I can't depositPremium-overflow", async function(){
        try{

            let qoute = 2**256+1;
            await insurance.depositPremium(qoute, {from:Insuree});
            
        }catch(e){
            expect(e).to.be.instanceOf(Error);
            return
        }
        expect.fail(null,null, 'Should not be here');
    });

   // 가짜 인슈어리 체크하기
    it("I can't depositPremium-not insuree", async function(){
        try{
            await insurance.depositPremium(100, {from:Insuree2});
            
        } catch(AssertionError) {
            assert(AssertionError);
        }
    });

    // 마이너스값 체크하기
    it("I can't depositPremium-insuree, but strange value", async function(){
        try{
            let quote = -100;
            
            await insurance.depositPremium(quote, {from:Insuree});
         
        }
        catch(e){
            expect(e).to.be.instanceOf(Error);
            return
        }
        expect.fail(null,null, 'Should not be here');
    });

    it("I can't depositPremium-Not insuree, but strange value", async function(){
        try{
            let quote = -100;
            
            await insurance.depositPremium(quote, {from:Insuree4});
         
        }
        catch(e){
            expect(e).to.be.instanceOf(Error);
            return
        }
        expect.fail(null,null, 'Should not be here');
    });

    // 가짜 인슈어러 체크하기
    it("I can't setIndemnity-Not insurer and good value", async function(){
        try{
            let quote = 100;
            
            await insurance.setIndemnity(quote, {from:Insurer4});
         
        }
        catch(e){
            expect(e).to.be.instanceOf(Error);
            return
        }
        expect.fail(null,null, 'Should not be here');
    });

    it("I can't setIndemnity-good insurer and bad value", async function(){
        try{
            let quote = -100;
            
            await insurance.setIndemnity(quote, {from:Insurer});
         
        }
        catch(e){
            expect(e).to.be.instanceOf(Error);
            return
        }
        expect.fail(null,null, 'Should not be here');
    });

    it("I can't setIndemnity-bad insurer, bad values", async function(){
        try{
            let quote = -100;
            
            await insurance.setIndemnity(quote, {from:Insuree4});
         
        }
        catch(e){
            expect(e).to.be.instanceOf(Error);
            return
        }
        expect.fail(null,null, 'Should not be here');
    });



    it("I can't claim", async function(){
        try{
            
            await insurance.claim(100, {from:Insureer});
        }
        catch(e){
            expect(e).to.be.instanceOf(Error);
            return
        }
        expect.fail(null,null, 'Should not be here');
        // console.log("should not be here....2.")
    });


});  //End of contract 3