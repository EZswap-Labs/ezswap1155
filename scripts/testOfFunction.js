const hre = require("hardhat");

const ERC721Json = require("@openzeppelin/contracts/build/contracts/IERC721.json");
const { ethers } = require("hardhat");
const ERC721Address = "0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b";

async function main() {
  const [owner] = await ethers.getSigners();

  // pair factory
  const PairFactory = await hre.ethers.getContractFactory("LSSVMPairFactory");
  const pairfactory = await PairFactory.attach(
    "0xAd0f90a3Ab34430aD5C0E649538D686cE2Dae998"
  );

  const PairRouter = await hre.ethers.getContractFactory("LSSVMRouter");
  const pairrouter = await PairRouter.attach('0x826868A09FECAb872E8E95bc02ff040223C950FE')

  // const balance = await ethers.provider.getBalance("0x989725E4d56cE77894aB2a6c2746F8B1266b7C41")
  // console.log(balance)


  // can change address
  // const EthPair = await hre.ethers.getContractFactory("LSSVMPairEnumerableETH");
  // const ethpair = await EthPair.attach('0x022e57e64Fb67e7d8B1AD15A624ae846E5E4Cdde')

  // cheak spot price
  // const sp = await ethpair.spotPrice()
  // console.log(sp)


  // set approve to router
  // const NFTContract = new ethers.Contract(ERC721Address, ERC721Json.abi, owner);
  //   await NFTContract.setApprovalForAll(pairrouter.address, true)
  //   const approveSuccess = await NFTContract.isApprovedForAll(owner.address, pairrouter.address)
  //   console.log(approveSuccess)

   //////////////////// sell test robustSwapNFTsForToken
  // const minOutput = hre.ethers.utils.parseEther("0")
  // const swapList = [[[ '0x8b59F42E46B8d5E481E28A6c50C75aBdCC965DcC', [1473588,]], minOutput]]
  // const ddl = (await ethers.provider.getBlock("latest")).timestamp * 2;
  // const robustSell = await pairrouter.robustSwapNFTsForToken(swapList , owner.address, ddl, {gasPrice: ethers.BigNumber.from(80215311211)})
  // console.log(robustSell)


  //////////////////////// buy test robustswapethforspecificNFTs
  // const maxCost = hre.ethers.utils.parseEther("0.5")
  // const swapList = [  [[ '0x022e57e64Fb67e7d8B1AD15A624ae846E5E4Cdde', [1650051]], maxCost]  ]
  // const ddl = (await ethers.provider.getBlock("latest")).timestamp * 2;
  // const robustBuy = await pairrouter.robustSwapETHForSpecificNFTs(swapList , owner.address, owner.address, ddl, {value: maxCost})
  // console.log(robustBuy)


  ///////////////////////// withdrawETH test
  // const PairTest = await hre.ethers.getContractFactory("LSSVMPairMissingEnumerableETH");
  // const pairtest = await PairTest.attach('0xf6c76A96BA051A6336d5Dc9b3af57919A4dF94bf')

  // const tx = await pairtest.withdrawETH(hre.ethers.utils.parseEther("0.00002"))
  // console.log(tx)

  ///////////////////////// desposit NFT
  // const nftAddress = '0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b'
  // const pairAddress = '0xf6c76A96BA051A6336d5Dc9b3af57919A4dF94bf'
  // const ids = [1029612]
  // const tx = await pairfactory.depositNFTs(nftAddress, ids, pairAddress)
  // console.log(tx)

 
  /////////////////////// withdraw NFT withdrawERC721

  // const nftAddress = '0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b'
  // const pairAddress = '0xf6c76A96BA051A6336d5Dc9b3af57919A4dF94bf'
  // const ids = [1473589,	1473586,1473588]

  // const PairTest = await hre.ethers.getContractFactory("LSSVMPairMissingEnumerableETH");
  // const pairtest = await PairTest.attach(pairAddress)
  
  // const tx = await pairtest.withdrawERC721(nftAddress,ids)
  // console.log(tx)

  //   const NFTContract = new ethers.Contract(ERC721Address, ERC721Json.abi, owner);
  //   console.log(await NFTContract.balanceOf(owner.address));

  // set approve to factory
  //   await NFTContract.setApprovalForAll(pairfactory.address, true)
  //   const approveSuccess = await NFTContract.isApprovedForAll(owner.address, pairfactory.address)
  //   console.log(approveSuccess)

    // buy pool
    // const createbuypool = await pairfactory.createPairETH(
    //   '0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b',
    //   '0x71F5033d266d3983B08340C9266971b8e643cbaC',
    //   owner.address,
    //   0,
    //   ethers.utils.parseEther("0.001"), // delta
    //   0,
    //   ethers.utils.parseEther("0.01"),  // spotprice
    //   [], { value: ethers.utils.parseEther("0.027")}
    // )
    // console.log(createbuypool)

  // sell pool
    // const createsellpool = await pairfactory.createPairETH(
    //   '0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b',
    //   '0x71F5033d266d3983B08340C9266971b8e643cbaC',
    //   owner.address,
    //   1,
    //   ethers.utils.parseEther("0.001"),  // delta
    //   0,
    //   ethers.BigNumber.from(8950248756218908),
    //   [	1650055, 1029612, 1650051]
    // )

  // trade pool
    // const createtradelpool = await pairfactory.createPairETH(
    //   '0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b',
    //   '0x71F5033d266d3983B08340C9266971b8e643cbaC',
    //   '0x0000000000000000000000000000000000000000',
    //   2,
    //   ethers.utils.parseEther("0.001"), // delta
    //   ethers.utils.parseEther("0.14"),  // fee
    //   ethers.BigNumber.from(7733624454148471), //  spotprice
    //   [], { value: ethers.utils.parseEther("0.1"), gasPrice: ethers.BigNumber.from(80215311211)}
    // )

    // const createtradelpool = await pairfactory.createPairETH(
    //   '0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b',
    //   '0x71F5033d266d3983B08340C9266971b8e643cbaC',
    //   '0x0000000000000000000000000000000000000000',
    //   2,
    //   ethers.utils.parseEther("0.01"), // delta
    //   ethers.utils.parseEther("0.24"),  // fee
    //   ethers.BigNumber.from('54257028112449799'), //  spotprice
    //   [1473590,1650051,1650055], { value: ethers.utils.parseEther("0.100401493975903614")}
    // )
    // console.log(createtradelpool)

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
