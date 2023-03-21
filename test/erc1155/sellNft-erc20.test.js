const hre = require('hardhat')
const { expect } = require('chai')
let MyErc1155TokenABI = require('../../artifacts/contracts/v2/MyErc1155Token.sol/MyErc1155Token.json')
let MyErc20TokenABI = require('../../artifacts/contracts/v2/MyErc20Token.sol/MyErc20Token.json')
const { ethers } = hre
const { BigNumber, Signer } = require('ethers')
const pairrouterAbi = require('../../artifacts/contracts/v2/LSSVMRouter.sol/LSSVMRouter.json')
const pairFactoryAbi = require('../../artifacts/contracts/v2/LSSVMPairFactory.sol/LSSVMPairFactory.json')

describe('sell nft eth', async () => {

    let owner
    let operator
    let alice
    let operatorTwo
    let myNftTokenContract
    let myErc20TokenContract
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

        const MyNftTokenContract = await hre.ethers.getContractFactory("MyErc1155Token");
        myNftTokenContract = await MyNftTokenContract.deploy();
        await myNftTokenContract.deployed();
        nftContractAddress = myNftTokenContract.address

        const MyErc20TokenContract = await hre.ethers.getContractFactory("MyErc20Token");
        myErc20TokenContract = await MyErc20TokenContract.deploy();
        await myErc20TokenContract.deployed();

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
        console.log("owner nft balance:", await myNftTokenContract.balanceOf(owner.address, 1));

        await myErc20TokenContract.mint(alice.address, 1000000000000000);

        await pairfactory.authorize(nftContractAddress, operator.address)

        const pairfactoryContract = new ethers.Contract(pairfactory.address, pairFactoryAbi.abi).connect(operator)
        await pairfactoryContract.setOperatorProtocolFee(nftContractAddress, '0x7271b723F864d77Db16C20dDf0eC8b78Df05aeb2', 2000000000)


        const pairfactoryContract1 = new ethers.Contract(pairfactory.address, pairFactoryAbi.abi).connect(alice)
        const myErc20TokenContract1 = new ethers.Contract(myErc20TokenContract.address, MyErc20TokenABI.abi).connect(alice)
        await myErc20TokenContract1.approve(pairfactory.address, 100000000000)

        await myNftTokenContract.connect(alice).setApprovalForAll(pairfactoryContract1.address, true);

        const createtradelpool = await pairfactoryContract1.createPair1155ERC20(
            [
                myErc20TokenContract.address,
                nftContractAddress,
                linearcurve.address,
                alice.address,
                0,
                100000,  // delta
                0,
                50000000000,
                1,
                0,
                100000000000
            ]
        )
        const txReceipt = await createtradelpool.wait();
        const poolAddress = (await txReceipt.events.filter(item => item.event == 'NewPair'))[0].args[0]
        await myNftTokenContract.setApprovalForAll(pairrouter.address, true);
        console.log("operator balance:",await myErc20TokenContract.balanceOf("0x7271b723F864d77Db16C20dDf0eC8b78Df05aeb2"));

        ////////////////// sell test robustSwapNFTsForToken
        const minOutput = hre.ethers.utils.parseEther("0")
        const swapList = [[[poolAddress, [1], [2]], minOutput]]
        const ddl = (await ethers.provider.getBlock("latest")).timestamp * 2;
        const robustSell = await pairrouter.robustSwapNFTsForToken(swapList, owner.address, ddl)
        console.log("balance :", await myErc20TokenContract.balanceOf('0x7271b723F864d77Db16C20dDf0eC8b78Df05aeb2'))
        console.log("operator balance:",await myErc20TokenContract.balanceOf("0x7271b723F864d77Db16C20dDf0eC8b78Df05aeb2"));

        expect(await myNftTokenContract.balanceOf(alice.address, 1)).to.equal(11);

    })
})
