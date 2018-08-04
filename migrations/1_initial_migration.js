var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network) {
    if (network === 'live') {
        console.log('Migrating on the Live network.')
        deployer.deploy(Migrations);
    }
    else {
        console.log('Migrating on the %s network.', network)
        const reserveAccount = process.env.RESERVE_ACCOUNT;
        console.log('Reserve account will be:', reserveAccount);
        deployer.deploy(Migrations);
    }
  
};
