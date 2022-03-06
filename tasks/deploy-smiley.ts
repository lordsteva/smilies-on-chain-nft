import "@nomiclabs/hardhat-ethers";
import fs from "fs";
import { task } from "hardhat/config";
import path from "path";

task("deploy-nft", "Deploys bull NFT contract").setAction(async (args, env) => {
  try {
    const attributeData = fs.readFileSync(
      path.resolve(
        __dirname,
        `../addresses/attribute-contracts-${env.network.name}.json`
      )
    );

    const attributeDataString = attributeData.toString();
    const contracts: string[] = JSON.parse(attributeDataString);

    const ContractDeployer = await env.ethers.getContractFactory("SmileyNFT");

    const contract = await ContractDeployer.deploy(contracts);
    await contract.deployed();
    console.log(`Smiley NFT contract deployed to: ${contract.address}`);
    fs.writeFileSync(
      path.resolve(__dirname, `../addresses/nft-${env.network.name}.json`),
      JSON.stringify([contract.address])
    );
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
});
