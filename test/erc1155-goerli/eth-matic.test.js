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
    let erc1155ContractAddress = "0x09e507739776D48C6ebFFF31d65FdCCA2Cb32e59"
    // let pairfactoryAddress = "0x2Ee1BbDaF1F2e330AeB39742755E4b83bf79100B"
    let pairfactoryAddress = "0x7452c6E193298A2Df001ea38b6369fbDc0A38123";
    let pairrouterAddress = "0x183Eb45a05EA5456A6D329bb76eA6C6DABb375a6"
    let linearcurveAddress = "0xAf7374286f5FB0476f18D760d83fd3508908Ca08"

    let erc1155Contract1
    let pairfactoryContract
    let pairrouterContract

    beforeEach(async () => {
        provider = new ethers.providers.JsonRpcProvider(process.env.maticUrl);
        buySigner = new ethers.Wallet(process.env.maticBuy, provider);
        sellSigner = new ethers.Wallet(process.env.maticSell, provider);
        operatorSigner = new ethers.Wallet(process.env.goerliOperator, provider);

        pairfactoryContract = new ethers.Contract(pairfactoryAddress,pairFactoryAbi.abi).connect(sellSigner); 
        pairrouterContract = new ethers.Contract(pairrouterAddress,pairrouterAbi.abi).connect(buySigner); 

        erc1155Contract1 = new ethers.Contract(erc1155ContractAddress,erc1155Abi.abi).connect(sellSigner);

    })

    it("setOperatorProtocolFee", async () => {
        // console.log("---------------")
        // await pairfactoryContract.authorize("0x5229cbe99c032db7030b84ed553684c8729b0622", operatorAddress, {
        //     gasPrice: ethers.utils.parseEther("0.0000001"),
        // });
        // console.log("=============")
        // const pairfactoryContract1 = new ethers.Contract(pairfactoryAddress, pairFactoryAbi.abi).connect(operatorSigner)
        // await pairfactoryContract1.setOperatorProtocolFee("0x5229cbe99c032db7030b84ed553684c8729b0622", operatorAddress, ethers.utils.parseEther("0.005"), {
        //     gasPrice: ethers.utils.parseEther("0.0000001"),
        // })
        // console.log("aaaa:",await pairfactoryContract.operatorProtocolFeeMultipliers("0x5229cbe99c032db7030b84ed553684c8729b0622", operatorSigner.address))
        console.log("factory owner:",await pairfactoryContract.owner());
        await pairfactoryContract.transferOwnership("0xF6F43CB5Ed768c69B82F30f03F174828EbFf2FEa",{
                gasPrice: ethers.utils.parseEther("0.000001"),
            });
        console.log("factory owner:",await pairfactoryContract.owner());
        // console.log("missingEnumerable1155ETH:",await pairfactoryContract.missingEnumerable1155ETHTemplate());
        // console.log("missingEnumerable1155ERC20:",await pairfactoryContract.missingEnumerable1155ERC20Template());
        // const a = await pairfactoryContract.changeProtocolFeeMultiplier(ethers.utils.parseEther("0.001"),{
        //     gasPrice: ethers.utils.parseEther("0.000001")
        // });
        // await a.wait();

    })


    it.skip("trader buy", async () => {
        const setfee = await pairfactoryContract.changeProtocolFeeMultiplier(
            ethers.utils.parseEther("0.001"),{
                gasPrice: ethers.utils.parseEther("0.000001")
            }
          );
        await setfee.wait()
        console.log("setfee:",setfee);
        expect(await erc1155Contract1.balanceOf(sellAddress,1)).to.equal(100);
        console.log("------:",await erc1155Contract1.balanceOf(sellSigner.address,1))
        await erc1155Contract1.setApprovalForAll(pairfactoryContract.address, true, {
            gasPrice: ethers.utils.parseEther("0.000001")
        })
        console.log("======112212===")
        const createtradelpool = await pairfactoryContract.connect(sellSigner).createPair1155ETH(
            erc1155Contract1.address,
            linearcurveAddress,
            sellSigner.address,
            1,
            0,  // delta
            0,
            ethers.utils.parseEther("0.001"),
            1,
            10,
            {
                gasPrice: ethers.utils.parseEther("0.000001")
            }
        )
        console.log("========================")
        const txReceipt = await createtradelpool.wait();
        const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]
        // const poolAddress = "0x7185013C3910D69f343716fA26db978F10c76071";
        console.log("poolAddress:",poolAddress);
        console.log("nft balance:",await erc1155Contract1.balanceOf(buySigner.address,1))
        return;
        // expect(await erc1155Contract1.balanceOf("0x917c13c077Aa72C117cF242D2eDc73c3733eb3C8",1)).to.equal(10);
        //////////////////// buy test robustswapethforspecificNFTs
        console.log("nft balance:",await erc1155Contract1.balanceOf(buySigner.address,1))
        console.log("pool nft balance:",await erc1155Contract1.balanceOf(poolAddress,1));
        const maxCost = hre.ethers.utils.parseEther("0.1")
        const swapList = [[[poolAddress, [1], [5]], maxCost]]
        const ddl = (await ethers.provider.getBlock("latest")).timestamp * 2;
        console.log("------------------");
        const robustBuy = await pairrouterContract.robustSwapETHForSpecificNFTs(swapList, buySigner.address, buySigner.address, ddl, { value: maxCost, gasPrice: ethers.utils.parseEther("0.000001")})
        await robustBuy.wait();
        console.log("nft balance:",await erc1155Contract1.balanceOf(buySigner.address,1))
        console.log("----------------");
        const robustBuy1 = await pairrouterContract.robustSwapETHForSpecificNFTs(swapList, buySigner.address, buySigner.address, ddl, { value: maxCost, gasPrice: ethers.utils.parseEther("0.000001") })
        await robustBuy1.wait();
        console.log("1232103821038-----19203921---21321")
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