require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()



const { setGlobalDispatcher, ProxyAgent } = require('undici')
// const proxyAgent = new ProxyAgent('http://127.0.0.1:1086')
// setGlobalDispatcher(proxyAgent)

//0x151680418925b2316d1bd1420e0f0D778228593d
const goerliAccount = process.env.goerliAccount
const goerliUrl = process.env.goerliUrl

const maticAccount = process.env.maticAccount
const maticUrl = process.env.maticUrl

const scrollAccount = process.env.scrollAccount
const scrollUrl = process.env.scrollUrl

const ethscanKey = process.env.ethscanKey


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: { yul: false },
      },
    },
  },

  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },

  networks: {
    hardhat: {
      blockGasLimit: 30_000_000,
      throwOnCallFailures: false,
      allowUnlimitedContractSize: true,
    },
    goerli: {
      url: goerliUrl,
      accounts: [
        goerliAccount
      ],
      chainId: 5,
      allowUnlimitedContractSize: true
    },
    matic: {
      url: maticUrl,
      accounts: [maticAccount],
      allowUnlimitedContractSize: true,
      chainId: 137
    },
    scroll: {
      url: scrollUrl,
      accounts: [scrollAccount],
      allowUnlimitedContractSize: true,
      chainId: 534353
    }
  },
  etherscan: {
    apiKey: ethscanKey
  },
  mocha: {
    timeout: 100000000
  },
};
