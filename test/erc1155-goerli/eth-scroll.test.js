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
    let operatorAddress = "0x151680418925b2316d1bd1420e0f0D778228593d"
    let buySigner
    let sellSigner
    let operatorSigner
    let erc1155ContractAddress = "0xDe0293798084CC26D8f11784C9F09F7a967BEce5"
    let pairfactoryAddress = "0x3dAFd2E40f94dDf289Aa209298c010A3775c8Cb0"
    let pairrouterAddress = "0xfbA6e87E82b9F3b6d8D63B0a5eC892465Dd43C84"
    let linearcurveAddress = "0x2F3ED1D8cfDeA5647Ee5792279E14edB9DF38A69"

    let erc1155Contract1
    let pairfactoryContract
    let pairrouterContract

    beforeEach(async () => {
        provider = new ethers.providers.JsonRpcProvider(process.env.scrollUrl);
        buySigner = new ethers.Wallet(process.env.scrollBuy, provider);
        sellSigner = new ethers.Wallet(process.env.scrollSell, provider);
        operatorSigner = new ethers.Wallet(process.env.goerliOperator, provider);

        pairfactoryContract = new ethers.Contract(pairfactoryAddress,pairFactoryAbi.abi).connect(sellSigner); 
        pairrouterContract = new ethers.Contract(pairrouterAddress,pairrouterAbi.abi).connect(buySigner); 

        erc1155Contract1 = new ethers.Contract(erc1155ContractAddress,erc1155Abi.abi).connect(sellSigner);

    })

    it.skip("setOperatorProtocolFee", async () => {
        console.log("---------------")
        await pairfactoryContract.authorize(erc1155Contract1.address, operatorAddress);
        console.log("=============")
        const pairfactoryContract1 = new ethers.Contract(pairfactoryAddress, pairFactoryAbi.abi).connect(operatorSigner)
        await pairfactoryContract1.setOperatorProtocolFee(erc1155Contract1.address, operatorAddress, ethers.utils.parseEther("0.005"), {
            gasPrice: ethers.utils.parseUnits('50', 'gwei'),
        })
    })


    it("trader buy", async () => {
        // expect(await erc1155Contract1.balanceOf(sellAddress,1)).to.equal(100);
        // console.log("------:",await erc1155Contract1.balanceOf(sellSigner.address,1))
        // await erc1155Contract1.setApprovalForAll(pairfactoryContract.address, true)
        // console.log("======112212===")
        // const createtradelpool = await pairfactoryContract.connect(sellSigner).createPair1155ETH(
        //     erc1155Contract1.address,
        //     linearcurveAddress,
        //     sellSigner.address,
        //     1,
        //     0,  // delta
        //     0,
        //     ethers.utils.parseEther("0.001"),
        //     1,
        //     20
        // )
        // console.log("========================")
        // const txReceipt = await createtradelpool.wait();
        // const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]
        const poolAddress = "0xB8eDEcbD5F607213D2534B01A9E56aB1B072b90E";
        console.log("poolAddress:",poolAddress);
        // expect(await erc1155Contract1.balanceOf("0x917c13c077Aa72C117cF242D2eDc73c3733eb3C8",1)).to.equal(10);
        //////////////////// buy test robustswapethforspecificNFTs
        console.log("nft balance:",await erc1155Contract1.balanceOf(buySigner.address,1))
        console.log("pool nft balance:",await erc1155Contract1.balanceOf(poolAddress,1));
        const maxCost = hre.ethers.utils.parseEther("0.005")
        const swapList = [[[poolAddress, [1], [2]], maxCost]]
        const ddl = (await ethers.provider.getBlock("latest")).timestamp * 2;
        console.log("------------------");
        const robustBuy = await pairrouterContract.robustSwapETHForSpecificNFTs(swapList, buySigner.address, buySigner.address, ddl, { value: maxCost})
        await robustBuy.wait();
        console.log("nft balance:",await erc1155Contract1.balanceOf(buySigner.address,1))
        // console.log("----------------");
        // const robustBuy1 = await pairrouterContract.robustSwapETHForSpecificNFTs(swapList, buySigner.address, buySigner.address, ddl, { value: maxCost})
        // await robustBuy1.wait();
        // console.log("1232103821038-----19203921---21321")
        // expect(await erc1155Contract1.balanceOf(buyAddress,1)).to.equal(10);
    })

    it.skip("trader sell", async () => {
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