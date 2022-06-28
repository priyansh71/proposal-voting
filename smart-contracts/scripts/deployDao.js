const hre = require("hardhat");

async function main() {
  const MoralisDao = await hre.ethers.getContractFactory("MoralisDao");
  const MoralisDaoContract = await MoralisDao.deploy();

  await MoralisDaoContract.deployed();

  console.log("MoralisDao deployed to:", MoralisDaoContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
