const { expect } = require("chai");
const { ethers } = require("hardhat");

const parseEthers = (amount) => {
  return ethers.utils.parseUnits(amount.toString(), "ether");
};


describe("FlashLoad", () => {
    let token, flashLoan

    beforeEach(async () => {
        // Setting up accounts
        accounts = await ethers.getSigners();
        deployer = accounts[0];

        // Load accounts
        const FlashLoan = await ethers.getContractFactory("FlashLoan");
        const FlashLoanReceiver = await ethers.getContractFactory("FlashLoanReceiver");
        const Token = await ethers.getContractFactory("Token");

        // Deploying Token
        token = await Token.deploy('Ishan Jagani', 'ISH', '10000000');

        // Deploying Falsh Loan Pool
        flashLoan = await FlashLoan.deploy(token.address);

    })

    describe("Deployment", () => {
        it('works', () => {
            expect(1+1).to.equal(2);
        })
    })
})