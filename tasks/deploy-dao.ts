import "@nomiclabs/hardhat-ethers";
import fs from "fs";
import { task } from "hardhat/config";
import { ActionType } from "hardhat/types";
import path from "path";

export const deployDao: ActionType<any> = async (args, env) => {
  try {
    const SmileyGovernor = await env.ethers.getContractFactory(
      "SmileyGovernor"
    );

    const votesContractData = fs.readFileSync(
      path.resolve(__dirname, `../addresses/votes-${env.network.name}.json`)
    );
    const votesContractDataString = votesContractData.toString();
    const votesContract: string = JSON.parse(votesContractDataString)[0];

    const timelockData = fs.readFileSync(
      path.resolve(__dirname, `../addresses/timelock-${env.network.name}.json`)
    );
    const timelockString = timelockData.toString();
    const timelockContract: string = JSON.parse(timelockString)[0];
    // todo update values

    const smileyGovernor = await SmileyGovernor.deploy(
      votesContract,
      timelockContract,
      // BLOCKS
      5,
      4,
      1
    );

    await smileyGovernor.deployed();

    console.log(
      `Smiley Governor contract deployed to: ${smileyGovernor.address}`
    );
    fs.writeFileSync(
      path.resolve(__dirname, `../addresses/dao-${env.network.name}.json`),
      JSON.stringify([smileyGovernor.address])
    );

    console.log("----------------------------------------------------");
    console.log("Setting up contracts for roles...");
    // would be great to use multicall here...

    const timelockactory = await env.ethers.getContractFactory("TimeLock");
    const timeLock = timelockactory.attach(timelockContract);

    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    const proposerTx = await timeLock.grantRole(
      proposerRole,
      smileyGovernor.address
    );
    await proposerTx.wait(1);

    const executorTx = await timeLock.grantRole(
      executorRole,
      "0x0000000000000000000000000000000000000000"
    );
    await executorTx.wait(1);
    const revokeTx = await timeLock.revokeRole(
      adminRole,
      (
        await env.ethers.getSigners()
      )[0].address
    );
    await revokeTx.wait(1);
    // Guess what? Now, anything the timelock wants to do has to go through the governance process!
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
};

task("deploy-dao", "Deploys DAO contract").setAction(deployDao);
