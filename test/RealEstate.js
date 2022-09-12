const { expect } = require("chai");
const { ethers } = require("hardhat");

const parseEthers = (amount) => {
  return ethers.utils.parseUnits(amount.toString(), "ether");
};

describe("RealEstate", () => {
  // Global Variables goes here
  let realEstate, escrow;
  let deployer, seller, buyer, inspector, lender;
  let nftID = 1; // 1 is the initial value in the RealEstate contract mint function
  let purchasePrice = parseEthers(100);
  let escrowAmount = parseEthers(20);

  beforeEach(async () => {
    // Setting Up the accounts
    const accounts = await ethers.getSigners();
    deployer = accounts[0]; // generally accounts or getSigners will be in array format
    seller = deployer;
    buyer = accounts[1];
    inspector = accounts[2];
    lender = accounts[3];

    // First lets load our contracts first
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    // Now its time to deploy our contracts
    realEstate = await RealEstate.deploy();
    escrow = await Escrow.deploy(
      realEstate.address,
      nftID,
      purchasePrice, // purchase price of the nft or property
      escrowAmount, // downpayment for the escrow
      seller.address,
      buyer.address,
      inspector.address,
      lender.address
    );

    // Seller Approves NFT
    transaction = await realEstate
      .connect(seller)
      .approve(escrow.address, nftID);
    await transaction.wait();
  });

  describe("Deployment", () => {
    it("sends a NFT to a seller/deployer", async () => {
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address); // seller will be object, so we are just getting the address property of that object
    });
  });

  describe("Selling real estate", () => {
    it("executes a successful transaction", async () => {
      // before transfering ownership owner must be seller
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

      // buyer deposits the earnest
      transaction = await escrow
        .connect(buyer)
        .depositeEarnest({ value: escrowAmount }); // value is passed because depositeEarnest is a payable function

      // checking the above deposited escrow amount
      balance = await escrow.getContractBalance();
      // console.log("Escrow Amount: ", ethers.utils.formatEther(balance));

      // Inspector updating the inspection status of property
      transaction = await escrow
        .connect(inspector)
        .updateInspectionStatus(true);
      await transaction.wait();

      // buyer approves the property
      transaction = await escrow.connect(buyer).setApproval();
      await transaction.wait();

      // selller approves the property
      transaction = await escrow.connect(seller).setApproval();
      await transaction.wait();

      // lender funds the contract or sale
      // * NOTE: sendTransaction is the function in ethers.js to transfer ethers from one account to another by passing two args to and value 
      transaction = await lender.sendTransaction({to: escrow.address, value: parseEthers(80)})
      // console.log("Updated balance: ",  parseEthers(await escrow.getContractBalance()));

      // lender approves the property
      transaction = await escrow.connect(lender).setApproval();
      await transaction.wait();

      // * Approval Logs
      // console.log(
      //   "Inspection Status: ",
      //   await escrow.isInspectionPassed()
      // );
      // console.log(
      //   "Buyer's status: ",
      //   await escrow.connect(buyer).getApprovalStatus()
      // );
      // console.log(
      //   "Seller's status: ",
      //   await escrow.connect(seller).getApprovalStatus()
      // );
      // console.log(
      //   "Lender's status: ",
      //   await escrow.connect(lender).getApprovalStatus()
      // );
      // ! Logs ends here

      let oldBalanceOfSeller = await ethers.provider.getBalance(seller.address);
      console.log("Old balance of seller: ", ethers.utils.formatEther(oldBalanceOfSeller));

      // transfering the ownership
      transaction = await escrow.connect(buyer).finalizeSale();
      await transaction.wait();
      console.log("Buyer finalize sale");

      // after transfering the ownership onwer must be the buyer
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);
      balance = await ethers.provider.getBalance(seller.address);
      console.log("Updated seller balance: ", ethers.utils.formatEther(balance));
      
      expect(balance).to.be.above(parseEthers(1099));
    });
  });
});
