const hre = require("hardhat");
const {tokens, accessMetadata, performTransactions} = require("../helper-hardhat-config")
const { metadata } = require('../metadata')

async function main() {
  const [buyer, seller, inspector, lender] = await ethers.getSigners()
  const PeeLow = await ethers.getContractFactory("PeeLow")
  const peeLow = await PeeLow.deploy()
  await peeLow.deployed()
  console.log(`Deployed Pelow Contract at: ${peeLow.address}`)

  console.log(`Minting ${metadata.length} properties...\n`)

  for (let i = 0; i < metadata.length; i++) {
    const transaction = await peeLow.connect(seller).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`)
    await transaction.wait(1)
  }

  const Escrow = await ethers.getContractFactory('Escrow')
  const escrow = await Escrow.deploy(
    peeLow.address,
    seller.address,
    inspector.address,
    lender.address
  )
  await escrow.deployed()

  console.log(`Deployed Escrow Contract at: ${escrow.address}`)
  console.log(`Listing ${metadata.length} properties...\n`)

  for (let i = 0; i < metadata.length; i++) {
    let transaction = await peeLow.connect(seller).approve(escrow.address, i + 1)
    await transaction.wait(1)
  }

  performTransactions(escrow, buyer, seller).catch(err => console.error('Error performing transactions:', err));
  console.log("Finished!")
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
