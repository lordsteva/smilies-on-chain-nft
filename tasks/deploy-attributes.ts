import "@nomiclabs/hardhat-ethers";
import fs from "fs";
import { task } from "hardhat/config";
import { ActionType, HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

const readJSON = (attribute: string) => {
  const rawdata = fs.readFileSync(`./images/${attribute}.json`);
  const data = JSON.parse(rawdata.toString());
  type Attribute = {
    value: string;
    svg: string;
    weight: number;
    points: number;
  };
  return [
    attribute,
    data.map((item: Attribute) => item.value),
    data.map((item: Attribute) => item.svg),
    data.map((item: Attribute) => item.weight),
    data.map((item: Attribute) => item.points),
  ];
};

async function deploy(args: any, { ethers }: HardhatRuntimeEnvironment) {
  const ContractDeployer = await ethers.getContractFactory("SmileyAttribute");

  const backgroundData = readJSON(args.attribute);
  // @ts-ignore
  const smileyAttribute = await ContractDeployer.deploy(...backgroundData);

  await smileyAttribute.deployed();

  console.log(
    `Contract ${args.attribute} deployed to: ${smileyAttribute.address}`
  );

  return smileyAttribute.address;
}

export const deployAttributes: ActionType<any> = async (args, env) => {
  try {
    const attributes = [
      "Background",
      "Face",
      "Eyes",
      "Mouth",
      "Hat",
      "Moustache",
    ];
    const contracts = [];
    for (const attribute of attributes) {
      const name = await deploy({ attribute }, env);
      contracts.push(name);
    }

    try {
      fs.writeFileSync(
        path.resolve(
          __dirname,
          `../addresses/attribute-contracts-${env.network.name}.json`
        ),
        JSON.stringify(contracts)
      );
    } catch (err) {
      console.error(err);
    }
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
};

task("deploy-attributes", "Deploys all attribute contracts").setAction(
  deployAttributes
);
