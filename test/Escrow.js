const { expect } = require('chai');
const { ethers } = require('hardhat');
const {tokens} = require("../helper-hardhat-config")

describe('Deployments', () => {
    let peeLow, escrow
    let buyer, seller, inspector, lender

    beforeEach(async function (){
        [buyer, seller, inspector, lender] = await ethers.getSigners()
        
        const PeeLow = await ethers.getContractFactory("PeeLow")
        peeLow = await PeeLow.deploy()
        let transactionResponse = await peeLow.connect(seller).mint("https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/1.png")
        await transactionResponse.wait(1)

        const Escrow = await ethers.getContractFactory("Escrow")
        escrow = await Escrow.deploy(
            peeLow.address,
            seller.address,
            inspector.address,
            lender.address
        )
        transaction = await peeLow.connect(seller).approve(escrow.address, 1)
        await transaction.wait(1)

        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
        await transaction.wait(1)
    })
    it("Returns NFT Address", async() => {
        const nftAddress = await escrow.nftAddress()
        expect(nftAddress).to.be.equal(peeLow.address)
    })

    it("Returns Seller Address", async() => {
        const sellerAddress = await escrow.seller()
        expect(sellerAddress).to.be.equal(seller.address)
    })

    it("Returns Inspector Address", async() => {
        const inspectorAddress = await escrow.inspector()
        expect(inspectorAddress).to.be.equal(inspector.address)
    })

    it("Returns Lender Address", async() => {
        const lenderAddress = await escrow.lender()
        expect(lenderAddress).to.be.equal(lender.address)
    } )

    describe('Listing', () => {
        // it("should only allow the seller to call the list function", async () => {
        //     try {
        //         await escrow.connect(buyer).list(1, buyer.address, tokens(10), tokens(5)); 
        //         expect.fail("Function should revert when called by a non-seller account");
        //     } catch (error) {
        //         expect(error.message).to.include("Only the property seller can call this method");
        //     }
        //     const transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5));
        //     await transaction.wait(1);

        //     const isListed = await escrow.isListed(1);
        //     expect(isListed).to.be.equal(true);
        // })

        it("Update is Listed", async () => {
            const isListed = await escrow.isListed(1)
            expect(isListed).to.be.equal(true)
        })
        it("Update Ownership", async() => {
            expect(await peeLow.ownerOf(1)).to.be.equal(escrow.address)
        })
        it("Returns Buyer", async() => {
            const buyerAddress = await escrow.buyer(1)
            expect(buyerAddress).to.be.equal(buyer.address)
        })
        it("Returns purchase price", async() => {
            const purchasePrice = await escrow.purchasePrice(1)
            expect(purchasePrice).to.be.equal(tokens(10))
        })
        it("Returns escrow amount", async() => {
            const escrowAmount = await escrow.escrowAmount(1)
            expect(escrowAmount).to.be.equal(tokens(5))
        })
    })

    describe("Deposit", () => {
        it("Should updates contract balance", async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, {value: tokens(5)})
            await transaction.wait(1)
            const balance = await escrow.getLastTransactionAmount()
            expect(balance).to.be.equal(tokens(5))
        })
    })

    describe("Inspection", () => {
        it("Should update inspection status", async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait(1)
            const inspectionStatus = await escrow.inspectionPassed(1)
            expect(inspectionStatus).to.be.equal(true)
        })
    })
    describe("Approval", () => {
        it("Should update approval status", async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait(1)

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait(1)

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait(1)

            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)
        })
    })

    describe("Sale", () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).depositEarnest(1, {value: tokens(5)})
            await transaction.wait(1)

            transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait(1)

            transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait(1)

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait(1)

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait(1)

            await lender.sendTransaction({to: escrow.address, value: tokens(5)})
            
            transaction = await escrow.connect(seller).finalizeSale(1)
            await transaction.wait(1)
        })

        it("Should update balance", async () => {
            expect(await escrow.getLastTransactionAmount()).to.be.equal(0)
        })
        it("Should update the ownership", async () => {
            expect(await peeLow.ownerOf(1)).to.be.equal(buyer.address)
        })
    })
})


