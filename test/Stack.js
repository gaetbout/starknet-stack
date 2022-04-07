
//we import expect to test values
const { expect } = require("chai");
// These two lines allow us to play with our testnet and access our deployed contract 
const { starknet } = require("hardhat");
const { StarknetContract, StarknetContractFactory } = require("hardhat/types/runtime");


describe("Test contract : Stack", function () {

    let contractFactory;
    let contract;
    let valueToPush = 42;
    let identification = 1;
    this.timeout(120000);

    before(async () => {
        contractFactory = await starknet.getContractFactory("Stack");
        contract = await contractFactory.deploy();

    });
    beforeEach(async () => {
        // Done to use a different stack each time
        identification++;
    });


    describe("Testing creation & empty", function () {
        it("Should create a stack and assert that it is empty.", async function () {
            const { isEmpty } = await contract.call("empty", { identification });
            expect(isEmpty).to.equal(BigInt(1));
        });

        it("Should create a stack, push a value and expect that it is not empty.", async function () {
            await contract.invoke("push", { identification, valueToPush: 1 });
            const { isEmpty } = await contract.call("empty", { identification });
            expect(isEmpty).to.equal(BigInt(0));
        });
    });

    describe("Testing push & pop", function () {
        it("Should push a felt, pop the stack and make sure they match.", async function () {
            await contract.invoke("push", { identification, valueToPush });
            const { poppedValue } = await contract.call("pop", { identification });
            expect(poppedValue).to.equal(BigInt(valueToPush));
        });

        it("Should push a felt, pop the stack and make sure it is empty.", async function () {
            await contract.invoke("push", { identification, valueToPush });
            await contract.invoke("pop", { identification });
            const { isEmpty } = await contract.call("empty", { identification });
            expect(isEmpty).to.equal(BigInt(1));
        });

        it("Should push 3 felt, pop them and make sure they are correct.", async function () {
            let firstValue = valueToPush + 10;
            let secondValue = valueToPush;
            let thirdValue = valueToPush - 20;
            await contract.invoke("push", { identification, valueToPush: firstValue });
            await contract.invoke("push", { identification, valueToPush: secondValue });
            await contract.invoke("push", { identification, valueToPush: thirdValue });
            // First call to have the value, then actually invoke to execute it
            const { poppedValue: poppedValue1 } = await contract.call("pop", { identification });
            await contract.invoke("pop", { identification });
            const { poppedValue: poppedValue2 } = await contract.call("pop", { identification });
            await contract.invoke("pop", { identification });
            const { poppedValue: poppedValue3 } = await contract.call("pop", { identification });
            await contract.invoke("pop", { identification });
            expect(poppedValue1).to.equal(BigInt(thirdValue));
            expect(poppedValue2).to.equal(BigInt(secondValue));
            expect(poppedValue3).to.equal(BigInt(firstValue));
        });


        it("Should push 2 felt, pop and assert it is correct, push again 2 then pop them and ensure they are correct.", async function () {
            let firstValue = valueToPush + 10;
            let secondValue = valueToPush;
            let thirdValue = valueToPush - 20;
            let fourthalue = valueToPush * 2;
            // First call to have the value, then actually invoke to execute it
            await contract.invoke("push", { identification, valueToPush: firstValue });
            await contract.invoke("push", { identification, valueToPush: secondValue });
            const { poppedValue: poppedValue1 } = await contract.call("pop", { identification });
            await contract.invoke("pop", { identification });
            await contract.invoke("push", { identification, valueToPush: thirdValue });
            await contract.invoke("push", { identification, valueToPush: fourthalue });
            const { poppedValue: poppedValue2 } = await contract.call("pop", { identification });
            await contract.invoke("pop", { identification });
            const { poppedValue: poppedValue3 } = await contract.call("pop", { identification });
            await contract.invoke("pop", { identification });
            const { poppedValue: poppedValue4 } = await contract.call("pop", { identification });
            await contract.invoke("pop", { identification });
            expect(poppedValue1).to.equal(BigInt(secondValue));
            expect(poppedValue2).to.equal(BigInt(fourthalue));
            expect(poppedValue3).to.equal(BigInt(thirdValue));
            expect(poppedValue4).to.equal(BigInt(firstValue));
        });

        it("Should pop on an empty stack and ensure that the error is thrown with the correct message.", async function () {
            try {
                await contract.call("pop", { identification })
            } catch (error) {
                expect(error.message).to.include("Stack empty");
            }
        });
    });

    describe("Testing peek", function () {
        it("Should push a felt, peek the stack and assert the value is correct", async function () {
            await contract.invoke("push", { identification, valueToPush });
            const { peekedValue } = await contract.call("peek", { identification });
            expect(peekedValue).to.equal(BigInt(valueToPush));
        });

        it("Should push a felt, peek the stack and assert it is not empty", async function () {
            await contract.invoke("push", { identification, valueToPush });
            await contract.invoke("peek", { identification });
            const { isEmpty } = await contract.call("empty", { identification });
            expect(isEmpty).to.equal(BigInt(0));
        });

        it("Should peak on an empty stack and ensure that the error is thrown with the correct message.", async function () {
            try {
                await contract.call("peek", { identification })
            } catch (error) {
                expect(error.message).to.include("Stack empty");
            }
        });
    });

    describe("Testing search", function () {
        it("Should search on an empty stack and return 0.", async function () {
            const { containsValue } = await contract.call("search", { identification, valueToSearch: valueToPush });
            expect(containsValue).to.equal(BigInt(0));

        });

        it("Should search on a stack of size 1 and expect to find it.", async function () {
            await contract.invoke("push", { identification, valueToPush });
            const { containsValue } = await contract.call("search", { identification, valueToSearch: valueToPush });
            expect(containsValue).to.equal(BigInt(1));

        });

        it("Should search on a stack of size 1 and expect NOT to find it.", async function () {
            await contract.invoke("push", { identification, valueToPush });
            const { containsValue } = await contract.call("search", { identification, valueToSearch: valueToPush + 1 });
            expect(containsValue).to.equal(BigInt(0));

        });

        it("Should search on a stack of size 3 and expect to find all 3 of them.", async function () {
            await contract.invoke("push", { identification, valueToPush: 42 });
            await contract.invoke("push", { identification, valueToPush: 9 });
            await contract.invoke("push", { identification, valueToPush: 12 });
            const { containsValue: contains42 } = await contract.call("search", { identification, valueToSearch: 42 });
            const { containsValue: contains9 } = await contract.call("search", { identification, valueToSearch: 9 });
            const { containsValue: contains12 } = await contract.call("search", { identification, valueToSearch: 12 });

            expect(contains42).to.equal(BigInt(1));
            expect(contains9).to.equal(BigInt(1));
            expect(contains12).to.equal(BigInt(1));
        });

        it("Should search on a stack of size 3 and expect to find NONE.", async function () {
            await contract.invoke("push", { identification, valueToPush: 42 });
            await contract.invoke("push", { identification, valueToPush: 9 });
            await contract.invoke("push", { identification, valueToPush: 12 });
            const { containsValue: contains42 } = await contract.call("search", { identification, valueToSearch: 10 });
            expect(contains42).to.equal(BigInt(0));

            const { containsValue: contains9 } = await contract.call("search", { identification, valueToSearch: 8 });
            expect(contains9).to.equal(BigInt(0));
        });

        describe("Testing limits", function () {
            it("Should search 0 on an empty stack and expect NOT to find it.", async function () {
                const { containsValue: contains42 } = await contract.call("search", { identification, valueToSearch: 0 });
                expect(contains42).to.equal(BigInt(0));
            });

            it("Should search 0 on a stack and expect NOT to find it.", async function () {
                await contract.invoke("push", { identification, valueToPush: 42 });
                await contract.invoke("push", { identification, valueToPush: 9 });
                await contract.invoke("push", { identification, valueToPush: 12 });
                const { containsValue } = await contract.call("search", { identification, valueToSearch: 0 });
                expect(containsValue).to.equal(BigInt(0));
            });

            it("Should look for 0 when it is on first position.", async function () {
                await contract.invoke("push", { identification, valueToPush: 0 });
                await contract.invoke("push", { identification, valueToPush: 9 });
                await contract.invoke("push", { identification, valueToPush: 12 });
                const { containsValue } = await contract.call("search", { identification, valueToSearch: 0 });
                expect(containsValue).to.equal(BigInt(1));
            });

            it("Should look for 0 when it is in the middle position.", async function () {
                await contract.invoke("push", { identification, valueToPush: 42 });
                await contract.invoke("push", { identification, valueToPush: 0 });
                await contract.invoke("push", { identification, valueToPush: 12 });
                const { containsValue } = await contract.call("search", { identification, valueToSearch: 0 });
                expect(containsValue).to.equal(BigInt(1));
            });

            it("Should look for 0 when it is on last position.", async function () {
                await contract.invoke("push", { identification, valueToPush: 42 });
                await contract.invoke("push", { identification, valueToPush: 9 });
                await contract.invoke("push", { identification, valueToPush: 0 });
                const { containsValue } = await contract.call("search", { identification, valueToSearch: 0 });
                expect(containsValue).to.equal(BigInt(1));
            });
        });
    });
});