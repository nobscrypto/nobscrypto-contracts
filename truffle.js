require("dotenv").config();
const Web3 = require("web3");
const web3 = new Web3();
const WalletProvider = require("truffle-wallet-provider");
const Wallet = require("ethereumjs-wallet");

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 7545,
            network_id: "*" // Match any network id
        },
        ropsten: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "3", // Match any network id
            gas: 3500000,
            gasPrice: 50000000000
        },
        mainnet: {
            // provider: mainNetProvider,
            host: "127.0.0.1",
            port: 8545,
            gas: 3500000,
            gasPrice: web3.utils.toWei("8", "gwei"),
            network_id: "1"
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};
