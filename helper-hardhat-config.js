const { metadata } = require('./metadata')
const networkConfig = {
    sepolia: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    polygon: {
        name: "polygon",
        ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A"
    }
}

const developmentChains = ["hardhat", "localhost"]
const DECIMAL = 8
const INITIAL_ANSWER = 200000000000

function tokens(tokenAmount) {
    return ethers.utils.parseUnits(tokenAmount.toString(), 'ether');
}

function accessMetadata() {
    if (metadata.length > 0) {
        metadata.forEach(property => {
            const propertyId = Object.keys(property)[0]
            const propertyDetails = property[propertyId]

            console.log(`Property ${propertyId}:`);
            console.log('Name:', propertyDetails.name);
            console.log('Address:', propertyDetails.address);
            console.log('Description:', propertyDetails.description);
            console.log('Image:', propertyDetails.image);
            console.log('Attributes:');
            propertyDetails.attributes.forEach(attribute => {
                console.log(attribute.trait_type + ':', attribute.value);
            });
            console.log('\n');
        });
    } else {
        console.log('Metadata array is empty.');
    }
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function performTransactions(escrow, buyer, seller) {
    if (metadata.length > 0) {
        for (const property of metadata) {
            const propertyId = Object.keys(property)[0]

            const buyAmount = getRandomNumber(1, 100);
            const escrowAmount = getRandomNumber(1, buyAmount / 2);

            const transaction = await escrow.connect(seller).list(
                propertyId,
                buyer.address,
                tokens(buyAmount),
                tokens(escrowAmount)
            );
            await transaction.wait(1);

            console.log(`Transaction completed for property ${propertyId}`);
        }
    } else {
        console.log('Metadata array is empty.');
    }
}

module.exports = {
    networkConfig,
    developmentChains,
    DECIMAL,
    INITIAL_ANSWER,
    tokens,
    accessMetadata,
    performTransactions
}