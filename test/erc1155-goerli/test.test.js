const hre = require('hardhat')
const { expect } = require('chai')
const { ethers } = hre
const { BigNumber, Signer } = require('ethers')
const pairFactoryAbi = require('../../artifacts/contracts/v2/LSSVMPairFactory.sol/LSSVMPairFactory.json')
const pairAbi = require('../../artifacts/contracts/v2/LSSVMPair.sol/LSSVMPair.json')

describe('eth test', async () => {
    let provider
    let operator1Address = "0xe87e78c78206576938C27CFF8Ea070eBa90884A4"
    let operator2Address = "0x151680418925b2316d1bd1420e0f0D778228593d"
    let sellSigner
    let operator1Signer
    let operator2Signer
    let pairfactoryAddress = "0xbF237C71aE90405480dc07eb07ca45fc9c860923"
    let erc721Address = "0x8e81970ceb63c236534a763c0ecb611d2d16189f"
    let erc1155Address = "0xad2f2ae5e421f9f9764513278e7f6e00d3668c95"
    let pairfactoryContract

    let pair3Address = "0x3b7f346014dd8dC23Af241669AE00735C6F34b45";
    let pair4Address = "0xc070cd58a837aff3cf9d49cc6ef86dedd020f17e";
    let pair
    let pair1
    let linearcurveAddress = "0x84C6829705466F4947DD431807A6ebC7B52a73b5"
    let sellAddress = "0x151680418925b2316d1bd1420e0f0D778228593d"

    beforeEach(async () => {
        provider = new ethers.providers.JsonRpcProvider(process.env.goerliUrl);
        sellSigner = new ethers.Wallet(process.env.goerliSell, provider);
        operator1Signer = new ethers.Wallet(process.env.operator1Signer, provider);
        operator2Signer = new ethers.Wallet(process.env.operator2Signer, provider);
        pairfactoryContract = new ethers.Contract(pairfactoryAddress,pairFactoryAbi.abi).connect(sellSigner);

        pair = new ethers.Contract(pair3Address, pairAbi.abi).connect(sellSigner)
        pair1 = new ethers.Contract(pair4Address, pairAbi.abi).connect(sellSigner)
    })

    it("setOperatorProtocolFee 1", async () => {
        // await pairfactoryContract.authorize(pair1Address, operator1Address)
        // const pairfactoryContract1 = new ethers.Contract(pairfactoryAddress, pairFactoryAbi.abi).connect(operator1Signer)
        // await pairfactoryContract1.setOperatorProtocolFee(pair1Address, operator1Address, ethers.utils.parseEther("0.005"))
        console.log("await pairfactoryContract.getNftOperators(pair1Address) 1:",await pairfactoryContract.getNftOperators(erc721Address))
        console.log("aaa:",await pairfactoryContract.operatorProtocolFeeMultipliers(erc721Address,operator1Signer.address))
    })

    it("setOperatorProtocolFee 2", async () => {
        await pairfactoryContract.authorize(pair2Address, operator2Address)
        const pairfactoryContract1 = new ethers.Contract(pairfactoryAddress, pairFactoryAbi.abi).connect(operator2Signer)
        await pairfactoryContract1.setOperatorProtocolFee(pair2Address, operator2Address, ethers.utils.parseEther("0.001"))
        console.log("await pairfactoryContract.getNftOperators(pair1Address):",await pairfactoryContract.getNftOperators(erc1155Address))
    })

    it.skip("erc721", async () => {
        const createtradelpool = await pairfactoryContract.createPairETH(
            erc721Address,
            linearcurveAddress,
            sellAddress,
            0,
            ethers.utils.parseEther("0.01"),  // delta
            0,
            ethers.utils.parseEther("0.01"),
            [],
            { value: ethers.utils.parseEther("0.02")}
        )
        const txReceipt = await createtradelpool.wait();
        const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]

        console.log("poolAddress:",poolAddress);
    })

    it.skip("erc1155", async () => {
        const createtradelpool = await pairfactoryContract.createPair1155ETH(
            erc1155Address,
            linearcurveAddress,
            sellAddress,
            0,
            ethers.utils.parseEther("0.01"),  // delta
            0,
            ethers.utils.parseEther("0.01"),
            [],
            { value: ethers.utils.parseEther("0.02")}
        )
        const txReceipt = await createtradelpool.wait();
        const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]

        console.log("poolAddress:",poolAddress);
    })


})