// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    console.log("verify address:","0x5a1CA387586BC305ac3592b7d030d4A18aBD7d8a");

    await hre.run("verify:verify", {
      address: "0x5a1CA387586BC305ac3592b7d030d4A18aBD7d8a",
      constructorArguments: [
        "0xfE5707604b45da67ca0B8bBa26594bA7A81C27e9",
        "0xef973f014D791864e5D2b18a9D11883D7500Ef1f",
        "0x0D6743615e334A7fE5d67a019aa63aDe23f6494d",
        "0x89905A845947F214065fA7973A85CBbE6C0bE284",
        "0x3E500172309f98b0f5Ba6D55a482F9162003E007",
        "0x7414d7e802c1D5c0F3FCB4ffA182329799185603",
        "0x342E697899E050c24b176F7D1114181Bc03f2dCf",
        "10000000000000000"
    ]
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
