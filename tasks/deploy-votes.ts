import "@nomiclabs/hardhat-ethers";
import fs from "fs";
import { task } from "hardhat/config";
import { ActionType } from "hardhat/types";
import path from "path";

export const deployVotes: ActionType<any> = async (args, env) => {
  try {
    const ContractDeployer = await env.ethers.getContractFactory(
      "SmileyVotingTokens"
    );

    const contract = await ContractDeployer.deploy();
    await contract.deployed();
    console.log(`Smiley votes token contract deployed to: ${contract.address}`);
    fs.writeFileSync(
      path.resolve(__dirname, `../addresses/votes-${env.network.name}.json`),
      JSON.stringify([contract.address])
    );
    return contract.address;
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
};

task("deploy-votes", "Deploys smiley votes token contract").setAction(
  deployVotes
);
