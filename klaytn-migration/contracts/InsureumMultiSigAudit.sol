pragma solidity 0.4.25;

import "./SafeMath.sol";


/*
  ERC Token Standard #20 Interface
  @repo https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 */
contract ERC20Interface {
    function totalSupply() public view returns (uint);
    function balanceOf(address tokenOwner) public view returns (uint balance);
    function allowance(address tokenOwner, address spender) public view returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}


/*
  BASIC Insureum Smart Contract
  @project Bolt and Nut v1.0

  Create this InsureumMultiSigAudit  contract first!

  @author: Ted Kim
  @contributor: Eric Kim
  @repo https://github.com/TeamZikto/InsureumContracts
 */
contract InsureumMultiSigAudit {

    using SafeMath for uint256;
    uint256 private constant decimalFactor = 10**uint256(18);

    address private insureumAddress;
    address private owner;
    
    address private insurer;
    address private insuree;

    // insurerFlags, insureeFlags state
    // 0 - Null
    // 1 - it is Insurer
    uint private insurerFlags = 0 ;
    uint private insureeFlags = 0 ;

    // insurerAck, insureeAck state
    // 0 - Not agree to quote
    // 1 - agree to quote
    uint private insurerAck = 0 ;
    uint private insureeAck = 0 ;

    uint256 private quote_IR = 0;  // set by Insurer
    uint256 private quote_ID = 0;  // set by Insuree..
    uint256 private quote = 0;     // Final Quote
  
    uint256 private indemnityAmt = 0;  // 증여금, set by Insurer
    uint256 private premiumAmt = 0;    // 보험 상품가격, set by Insuree

    enum State { InitState, AcceptedPremium, Active, Claim, Settlement ,Released, Expired, Canceled }

    State public status = State.InitState;

    event DepositedPremium(address newInsuree, uint256 premium);
    event SetIndemnityEvent(address newInsurer, uint256 indemnity);
    

    event InsurerAdded(address newInsurer);
    event InsureeAdded(address newInsuree);

    event QuoteIRAdded(uint256 value);
    event QuoteIDAdded(uint256 value);
    event QuoteFinalAdded(uint256 value);

    event ReleaseFundAction(uint256 value);
    event ExpiredFundAction(uint256 value);


    /*
     * @ The constructor sets the address of the Insureum smart contract
     * 
     */
    constructor(address _insureumAddress) public {
        
        require( 
            _insureumAddress != address(0), 
            "insureumAddress must not be NULL value."
        );
        
        insureumAddress = _insureumAddress;
        owner = msg.sender;

    }


    /*
     * @ The Insuree deposits premium and must approve this smart contract, InsureumMultiSigAudit, to use transferFrom()
     *   Make transaction using transferFrom
     */
    function depositPremium(uint256 amount) public onlyInsuree{

        require(amount > 0,"Premium must be greater than zero value");

        uint256 tmpAmt = amount * decimalFactor;
       
        // check balance of Insuree
        uint256 insureeBalance = ERC20Interface(insureumAddress).balanceOf(insuree);
        require(insureeBalance >= tmpAmt,"insureeBalance must be >= premium");
    
        require(
            ERC20Interface(insureumAddress).transferFrom(msg.sender, address(this), tmpAmt),
            "token.transferFrom failed !!"
        );
    
        premiumAmt = premiumAmt.add(tmpAmt);
        status = State.AcceptedPremium;
       
        emit DepositedPremium(msg.sender, tmpAmt);
    }


    /*
     * @ Modifier to check Insurance state
     */
    modifier atState(State _status) {
        require(
            status == _status, 
            "Function cannot be called at this time. State should be checked !!"
        );
        _;
    }

    
   /*
    * @@ Reverts if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require( 
            msg.sender == owner, 
            "Only the owner can call this."
        );
        _;
    }

    
   /*
    * @@ Reverts if called by any account other than the Insurer.
    */
    modifier onlyInsurer() {
        require( 
            msg.sender == insurer, 
            "Only the insurer can call this."
        );
        _;
    }


   /*
    * @@ Reverts if called by any account other than the Insuree.
    */
    modifier onlyInsuree() {
        require( 
            msg.sender == insuree, 
            "Only the insuree can call this..."
        );
        _;
    }


    function getInsureumAddress() public view returns(address) {
        return insureumAddress;
    }


   /*
    * @ The Insurer sets indemnity and must approve this smart contract, InsureumMultiSigAudit, to use transferFrom()
    *   Make transaction using transferFrom :
    */
    function setIndemnity(uint256 _value) public onlyInsurer{
        require(_value > 0,"Indemnity must be greater than zero value");

        uint256 tmpAmt = _value * decimalFactor;

        // check balance of insurer
        uint256 insurerBalance = ERC20Interface(insureumAddress).balanceOf(insurer);
        require(insurerBalance >= tmpAmt,"insurerBalance must be >= premium");

        require( 
            insureeFlags == 1, 
            "Premium should be deposited before setIndemnity"
        );
           
        require(
            ERC20Interface(insureumAddress).transferFrom(msg.sender, address(this), tmpAmt),
            "token.transferFrom failed in setIndemnity() !!"
        );

        
        indemnityAmt = indemnityAmt.add(tmpAmt);
        
        status = State.Active;

        emit SetIndemnityEvent(msg.sender, tmpAmt);
      
    }

    
    function getIndemnityAmt() public view returns(uint256) {
        return indemnityAmt;
    }

    
    function getPremiumAmt() public view returns(uint256) {
        return premiumAmt;
    }

    

    function addInsurer(address _insurer)  public onlyOwner returns(bool) {
        
        require(_insurer != address(0), "Insurer address must not be NULL");
        insurer = _insurer;
       
        insurerFlags = 1;

        emit InsurerAdded(_insurer);

        return true;
    }


    function addInsuree(address _insuree)  public onlyInsurer returns(bool) {

        require(_insuree != address(0), "Insuree address must not be NULL");
        insuree = _insuree;
        // status = State.Active;
        insureeFlags = 1;

        emit InsureeAdded(_insuree);

        return true;
    }


    //Set Quote
    function setQuoteIR(uint256 _value) public onlyInsurer returns(bool){
        require(_value > 0,"QuoteIR must be greater than zero value");
        quote_IR = _value;

        emit QuoteIRAdded(quote_IR);

        return true;
    }


    function setQuoteID(uint256 _value) public onlyInsuree returns(bool){
        require(_value > 0,"QuoteID must be greater than zero value");
        quote_ID = _value;

        emit QuoteIDAdded(quote_ID);

        return true;
    }


    function setQuoteFinal(uint256 _value) public onlyInsurer returns(bool){
        require(_value > 0,"QuoteFinal must be greater than zero value");
        quote = _value;

        emit QuoteFinalAdded(quote);

        return true;
    }


    //get Quote
    function getQuoteIR() public view returns(uint256){
        return quote_IR;
    }


    function getQuoteID() public view returns(uint256){
        return quote_ID;
    }


    function getQuoteFinal() public view returns(uint256){
        return quote;
    }

    
    function getOwner() public view returns(address) {
        return owner;
    }

    
    function getInsurer() public view returns(address) {
        return insurer;
    }


    function getInsuree() public view returns(address) {
        return insuree;
    }

    
    function isInsureeFlagTrue() public view returns(bool) {
        return insureeFlags > 0;
    }


    function isInsurerFlagTrue() public view returns(bool) {
        return insurerFlags > 0;
    }


   /*
    * @ The Insuree requests quoteID to Insurer and change the state to Claim 
    */
    function claim(uint256 _quote_ID_value) public atState(State.Active) onlyInsuree{
       
        require(_quote_ID_value > 0,"Claim QuoteID must be greater than zero value");
        
        quote_ID = _quote_ID_value;
        status = State.Claim;

        emit QuoteIDAdded(quote_ID);
 
    }


   /*
    * @ Inspector consults insuerer and set QuoteIR. The Insurer inform Insurer of quoteIR. 
    */
    function inspectSetQuote(uint256 _qoute_IR_value) public atState(State.Claim) onlyInsurer{
        
        require(_qoute_IR_value > 0,"Inspector QuoteIR must be greater than zero value");
        
        quote_IR = _qoute_IR_value;
        quote = _qoute_IR_value;   

        status = State.Settlement;
                
        insurerAck = 1;

        // emit QuoteIDAdded(quote_IR);
        emit QuoteFinalAdded(quote);
        
        releaseFund();

    }


    //set Insurer and Insuree Flag
    function setInsurerFlag(uint _flager) public onlyOwner{
        insurerFlags = _flager;
    }


    function setInsureeFlag(uint _flagree) public onlyOwner{
        insureeFlags = _flagree;
    }


    // get Insurer and Insuree Flag
    function getInsurerFlag() public view returns(uint){
        return insurerFlags;
    }

    function getInsureeFlag() public view returns(uint){
        
        return insureeFlags;
    }


    // get Status
    function getState() public view returns(State){
        return status;
    }


    //set Insurer ACK , just in case
    function setInsurerAck(uint _flag) public onlyOwner{
        insurerAck = _flag;
    }


    //set Insuree ACK , just in case
    function setInsureeAck(uint _flag) public onlyOwner{
        insureeAck = _flag;
    }


    //get Insurer ACK
    function getInsurerAck() public view returns(uint){
        return insurerAck;
    }


    //get Insuree ACK
    function getInsureeAck() public view returns(uint){
        return insureeAck;
    }


    // Settlement
    function ackQuoteInsurer() public onlyInsurer{
        insurerAck = 1;
        
        status = State.Settlement;

        releaseFund();
    }


    function ackQuoteInsuree() public onlyInsuree{
        
        insureeAck = 1;
        
        status = State.Settlement;

        releaseFund();
    }


    function resetFlag() public onlyOwner{
        status = State.InitState;

        insureeFlags = 0;
        insurerFlags = 0;
    }


    function resetAck() public onlyInsurer{
        status = State.Active;

        insurerAck = 0;
        insureeAck = 0;
    }

   /*
    * @ The smart contract invokes releaseFund() if both insurerAck and insureeAck is TRUE 
    */
    function releaseFund() public {
    
        if(insurerAck == 0 || insureeAck == 0) return;
        
        uint256 tmpAmt = quote;
        

        // check balance of this smart contract
        uint256 contractBalance = ERC20Interface(insureumAddress).balanceOf(address(this));
        require(contractBalance >= tmpAmt,"contractBalance must be >= tmpAmt");
   
        require(
            ERC20Interface(insureumAddress).transfer(insuree, tmpAmt),
            "token.transfer(insuree, tmpAmt) failed in releaseFund() !!"
        );

        emit ReleaseFundAction(tmpAmt);

        insurerAck = 0;
        insureeAck = 0;
      
        quote_ID = 0;
        quote_IR = 0;
        indemnityAmt = 0;
        
        status = State.Released;
    }

  
   /*
    * @ The insurer invokes ExpiredFund() if now > expire_time
    */
    function ExpiredFund() public onlyInsurer{
        if (insurerAck == 1 || insureeAck == 1) return;

        //TODO : IF now > expire_time THEN invoke transfer()
        
        uint256 tmpAmt = premiumAmt;
        
        // check balance of the smart contract
        uint256 contractBalance = ERC20Interface(insureumAddress).balanceOf(address(this));
        require(contractBalance >= tmpAmt,"contractBalance must be >= premium");

        require(
            ERC20Interface(insureumAddress).transfer(insurer, tmpAmt),
            "token.transfer(insurer, tmpAmt) failed in ExpiredFund() !!"
        );
        
        emit ExpiredFundAction(tmpAmt);

        insurerAck = 0;
        insureeAck = 0;
        premiumAmt = 0;

        status = State.Expired;
    }


    /**
     * @ Withdraw Fee From Contract : TODO
     */
    // function WithdrawFee(uint256 _amount) external onlyOwner{
    //     require(_amount <= tokenInterface.balanceOf(address(this)));
    //     tokenInterface.transfer(owner, _amount);
    // }



    /**
     * @ Emergency Drain : TODO 
     * in case something went wrong and token is stuck in contract
     */
    // function EmergencyDrain(ERC20Interface _anyToken) external onlyOwner returns(bool){
    //     if (address(this).balance > 0) {
    //         owner.transfer(address(this).balance);
    //     }
        
    //     if (_anyToken != address(0)) {
    //         _anyToken.transfer(owner, _anyToken.balanceOf(this));
    //     }
    //     return true;
    // }
    
}