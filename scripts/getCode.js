const hre = require("hardhat");

const ERC721Json = require("@openzeppelin/contracts/build/contracts/IERC721.json");
const { ethers } = require("hardhat");
const bytecode = require("../bytecode");

async function main() {
  let missingEnumerableETHTemplate = '0xA4af511950Bfa1ca6e4f2E14c28924Fbde19a5F6'
  let missingEnumerableERC20Template = '0x49064E4bdDAF438a843108E57D929b27Ccc40C26'
  // let ethPairCode = await web3.eth.getCode(missingEnumerableETHTemplate)  
  // let erc20PairCode = await web3.eth.getCode(missingEnumerableERC20Template)  
  const ETH_PAIR = bytecode.ETH_PAIR
  const ERC20_PAIR = bytecode.ERC20_PAIR
  console.log(ETH_PAIR.slice(0, 10))  
  console.log(ERC20_PAIR.slice(0, 10))  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
