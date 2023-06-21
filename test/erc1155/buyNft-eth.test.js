const hre = require('hardhat')
const { expect } = require('chai')
let MyErc1155TokenABI = require('../../artifacts/contracts/v2/MyErc1155Token.sol/MyErc1155Token.json')
const { ethers } = hre
const { BigNumber, Signer } = require('ethers')
const pairrouterAbi = require('../../artifacts/contracts/v2/LSSVMRouter.sol/LSSVMRouter.json')
const pairFactoryAbi = require('../../artifacts/contracts/v2/LSSVMPairFactory.sol/LSSVMPairFactory.json')
const pair1155Abi = require('../../artifacts/contracts/v2/LSSVMPair1155.sol/LSSVMPair1155.json')
const erc1155Abi = require('../../artifacts/contracts/v2/MyErc1155Token.sol/MyErc1155Token.json')

describe('buy nft eth', async () => {

    let owner
    let operator
    let alice
    let operatorTwo
    let myErc1155TokenContract
    let nftContractAddress
    let pairfactory
    let pairrouter
    let linearcurve

    beforeEach(async () => {
        const [signer1, signer2, signer3, signer4] = await ethers.getSigners();
        owner = signer1
        operator = signer2
        alice = signer3
        operatorTwo = signer4

        const MyTokenContract = await hre.ethers.getContractFactory("MyErc1155Token");
        myErc1155TokenContract = await MyTokenContract.deploy();
        await myErc1155TokenContract.deployed();
        nftContractAddress = myErc1155TokenContract.address

        //deploy LSSVM contract
        const LinearCurve = await hre.ethers.getContractFactory("LinearCurve");
        linearcurve = await LinearCurve.deploy();
        await linearcurve.deployed();

        const ExponentialCurve = await hre.ethers.getContractFactory(
            "ExponentialCurve"
        );
        const exponentialcurve = await ExponentialCurve.deploy();
        await exponentialcurve.deployed();

        console.log(
            `linearcurve deployed to ${linearcurve.address} , exponentialcurve deployed to ${exponentialcurve.address}`
        );

        // ======================================

        const EnumETHTem = await hre.ethers.getContractFactory(
            "LSSVMPairEnumerableETH"
        );
        const enumETHTem = await EnumETHTem.deploy();
        await enumETHTem.deployed();

        const MissEnumETHTem = await hre.ethers.getContractFactory(
            "LSSVMPairMissingEnumerableETH"
        );
        const missEnumETHTem = await MissEnumETHTem.deploy();
        await missEnumETHTem.deployed();

        const EnumERC20Tem = await hre.ethers.getContractFactory(
            "LSSVMPairEnumerableERC20"
        );
        const enumERC20Tem = await EnumERC20Tem.deploy();
        await enumERC20Tem.deployed();

        const MissEnumERC20Tem = await hre.ethers.getContractFactory(
            "LSSVMPairMissingEnumerableERC20"
        );
        const missEnumERC20Tem = await MissEnumERC20Tem.deploy();
        await missEnumERC20Tem.deployed();

        console.log(`enumETHTem is ${enumETHTem.address} /// missEnumETHTem is ${missEnumETHTem.address}  `)
        console.log(`enumERC20Tem is ${enumERC20Tem.address} /// missEnumERC20Tem is ${missEnumERC20Tem.address}  `)

        const MissEnum1155ETHTem = await hre.ethers.getContractFactory(
            "LSSVMPair1155MissingEnumerableETH"
        );
        const missEnum1155ETHTem = await MissEnum1155ETHTem.deploy();
        await missEnum1155ETHTem.deployed();

        const MissEnum1155ERC20Tem = await hre.ethers.getContractFactory(
            "LSSVMPair1155MissingEnumerableERC20"
        );
        const missEnum1155ERC20Tem = await MissEnum1155ERC20Tem.deploy();
        await missEnum1155ERC20Tem.deployed();

        // =======================================================
        const _protocolFeeRecipient = owner.address;
        const _protocolFeeMultiplier = hre.ethers.utils.parseEther("0.01");

        const PairFactory = await hre.ethers.getContractFactory("LSSVMPairFactory");
        pairfactory = await PairFactory.deploy(
            enumETHTem.address,
            missEnumETHTem.address,
            enumERC20Tem.address,
            missEnumERC20Tem.address,
            missEnum1155ETHTem.address,
            missEnum1155ERC20Tem.address,
            _protocolFeeRecipient,
            _protocolFeeMultiplier
        );

        await pairfactory.deployed()
        console.log(`pairfactory deployed to ${pairfactory.address} `)

        // =======================================================

        const PairRouter = await hre.ethers.getContractFactory("LSSVMRouter");
        pairrouter = await PairRouter.deploy(pairfactory.address);

        await pairrouter.deployed()
        console.log(`pairrouter deployed to ${pairrouter.address} `)


        // ========================================== init
        const setcurve1 = await pairfactory.setBondingCurveAllowed(linearcurve.address, true)
        const setcurve2 = await pairfactory.setBondingCurveAllowed(exponentialcurve.address, true)
        console.log(`set curve to factory whitelist `)


        const setrouterwl = await pairfactory.setRouterAllowed(
            pairrouter.address,
            true
        );
        console.log(`set router to factory whitelist `)


        const setfee = await pairfactory.changeProtocolFeeMultiplier(hre.ethers.utils.parseEther("0.005"));
        console.log(`set protocol fee to 0.005 `)
    })

    it("test ", async () => {
        // console.log("owner nft balance:",await myErc1155TokenContract.balanceOf(owner.address,1));

        await pairfactory.authorize(nftContractAddress, operator.address)
        
        const pairfactoryContract = new ethers.Contract(pairfactory.address, pairFactoryAbi.abi).connect(operator)
        await pairfactoryContract.setOperatorProtocolFee(nftContractAddress, '0x7271b723F864d77Db16C20dDf0eC8b78Df05aeb2', 100000000)

        await myErc1155TokenContract.setApprovalForAll(pairfactory.address, true)

        const createtradelpool = await pairfactory.createPair1155ETH(
            [nftContractAddress,
            linearcurve.address,
            owner.address,
            1,
            0,  // delta
            0,
            ethers.utils.parseEther("0.001"),
            1,
            10]
        )
        
        const txReceipt = await createtradelpool.wait();
        const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]
        console.log("token balance:",await myErc1155TokenContract.balanceOf(poolAddress,1));

        // console.log("pooladdress",poolAddress);

        const pairrouterContract = new ethers.Contract(pairrouter.address, pairrouterAbi.abi).connect(alice);

        ////////////////////// buy test robustswapethforspecificNFTs
        let maxCost = hre.ethers.utils.parseEther("0.1")
        let swapList = [[[poolAddress, [1], [2]], maxCost]]
        const ddl = (await ethers.provider.getBlock("latest")).timestamp * 2;
        const robustBuy = await pairrouterContract.robustSwapETHForSpecificNFTs(swapList, alice.address, alice.address, ddl, { value: maxCost })
        await robustBuy.wait();
        const robustBuy1 = await pairrouterContract.robustSwapETHForSpecificNFTs(swapList, alice.address, alice.address, ddl, { value: maxCost })
        await robustBuy1.wait();
        console.log("--------------------");
        console.log("block number:",await ethers.provider.getBlockNumber());
        console.log("buy nft balance:",await myErc1155TokenContract.balanceOf(alice.address,1));
        // expect(await myErc1155TokenContract.balanceOf(alice.address,1)).to.equal(80);
    })

    it.skip("test", async () => {
        const walletAddress = "0xE3a463d743F762D538031BAD3f1E748BB41f96ec";
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [walletAddress],
        });
        const signer = await ethers.provider.getSigner(walletAddress);
        const erc1155Contract = new ethers.Contract("0xf4910c763ed4e47a585e2d34baa9a4b611ae448c", erc1155Abi.abi).connect(signer);
        // console.log("1155 balance:", await erc1155Contract.balanceOf(walletAddress, "0x01940c5006a58ae2233c6a83b1e8f8b34c90bf2200000000000001000000012c"))
        await erc1155Contract.setApprovalForAll(pairfactory.address, true);
        const createtradelpool = await pairfactory.connect(signer).createPair1155ETH(
            "0xf4910c763ed4e47a585e2d34baa9a4b611ae448c",
            "0xD38E321D0B450DF866B836612FBB5EECE3e4804e",
            "0xE3a463d743F762D538031BAD3f1E748BB41f96ec",
            0,
            0,  // delta
            0,
            BigNumber.from("1000000000000000"),
            "0x01940c5006a58ae2233c6a83b1e8f8b34c90bf2200000000000001000000012c",
            3,
            { value: BigNumber.from("3000000000000000")}
        )
        const txReceipt = await createtradelpool.wait();
        const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]

        console.log("poolAddress:",poolAddress);
    })

})