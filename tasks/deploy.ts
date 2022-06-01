import "@nomiclabs/hardhat-ethers";
import fs from "fs";
import { task } from "hardhat/config";
import path from "path";

task("deploy", "Deploys all contracts").setAction(async (args, env) => {
  try {
    await env.run("compile");

    await env.run("deploy-attributes");

    const votes = await env.run("deploy-votes");

    await env.run("deploy-timelock");

    const nft = await env.run("deploy-nft");

    const governor = await env.run("deploy-dao");

    const auction = await env.run("deploy-auction");

    const envString = `NEXT_PUBLIC_AUCTION_ADDRESS=${auction}
NEXT_PUBLIC_GOVERNOR_ADDRESS=${governor}
NEXT_PUBLIC_VOTES_ADDRESS=${votes}
NEXT_PUBLIC_NFT_ADDRESS=${nft}
NEXT_PUBLIC_NETWORK=${env.network.name}
NEXT_PUBLIC_NODE_URL=${
      env.network.name === "rinkeby"
        ? "https://rinkeby.infura.io/v3/a29f0338b6ac4815809d580624620c84"
        : "http://localhost:8545"
    }
`;

    fs.writeFileSync(
      path.resolve(__dirname, "../frontend/smiley-on-chain/.env"),
      envString
    );
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
});
