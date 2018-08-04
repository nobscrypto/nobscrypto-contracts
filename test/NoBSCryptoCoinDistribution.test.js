// Tests for the NoBSCryptoTokenDistribution. Thanks to PolyMath because I mostly copied their tests.

const NoBSCryptoTokenDistribution = artifacts.require(
    "NoBSCryptoTokenDistribution"
);
const NoBSCryptoToken = artifacts.require("NoBSCryptoToken");
const Web3 = require("web3");
const BigNumber = require("bignumber.js");

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545")); // Hardcoded development port

const mineBlock = function() {
    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync(
            {
                jsonrpc: "2.0",
                method: "evm_mine"
            },
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

const logTitle = function(title) {
    console.log("*****************************************");
    console.log(title);
    console.log("*****************************************");
};

const logError = function(err) {
    console.log("-----------------------------------------");
    console.log(err);
    console.log("-----------------------------------------");
};

contract("NoBSCrytoCoinDistribution", function(accounts) {
    let noBSDistribution;
    let noBSToken;
    let noBSTokenAddress;

    let account_owner = accounts[0];
    let account_reserve = accounts[1];

    let airdrop_massive = new Array();
    for (var i = 0; i < 50; i++) {
        var acc = web3.eth.accounts.create();
        airdrop_massive[i] = acc.address;
    }

    let award_massive = new Array();
    for (var i = 0; i < 50; i++) {
        var acc = web3.eth.accounts.create();
        award_massive[i] = acc.address;
    }

    before(async () => {
        noBSDistribution = await NoBSCryptoTokenDistribution.new({
            from: accounts[0]
        });
        noBSTokenAddress = await noBSDistribution.NoBS({ from: accounts[0] });
        noBSToken = await NoBSCryptoToken.at(noBSTokenAddress);
    });

    describe("All tests", async function() {
        describe("Test Constructor", async function() {
            it("should have deployed NoBSCryptoToken", async function() {
                logTitle("NoBSCryptoToken Address: " + noBSTokenAddress);
                assert.notEqual(
                    noBSTokenAddress.valueOf(),
                    "0x0000000000000000000000000000000000000000",
                    "Token was not initialized"
                );
            });
        });

        describe("Test Distributions", async () => {
            it("should perform the AIRDROP for 50 accounts", async function() {
                await noBSDistribution.airdropTokens(airdrop_massive, 1000, {
                    from: accounts[0]
                });
            });

            it("airdrop accounts should have 1000 NoBS each", async function() {
                for (var i = 0; i < airdrop_massive.length; i++) {
                    let tokenBalance = await noBSToken.balanceOf(
                        airdrop_massive[i],
                        { from: accounts[0] }
                    );
                    assert.equal(
                        tokenBalance.toString(10),
                        "1000000000000000000000"
                    );
                }
            });

            it("should perform the AWARDING for 50 accounts", async function() {
                await noBSDistribution.awardTokens(award_massive, 500, {
                    from: accounts[0]
                });
            });

            it("airdrop accounts should have 250 NoBS each", async function() {
                for (var i = 0; i < award_massive.length; i++) {
                    let tokenBalance = await noBSToken.balanceOf(
                        award_massive[i],
                        { from: accounts[0] }
                    );
                    assert.equal(
                        tokenBalance.toString(10),
                        "500000000000000000000"
                    );
                }
            });
        });

        describe("Ether Transfers", async function () {

            it("should reject transfers", async function () {
              try {
                await noBSDistribution.sendTransaction({from:accounts[0], value:web3.utils.toWei("1","ether")});
              } catch (error) {
                  logError("✅   Rejected incoming ether");
                  return true;
              }
              throw new Error("I should never see this!")
            });
      
          });
    });
});
