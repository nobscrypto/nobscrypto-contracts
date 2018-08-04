pragma solidity ^0.4.18;
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract NoBSCryptoToken is StandardToken {
    string public constant name = "No BS Crypto"; 
    string public constant symbol = "NOBS";
    uint8 public constant decimals = 18;
    uint256 private constant decimalFactor = 10**uint256(decimals);
    uint256 public constant INITIAL_SUPPLY = 10000000000 * decimalFactor;

    function NoBSCryptoToken(address _noBSDistributionAddress) public {
        require(_noBSDistributionAddress != address(0));
        totalSupply_ = INITIAL_SUPPLY;
        balances[_noBSDistributionAddress] = INITIAL_SUPPLY;
    }
}