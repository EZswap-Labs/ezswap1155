const hre = require('hardhat')
const { expect } = require('chai')
const { ethers } = hre
const { BigNumber, Signer } = require('ethers')
const pairFactoryAbi = require('../../artifacts/contracts/v2/LSSVMPairFactory.sol/LSSVMPairFactory.json')
const pairAbi = require('../../artifacts/contracts/v2/LSSVMPair.sol/LSSVMPair.json')
const erc1155Abi = require('../../artifacts/contracts/v2/MyErc1155Token.sol/MyErc1155Token.json')

describe('eth test', async () => {
    let provider
    let operator1Address = "0xe87e78c78206576938C27CFF8Ea070eBa90884A4"
    let operator2Address = "0x151680418925b2316d1bd1420e0f0D778228593d"
    let sellSigner
    let operator1Signer
    let operator2Signer
    let pairfactoryAddress = "0xB76aE0d5EdFc84976143aC62988f0179C232710D"
    let erc721Address = "0x8e81970ceb63c236534a763c0ecb611d2d16189f"
    let erc1155Address = "0xad2f2ae5e421f9f9764513278e7f6e00d3668c95"
    let pairfactoryContract

    let linearcurveAddress = "0xBD3B05CBC7F36744e6892E314553f9a6c351cDA8"
    let sellAddress = "0x5f211e7f358DA4cF4412785691BD9d2113F09E89"

    let erc1155Contract

    beforeEach(async () => {
        provider = new ethers.providers.JsonRpcProvider(process.env.goerliUrl);
        sellSigner = new ethers.Wallet(process.env.goerliAccount, provider);
        operator1Signer = new ethers.Wallet(process.env.operator1Signer, provider);
        operator2Signer = new ethers.Wallet(process.env.operator2Signer, provider);
        pairfactoryContract = new ethers.Contract(pairfactoryAddress,pairFactoryAbi.abi).connect(sellSigner);

        erc1155Contract = new ethers.Contract(erc1155Address, erc1155Abi.abi).connect(sellSigner);
    })

    it.skip("setOperatorProtocolFee 1", async () => {
        await pairfactoryContract.authorize(erc721Address, operator1Address)
        const pairfactoryContract1 = new ethers.Contract(pairfactoryAddress, pairFactoryAbi.abi).connect(operator1Signer)
        await pairfactoryContract1.setOperatorProtocolFee(erc721Address, operator1Address, ethers.utils.parseEther("0.005"))
        console.log("await pairfactoryContract.getNftOperators(erc721Address) 1:",await pairfactoryContract.getNftOperators(erc721Address))
        console.log("aaa:",await pairfactoryContract.operatorProtocolFeeMultipliers(erc721Address,operator1Signer.address))
    })

    it.skip("setOperatorProtocolFee 2", async () => {
        await pairfactoryContract.authorize(erc1155Address, operator2Address)
        const pairfactoryContract1 = new ethers.Contract(pairfactoryAddress, pairFactoryAbi.abi).connect(operator2Signer)
        await pairfactoryContract1.setOperatorProtocolFee(erc1155Address, operator2Address, ethers.utils.parseEther("0.01"))
        console.log("await pairfactoryContract.getNftOperators(erc1155Address) 2:",await pairfactoryContract.getNftOperators(erc1155Address))
        console.log("aaa:",await pairfactoryContract.operatorProtocolFeeMultipliers(erc721Address,operator1Signer.address))
    })

    it.skip("erc721", async () => {
        console.log("aaa:",await pairfactoryContract.operatorProtocolFeeMultipliers(erc1155Address,operator2Signer.address))
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
        await erc1155Contract.setApprovalForAll(pairfactoryContract.address, true);
        const createtradelpool = await pairfactoryContract.createPair1155ETH(
            erc1155Address,
            linearcurveAddress,
            sellAddress,
            0,
            ethers.utils.parseEther("0.01"),  // delta
            0,
            ethers.utils.parseEther("0.01"),
            [],
            [],
            { value: ethers.utils.parseEther("0.02")}
        )
        const txReceipt = await createtradelpool.wait();
        const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]

        console.log("poolAddress:",poolAddress);
    })

    it("test", async () => {
        const setfee = await pairfactoryContract.changeProtocolFeeMultiplier(
            hre.ethers.utils.parseEther("0.001")
          );
    })

})