const hre = require('hardhat')
const { expect } = require('chai')
let MyErc1155TokenABI = require('../../artifacts/contracts/v2/MyErc1155Token.sol/MyErc1155Token.json')
const { ethers } = hre
const { BigNumber, Signer } = require('ethers')
const pairrouterAbi = require('../../artifacts/contracts/v2/LSSVMRouter.sol/LSSVMRouter.json')
const pairFactoryAbi = require('../../artifacts/contracts/v2/LSSVMPairFactory.sol/LSSVMPairFactory.json')
const erc1155Abi = require('../../artifacts/contracts/v2/MyErc1155Token.sol/MyErc1155Token.json')
const erc20Abi = require('../../artifacts/contracts/v2/MyErc20Token.sol/MyErc20Token.json')
const linearcurveAbi = require('../../artifacts/contracts/v2/bonding-curves/LinearCurve.sol/LinearCurve.json')

describe('eth test', async () => {
    let provider
    let sellAddress= "0x5f211e7f358DA4cF4412785691BD9d2113F09E89"
    let buyAddress = "0x01884737E4C2C4ca7E7C0dF4A78B5DE9B517A625"
    let operatorAddress = "0x151680418925b2316d1bd1420e0f0D778228593d"
    let buySigner
    let sellSigner
    let operatorSigner
    let erc1155ContractAddress = "0xd6aeAd1Fc4125Ba049AE9F5D1E78E5C38C2c246E"
    let erc20ContractAddress = "0x766A32b677D53DdBF343874d1fFBb0B97f8D5F02"
    let pairfactoryAddress = "0xbF237C71aE90405480dc07eb07ca45fc9c860923"
    let pairrouterAddress = "0xc021918294434b7ef8567F5f73BA662F6B9F2c80"
    let linearcurveAddress = "0x84C6829705466F4947DD431807A6ebC7B52a73b5"

    let erc1155Contract
    let erc1155Contract1
    let erc20Contract
    let pairfactoryContract
    let pairrouterContract

    beforeEach(async () => {
        provider = new ethers.providers.JsonRpcProvider(process.env.goerliUrl);
        buySigner = new ethers.Wallet(process.env.goerliBuy, provider);
        sellSigner = new ethers.Wallet(process.env.goerliSell, provider);
        operatorSigner = new ethers.Wallet(process.env.goerliOperator, provider);
        
        erc20Contract = new ethers.Contract(erc20ContractAddress,erc20Abi.abi).connect(buySigner); 
        pairfactoryContract = new ethers.Contract(pairfactoryAddress,pairFactoryAbi.abi).connect(sellSigner); 
        pairrouterContract = new ethers.Contract(pairrouterAddress,pairrouterAbi.abi).connect(buySigner); 

        erc1155Contract1 = new ethers.Contract(erc1155ContractAddress,erc1155Abi.abi).connect(sellSigner);
    })

    it("setOperatorProtocolFee", async () => {
        await pairfactoryContract.authorize(erc1155Contract1.address, operatorAddress)
        const pairfactoryContract1 = new ethers.Contract(pairfactoryAddress, pairFactoryAbi.abi).connect(operatorSigner)
        await pairfactoryContract1.setOperatorProtocolFee(erc1155Contract1.address, operatorAddress, ethers.utils.parseEther("0.005"))
    })

    it("trader buy", async () => {
        expect(await erc1155Contract1.balanceOf(sellAddress,1)).to.equal(1);
        await erc1155Contract1.setApprovalForAll(pairfactoryContract.address, true)

        const createtradelpool = await pairfactoryContract.createPair1155ERC20(
            [
                erc20Contract.address,
                erc1155ContractAddress,
                linearcurveAddress,
                sellAddress,
                1,
                100000,  // delta
                0,
                500000,
                [1],
                0
            ]
        )
        const txReceipt = await createtradelpool.wait();
        const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]
        // const poolAddress = "0x409c4CdfF37173c5D77e1E8c356fe79db5b8DA87";
        console.log("poolAddress:",poolAddress);
        expect(await erc1155Contract1.balanceOf(poolAddress,1)).to.equal(1);

        await erc20Contract.approve(pairrouterAddress, 60000000000)

        ////////////////////// buy test robustswapethforspecificNFTs
        const maxCost = 50000000
        const swapList = [[[poolAddress, [1]], maxCost]]
        const ddl = (await ethers.provider.getBlock("latest")).timestamp * 2;
        const robustBuy = await pairrouterContract.robustSwapERC20ForSpecificNFTs(swapList, maxCost, buyAddress, ddl)
        await robustBuy.wait()
        expect(await erc1155Contract1.balanceOf(buyAddress,1)).to.equal(1);
    })

    it("trader sell", async () => {
        expect(await erc1155Contract1.balanceOf(buyAddress,1)).to.equal(1);
        erc1155Contract1 = new ethers.Contract(erc1155ContractAddress,erc1155Abi.abi).connect(buySigner);
        await erc1155Contract1.setApprovalForAll(pairrouterAddress, true)

        erc20Contract = new ethers.Contract(erc20ContractAddress,erc20Abi.abi).connect(sellSigner); 
        await erc20Contract.approve(pairfactoryAddress, 500000)
        const createtradelpool = await pairfactoryContract.createPair1155ERC20(
            [
                erc20Contract.address,
                erc1155ContractAddress,
                linearcurveAddress,
                sellAddress,
                0,
                10000,  // delta
                0,
                50000,
                [],
                60000
            ]
        )
        const txReceipt = await createtradelpool.wait();
        const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]

        console.log("poolAddress:",poolAddress);

        ////////////////////// buy test robustswapethforspecificNFTs
        const minOutput = 0
        const swapList = [[[poolAddress, [1]], minOutput]]
        const ddl = (await ethers.provider.getBlock("latest")).timestamp * 2;
        const robustSell = await pairrouterContract.robustSwapNFTsForToken(swapList, buyAddress, ddl)
        await robustSell.wait()
        expect(await erc1155Contract1.balanceOf(sellAddress,1)).to.equal(1);
    })
})