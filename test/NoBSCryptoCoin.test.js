// Tests for the NoBSCryptoToken. Thanks to PolyMath because I mostly copied their tests.

var noBSTokenDistribution = artifacts.require("NoBSCryptoTokenDistribution");
var NoBSCryptoToken = artifacts.require("NoBSCryptoToken");
const BigNumber = require("bignumber.js");

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

contract("NoBSCryptoToken", async function(accounts) {
    const DECIMALSFACTOR = new BigNumber("10").pow("18");
    const TOKEN_NAME = "NoBSCryptoToken";
    const TOKEN_SYMBOL = "NoBS";
    const TOKEN_DECIMALS = 18;
    const TOTAL_SUPPLY = 10000000000 * DECIMALSFACTOR;
    const RESERVED_SUPPLY = 1000000000 * DECIMALSFACTOR;

    let noBSToken;

    before(async () => {
        noBSToken = await NoBSCryptoToken.new(accounts[0], { from: accounts[0] });
    });

    describe("Token Basic Properties", async function() {
        it("Name", async function() {
            let tokenName = await noBSToken.name({ from: accounts[0] });
            assert.equal(tokenName, TOKEN_NAME);
        });

        it("Symbol", async function() {
            let tokenSymbol = await noBSToken.symbol({ from: accounts[0] });
            assert.equal(tokenSymbol, TOKEN_SYMBOL);
        });

        it("Decimals", async function() {
            let tokenDecimals = await noBSToken.decimals({ from: accounts[0] });
            assert.equal(parseInt(tokenDecimals), TOKEN_DECIMALS);
        });

        it("Total Supply", async function() {
            let tokenTotalSupply = await noBSToken.totalSupply({
                from: accounts[0]
            });
            assert.equal(tokenTotalSupply.toString(10), TOTAL_SUPPLY);
        });
    });

    // it("should put 10bn reserved noBSToken in the owner account", async function() {
    //     let balance = await noBSToken.balanceOf(accounts[0], {
    //         from: accounts[0]
    //     });
    //     assert.equal(balance.toString(10), RESERVED_SUPPLY);
    // });

    describe("Token Transfer Functions", async function() {
        it("should transfer from owner to another address", async function() {
            await noBSToken.transfer(accounts[1], 1000, { from: accounts[0] });
            let account1Balance = await noBSToken.balanceOf(accounts[1], {
                from: accounts[0]
            });
            assert.equal(account1Balance, 1000);
        });

        it("should FAIL to transfer to null address", async () => {
            try {
                await noBSToken.transfer(0, 1000, { from: accounts[0] });
            } catch (error) {
                logError("✅   Tried to transfer to null address and failed");
                return true;
            }
            throw new Error("I should never see this!");
        });

        it("should FAIL to transfer more tokens than available", async () => {
            try {
                await noBSToken.transfer(accounts[1], TOTAL_SUPPLY + 1, {
                    from: accounts[0]
                });
            } catch (error) {
                logError(
                    "✅   Tried to transfer more tokens than available and failed"
                );
                return true;
            }
            throw new Error("I should never see this!");
        });
    });

    describe("Token TransferFrom / Allowance Functions", async function() {
        it("should give an allowance of 9999 to another account", async () => {
            await noBSToken.approve(accounts[3], 9999, { from: accounts[0] });
            let allowance = await noBSToken.allowance(
                accounts[0],
                accounts[3],
                { from: accounts[0] }
            );
            assert.equal(allowance.toString(10), 9999);
        });

        it("should transferFrom from allowance", async () => {
            await noBSToken.transferFrom(accounts[0], accounts[4], 3333, {
                from: accounts[3]
            });
            let updatedAllowance = await noBSToken.allowance(
                accounts[0],
                accounts[3],
                { from: accounts[0] }
            );
            assert.equal(updatedAllowance.toString(10), 6666);

            let account4Balance = await noBSToken.balanceOf(accounts[4], {
                from: accounts[0]
            });
            assert.equal(account4Balance.toString(10), 3333);
        });

        it("should increase allowance", async () => {
            await noBSToken.increaseApproval(accounts[5], 100, {
                from: accounts[0]
            });
            let updatedAllowance = await noBSToken.allowance(
                accounts[0],
                accounts[5],
                { from: accounts[0] }
            );
            assert.equal(updatedAllowance.toString(10), 100);
        });

        it("should decrease allowance", async () => {
            let allowanceToDecrease = 50;
            let origAllowance = await noBSToken.allowance(
                accounts[0],
                accounts[5],
                { from: accounts[0] }
            );
            await noBSToken.decreaseApproval(accounts[5], allowanceToDecrease, {
                from: accounts[0]
            });
            let updatedAllowance = await noBSToken.allowance(
                accounts[0],
                accounts[5],
                { from: accounts[0] }
            );
            assert.equal(
                parseInt(origAllowance),
                parseInt(updatedAllowance) + allowanceToDecrease
            );
        });

        it("should completely decrease allowance", async () => {
            let allowanceToDecrease = 100000;
            let origAllowance = await noBSToken.allowance(
                accounts[0],
                accounts[5],
                { from: accounts[0] }
            );
            await noBSToken.decreaseApproval(accounts[5], allowanceToDecrease, {
                from: accounts[0]
            });
            let updatedAllowance = await noBSToken.allowance(
                accounts[0],
                accounts[5],
                { from: accounts[0] }
            );
            assert.equal(updatedAllowance.toString(10), 0);
        });

        it("should FAIL to transferFrom to null address", async () => {
            try {
                await noBSToken.transferFrom(accounts[0], 0, 1, {
                    from: accounts[3]
                });
            } catch (error) {
                logError(
                    "✅   Tried to transferFrom to null address and failed"
                );
                return true;
            }
            throw new Error("I should never see this!");
        });

        it("should FAIL to transferFrom if _from has not enough balance", async () => {
            try {
                await noBSToken.transferFrom(
                    accounts[0],
                    accounts[5],
                    TOTAL_SUPPLY + 1,
                    { from: accounts[3] }
                );
            } catch (error) {
                logError(
                    "✅   Tried to transferFrom without enough balance and failed"
                );
                return true;
            }
            throw new Error("I should never see this!");
        });

        it("should FAIL to transferFrom more than the allowance granted", async () => {
            try {
                await noBSToken.transferFrom(accounts[0], accounts[5], 50000, {
                    from: accounts[3]
                });
            } catch (error) {
                logError(
                    "✅   Tried to transferFrom without enough balance and failed"
                );
                return true;
            }
            throw new Error("I should never see this!");
        });
    });
});
