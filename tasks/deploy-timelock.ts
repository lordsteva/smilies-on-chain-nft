import "@nomiclabs/hardhat-ethers";
import fs from "fs";
import { task } from "hardhat/config";
import { ActionType } from "hardhat/types";
import path from "path";

export const deployTimelock: ActionType<any> = async (args, env) => {
  try {
    const ContractDeployer = await env.ethers.getContractFactory("TimeLock");

    const contract = await ContractDeployer.deploy(
      env.network.name === "rinkeby" ? 4 * 60 * 60 : 0,
      [],
      []
    );
    await contract.deployed();
    console.log(`Smiley Timelock contract deployed to: ${contract.address}`);
    fs.writeFileSync(
      path.resolve(__dirname, `../addresses/timelock-${env.network.name}.json`),
      JSON.stringify([contract.address])
    );
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
};

task("deploy-timelock", "Deploys Timelock Controller contract").setAction(
  deployTimelock
);
