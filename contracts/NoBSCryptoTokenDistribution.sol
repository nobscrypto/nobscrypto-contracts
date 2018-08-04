pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./NoBSCryptoToken.sol";

/**
 * @title NoBS token initial distribution
 *
 * @dev Distribute airdrop and contributor tokens
 */
contract NoBSCryptoTokenDistribution is Ownable {
    using SafeMath for uint256;

    NoBSCryptoToken public NoBS;

    uint256 private constant decimalFactor = 10**uint256(18);
    enum AllocationType { AIRDROP, CONTRIBUTOR }
    uint256 public constant INITIAL_SUPPLY     = 10000000000 * decimalFactor;
    uint256 public AVAILABLE_TOTAL_SUPPLY      =  9000000000 * decimalFactor;
    uint256 public AVAILABLE_COMMUNITY_SUPPLY  =  8500000000 * decimalFactor;
    uint256 public AVAILABLE_AIRDROP_SUPPLY    =   500000000 * decimalFactor;
    uint256 public RESERVED_SUPPLY             =  1000000000 * decimalFactor;

    uint256 public grandTotalClaimed = 0;

    // List of admins
    mapping (address => bool) public airdropAdmins;

    // Keeps track of whether or not a 250 POLY airdrop has been made to a particular address
    mapping (address => bool) public airdrops;

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner || airdropAdmins[msg.sender]);
        _;
    }

    event LogNewAllocation(address indexed _recipient, AllocationType indexed _fromSupply, uint256 _totalAllocated, uint256 _grandTotalAllocated);
    event LogNoBSClaimed(address indexed _recipient, uint8 indexed _fromSupply, uint256 _amountClaimed, uint256 _totalAllocated, uint256 _grandTotalClaimed);

    /**
      * @dev Constructor function - Set the nobs token address
      */
    function NoBSCryptoTokenDistribution(address reserve_account) public {
        require(AVAILABLE_TOTAL_SUPPLY == AVAILABLE_COMMUNITY_SUPPLY.add(AVAILABLE_AIRDROP_SUPPLY));
        require(INITIAL_SUPPLY == AVAILABLE_TOTAL_SUPPLY.add(RESERVED_SUPPLY));
        NoBSCryptoToken newNoBSCryptoTokenContract = new NoBSCryptoToken(this);
        require (newNoBSCryptoTokenContract != address(0));
        NoBS = newNoBSCryptoTokenContract;
        require(NoBS.transfer(reserve_account, RESERVED_SUPPLY));
    }

    /**
      * @dev Add an airdrop admin
      */
    function setAirdropAdmin(address _admin, bool _isAdmin) public onlyOwner {
        airdropAdmins[_admin] = _isAdmin;
    }

    /**
      * @dev perform a transfer of allocations
      * @param _recipient is a list of recipients
      */
    function airdropTokens(address[] _recipient, uint amount) public onlyOwnerOrAdmin {
        uint airdropped;
        for(uint256 i = 0; i < _recipient.length; i++)
        {
            if (!airdrops[_recipient[i]]) {
                airdrops[_recipient[i]] = true;
                require(NoBS.transfer(_recipient[i], amount * decimalFactor));
                airdropped = airdropped.add(amount * decimalFactor);
            }
        }
        AVAILABLE_AIRDROP_SUPPLY = AVAILABLE_AIRDROP_SUPPLY.sub(airdropped);
        AVAILABLE_TOTAL_SUPPLY = AVAILABLE_TOTAL_SUPPLY.sub(airdropped);
        grandTotalClaimed = grandTotalClaimed.add(airdropped);
    }

    /**
      * @dev perform a transfer of allocations
      * @param _recipient is a list of recipients
      */
    function awardTokens(address[] _recipient, uint amount) public onlyOwnerOrAdmin {
        uint awarded;
        for(uint256 i = 0; i < _recipient.length; i++)
        {
            require(NoBS.transfer(_recipient[i], amount * decimalFactor));
            awarded = awarded.add(amount * decimalFactor);
        }
        AVAILABLE_COMMUNITY_SUPPLY = AVAILABLE_COMMUNITY_SUPPLY.sub(awarded);
        AVAILABLE_TOTAL_SUPPLY = AVAILABLE_TOTAL_SUPPLY.sub(awarded);
        grandTotalClaimed = grandTotalClaimed.add(awarded);
    }

    // Allow transfer of accidentally sent ERC20 tokens
    function refundTokens(address _recipient, address _token) public onlyOwner {
        require(_token != address(NoBS));
        ERC20 token = ERC20(_token);
        uint256 balance = token.balanceOf(this);
        require(token.transfer(_recipient, balance));
    }
    
}