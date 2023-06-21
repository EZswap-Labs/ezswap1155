
const { ethers } = require("hardhat");
const env = require("hardhat");
const hre = require("hardhat"); 
const pairFactoryAbi = require("../../artifacts/contracts/v2/LSSVMPairFactory.sol/LSSVMPairFactory.json")

async function main() {
  console.log("----------------")
  const MyTokenContract = await hre.ethers.getContractFactory("MyErc1155Token");
  const myErc1155TokenContract = await MyTokenContract.deploy();
  console.log("===============");
  await myErc1155TokenContract.deployed();
  console.log("myErc1155TokenContract:",await myErc1155TokenContract.address);
  console.log("owner nft balance:",await myErc1155TokenContract.balanceOf("0x342E697899E050c24b176F7D1114181Bc03f2dCf",1));
  // erc1155 0xA0572E2c67f760B57fCf8f388B947392E2283d21

  // const provider = new ethers.providers.JsonRpcProvider(process.env.goerliUrl);
  // const signer = new ethers.Wallet(process.env.goerliAccount, provider);
  // const pairfactory = new ethers.Contract("0xbF237C71aE90405480dc07eb07ca45fc9c860923",pairFactoryAbi.abi).connect(signer);
  
  // //erc20 0x766A32b677D53DdBF343874d1fFBb0B97f8D5F02
  // const MyErc20TokenContract = await hre.ethers.getContractFactory("MyErc20Token");
  // const myErc20TokenContract = await MyErc20TokenContract.deploy();
  // await myErc20TokenContract.deployed();

  // console.log("myErc20TokenContract address:",myErc20TokenContract.address);
  // await myErc20TokenContract.mint("0x01884737E4C2C4ca7E7C0dF4A78B5DE9B517A625", 1000000000000000);

  // const LinearCurve = await hre.ethers.getContractFactory("LinearCurve");
  // const linearcurve = await LinearCurve.deploy();
  // await linearcurve.deployed();
  // //linearcurve 0x84C6829705466F4947DD431807A6ebC7B52a73b5
  // console.log(
  //   `linearcurve deployed to ${linearcurve.address}`
  // );  

  // await pairfactory.setBondingCurveAllowed(linearcurve.address, true)

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});