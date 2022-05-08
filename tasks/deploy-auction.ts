import "@nomiclabs/hardhat-ethers";
import fs from "fs";
import { ethers } from "hardhat";
import { task } from "hardhat/config";
import { ActionType } from "hardhat/types";
import path from "path";

export const deployAuction: ActionType<any> = async (args, env) => {
  try {
    const SmileyAuction = await env.ethers.getContractFactory("SmileyAuction");

    const nftContractData = fs.readFileSync(
      path.resolve(__dirname, `../addresses/nft-${env.network.name}.json`)
    );
    const nftContractDataString = nftContractData.toString();
    const nftContract: string = JSON.parse(nftContractDataString)[0];

    const votesContractData = fs.readFileSync(
      path.resolve(__dirname, `../addresses/votes-${env.network.name}.json`)
    );
    const votesContractDataString = votesContractData.toString();
    const votesContract: string = JSON.parse(votesContractDataString)[0];

    const timelockContractData = fs.readFileSync(
      path.resolve(__dirname, `../addresses/votes-${env.network.name}.json`)
    );
    const timelockContractDataString = timelockContractData.toString();
    const timelockContract: string = JSON.parse(timelockContractDataString)[0];

    // todo update values
    const extend = env.network.name === "rinkeby" ? 30 * 60 : 30;
    // check this todo
    const minPrice =
      env.network.name === "rinkeby" ? ethers.utils.parseEther("0.01") : 1;

    const bidInc = 5;
    const duration = env.network.name === "rinkeby" ? 4 * 60 * 60 : 600;

    const contract = await SmileyAuction.deploy(
      nftContract,
      votesContract,
      timelockContract,
      extend,
      minPrice,
      bidInc,
      duration
    );

    await contract.deployed();

    // todo set minter on another 2 contracts

    const nftFactory = await env.ethers.getContractFactory("SmileyNFT");
    const smileyNft = nftFactory.attach(nftContract);
    const txNft = await smileyNft.setMinter(contract.address);
    await txNft.wait();

    const votesFactory = await env.ethers.getContractFactory(
      "SmileyVotingTokens"
    );
    const smileyVotes = votesFactory.attach(votesContract);
    const txVotes = await smileyVotes.transferOwnership(contract.address);
    await txVotes.wait();

    console.log(
      `Smilye Auction Handler contract deployed to: ${contract.address}`
    );

    const txStart = await contract.startProject();
    await txStart.wait();

    fs.writeFileSync(
      path.resolve(__dirname, `../addresses/auction-${env.network.name}.json`),
      JSON.stringify([contract.address])
    );
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
};

task("deploy-auction", "Deploys Smiley auction contract").setAction(
  deployAuction
);
