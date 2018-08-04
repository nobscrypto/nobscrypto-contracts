var NoBSCryptoToken = artifacts.require("./NoBSCryptoToken.sol");
var NoBSCryptoTokenDistribution = artifacts.require("./NoBSCryptoTokenDistribution.sol");

const reserveAccount = process.env.RESERVE_ACCOUNT;

if (!reserveAccount) {
    console.error('No reserve account specified.', reserveAccount);
    process.exit(1);
}

module.exports = async function(deployer) {
    try {
        console.log(`Reserve account: ${reserveAccount}`)
        await deployer.deploy(NoBSCryptoTokenDistribution, reserveAccount);
        console.log(`
          -------------------------------------------------------------------------------
          -------------- NoBSCryptoToken (NoBS) TOKEN SUCCESSFULLY DEPLOYED --------------
          -------------------------------------------------------------------------------
          - Distribution Contract address: ${NoBSCryptoTokenDistribution.address}
          -------------------------------------------------------------------------------
        `);
    }
    catch (e) {
        console.log('error', e);
    }
}

// - Coin address: ${NoBSCryptoToken.address}