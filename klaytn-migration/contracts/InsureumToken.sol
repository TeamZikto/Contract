import "../contracts/AMLToken.sol";

/**
 * The Insureum Token
 */

contract InsureumToken is AMLToken {
  function InsureumToken() AMLToken("Insureum", "ISR", 297000000000000000000000000, 18, false){
  }
}