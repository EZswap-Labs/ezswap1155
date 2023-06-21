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
    let sellAddress = "0x342E697899E050c24b176F7D1114181Bc03f2dCf"
    let buyAddress = "0xe87e78c78206576938C27CFF8Ea070eBa90884A4"
    let operatorAddress = "0x151680418925b2316d1bd1420e0f0D778228593d"
    let buySigner
    let sellSigner
    let operatorSigner
    let erc1155ContractAddress = "0x8CDF8bcb344DAeC3D2DBEE23e78AFA65Ac5D20c0"
    let pairfactoryAddress = "0xDe0293798084CC26D8f11784C9F09F7a967BEce5"
    let pairrouterAddress = "0xDc589E5D0260eDf624bc7a8c8543a31473B6B519"
    let linearcurveAddress = "0xD38E321D0B450DF866B836612FBB5EECE3e4804e"

    let erc1155Contract1
    let pairfactoryContract
    let pairrouterContract

    beforeEach(async () => {
        provider = new ethers.providers.JsonRpcProvider(process.env.goerliUrl);
        buySigner = new ethers.Wallet(process.env.goerliBuy, provider);
        sellSigner = new ethers.Wallet(process.env.goerliSell, provider);
        operatorSigner = new ethers.Wallet(process.env.goerliOperator, provider);

        pairfactoryContract = new ethers.Contract(pairfactoryAddress,pairFactoryAbi.abi).connect(sellSigner); 
        pairrouterContract = new ethers.Contract(pairrouterAddress,pairrouterAbi.abi).connect(buySigner); 

        erc1155Contract1 = new ethers.Contract(erc1155ContractAddress,erc1155Abi.abi).connect(sellSigner);

    })

    it.skip("setOperatorProtocolFee", async () => {
        await pairfactoryContract.authorize(erc1155Contract1.address, operatorAddress)
        const pairfactoryContract1 = new ethers.Contract(pairfactoryAddress, pairFactoryAbi.abi).connect(operatorSigner)
        await pairfactoryContract1.setOperatorProtocolFee(erc1155Contract1.address, operatorAddress, ethers.utils.parseEther("0.005"))
    })


    it.skip("trader buy", async () => {
        // expect(await erc1155Contract1.balanceOf(sellAddress,1)).to.equal(100);
        
        // await erc1155Contract1.setApprovalForAll(pairfactoryContract.address, true)
        // const createtradelpool = await pairfactoryContract.createPair1155ETH(
        //     erc1155Contract1.address,
        //     linearcurveAddress,
        //     sellAddress,
        //     1,
        //     0,  // delta
        //     0,
        //     ethers.utils.parseEther("0.001"),
        //     2,
        //     10
        // )
        // const txReceipt = await createtradelpool.wait();
        // const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]
        // console.log("poolAddress:",poolAddress);
        // expect(await erc1155Contract1.balanceOf("0x917c13c077Aa72C117cF242D2eDc73c3733eb3C8",1)).to.equal(10);
        //////////////////// buy test robustswapethforspecificNFTs
        console.log("nft balance:",await erc1155Contract1.balanceOf(buyAddress,2))
        console.log("block number:",await ethers.provider.getBlockNumber());
        console.log("pool nft balance:",await erc1155Contract1.balanceOf("0x81504fB3A7Df820B28E150685a0d46b07644a8Db",2));
        const maxCost = hre.ethers.utils.parseEther("0.1")
        const swapList = [[["0x81504fB3A7Df820B28E150685a0d46b07644a8Db", [2], [2]], maxCost]]
        const ddl = (await ethers.provider.getBlock("latest")).timestamp * 2;
        const robustBuy = await pairrouterContract.robustSwapETHForSpecificNFTs(swapList, buyAddress, buyAddress, ddl, { value: maxCost })
        await robustBuy.wait();
        console.log("nft balance:",await erc1155Contract1.balanceOf(buyAddress,2))
        // console.log("----------------");
        // const robustBuy1 = await pairrouterContract.robustSwapETHForSpecificNFTs(swapList, buyAddress, buyAddress, ddl, { value: maxCost })
        // await robustBuy1.wait();
        // expect(await erc1155Contract1.balanceOf(buyAddress,1)).to.equal(10);
    })

    it("trader sell", async () => {
        // expect(await erc1155Contract1.balanceOf(buyAddress,1)).to.equal(10);
        erc1155Contract1 = new ethers.Contract(erc1155ContractAddress,erc1155Abi.abi).connect(buySigner);
        await erc1155Contract1.setApprovalForAll(pairrouterAddress, true)
        const createtradelpool = await pairfactoryContract.createPair1155ETH(
            erc1155Contract1.address,
            linearcurveAddress,
            sellAddress,
            0,
            0,  // delta
            0,
            ethers.utils.parseEther("0.001"),
            1,
            0,
            { value: ethers.utils.parseEther("0.01")}
        )
        const txReceipt = await createtradelpool.wait();
        const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]

        console.log("poolAddress:",poolAddress);
        ////////////////////// buy test robustswapethforspecificNFTs
        const minOutput = hre.ethers.utils.parseEther("0")
        const swapList = [[[poolAddress, [1], [2]], minOutput]]
        const ddl = (await ethers.provider.getBlock("latest")).timestamp * 2;
        const robustSell = await pairrouterContract.robustSwapNFTsForToken(swapList, buyAddress, ddl)
        await robustSell.wait()
        // expect(await erc1155Contract1.balanceOf(sellAddress,1)).to.equal(5);
    })
})