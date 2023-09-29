/*How hardhat is more useful than ethers.js
in hardhat we dont need to setup rpc url and private key
because in hardhat , hardhat network is used same like ganache*/

//imports
// const {ethers} = require("ethers");
//alternate way of this(above)

//importing ethers from hardhat
//run allow us to run any hardhat  task
const { ethers, run, network } = require("hardhat");

//async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying Contract....");
  const simpleStorage = await SimpleStorageFactory.deploy();
  const receipt = await simpleStorage.deploymentTransaction().wait(1);

  console.log("Deployed contract to :", receipt.contractAddress);

  //when we deploy to our hardhat network
  //4 == 4 ->  true
  //4 == "4" -> true
  //4 === "4" -> false check strict equality
  console.log(network.config);
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block txes...");
    await simpleStorage.deploymentTransaction().wait(6);
    await verify(simpleStorage.address, []);
  }

  //interactin with contract
  const currentValue = await simpleStorage.retrieve();
  console.log(`Current Value is ${currentValue}`);

  //update the current value
  const transactionResponse = await simpleStorage.store(7);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated Value is ${updatedValue}`);
}

//for verify the contract for sepolia
//we dont have to go on etherscan to verify and publish
async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified");
    } else {
      console.log(e);
    }
  }
}

//main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
