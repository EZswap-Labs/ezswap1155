
const hre = require("hardhat"); 

async function main() {
  const [owner] = await ethers.getSigners();

  const LinearCurve = await hre.ethers.getContractFactory("LinearCurve");
  const linearcurve = await LinearCurve.deploy();
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

  // =======================================================
  const _protocolFeeRecipient = owner.address;
  const _protocolFeeMultiplier = hre.ethers.utils.parseEther("0.01"); 

  const PairFactory = await hre.ethers.getContractFactory("LSSVMPairFactory");
  const pairfactory = await PairFactory.deploy(
    enumETHTem.address,
    missEnumETHTem.address,
    enumERC20Tem.address,
    missEnumERC20Tem.address,
    _protocolFeeRecipient,
    _protocolFeeMultiplier
  );

  await pairfactory.deployed()
  console.log(`pairfactory deployed to ${pairfactory.address} `)

  // =======================================================

  const PairRouter = await hre.ethers.getContractFactory("LSSVMRouter");
  const pairrouter = await PairRouter.deploy(pairfactory.address);

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




}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
