// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public nftAddress;
    uint public nftId;
    uint public purchasePrice;
    uint public escrowAmount;
    address payable public seller;
    address payable public buyer;
    address public inspector;
    address public lender;

    bool public isInspectionPassed = false;

    mapping(address => bool) public approval;

    constructor(
        address _nftAddress,
        uint _nftId,
        uint _purchasePrice,
        uint _escrowAmount,
        address payable _seller,
        address payable _buyer,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        nftId = _nftId;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        seller = _seller;
        buyer = _buyer;
        inspector = _inspector;
        lender = _lender;
    }

    // access modifiers
    modifier onlyBuyer() {
        require(msg.sender == buyer, "You are not a buyer !!");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "You are not an inspector !!");
        _;
    }

    // receive function enables to receive ethers to the contract
    receive() external payable{
        // if you want to do some logic then one can write in this function
    }

    // EARNEST MONEY: type of deposit paid by home buyers to sellers or downpayment
    function depositeEarnest() public payable onlyBuyer {
        require(
            msg.value >= escrowAmount,
            "Not enough earnest paid !! Earnest must be minimum of 20 ETHs"
        );
    }

    function updateInspectionStatus(bool _inspectionPassed)
        public
        onlyInspector
    {
        isInspectionPassed = _inspectionPassed;
    }

    function setApproval() public {
        approval[msg.sender] = true;
    }

    function getApprovalStatus() public view returns (bool) {
        return approval[msg.sender];
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    function finalizeSale() public {
        // before finalize the property the inspection must be passed by the inspector
        require(
            isInspectionPassed,
            "Inspection of this property is not passed yet by the inspector !!"
        );
        require(approval[buyer], "Buyer didn't give the approval");
        require(approval[seller], "Seller didn't give the approval");
        require(approval[lender], "Lender didn't give the approval");
        // before finalizing the property make sure that the contract has enought balance
        require(address(this).balance >= purchasePrice, "Not have enough balance");

         (bool success, ) = payable(seller).call{value: purchasePrice}("");
         require(success, "Transaction failed by call !!");

        // Transfer ownership of property
        IERC721(nftAddress).transferFrom(seller, buyer, nftId);
    }
}
