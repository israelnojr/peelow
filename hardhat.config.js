require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const {PRIVATE_KEY_1, PRIVATE_KEY, ETHERSCAN_KEY, COINMARKETCAP_KEY, SEPOLIA_RPC_URL, POLYGON_RPC_URL} = process.env

module.exports = {
  solidity: "0.8.1",

  defaultNetwork: "localhost",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
           // chainId: 11155111,
            blockConfirmations: 6,
        },
        polygon:{
            url: POLYGON_RPC_URL || "",
            accounts: [PRIVATE_KEY_1] || "",
            blockConfirmations: 6
          },
          localhost:{
            url: "http://127.0.0.1:8545/",
            chainId: 31337
          }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
        ],
    },
    etherscan: {
        apiKey: ETHERSCAN_KEY,
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, 
            1: 0, 
        },
    },
};
