import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";

task("deploy", "Deploys all contracts").setAction(async (args, env) => {
  try {
    await env.run("deploy-attributes");

    await env.run("deploy-votes");

    await env.run("deploy-timelock");

    await env.run("deploy-nft");

    await env.run("deploy-dao");

    await env.run("deploy-auction");
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
});
