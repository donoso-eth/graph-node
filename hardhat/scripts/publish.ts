// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { load, dump } from 'js-yaml';

import { writeFileSync, readFileSync } from 'fs';
import { ensureDir } from 'fs-extra';
import { ethers, hardhatArguments } from 'hardhat';
import config from '../hardhat.config';
import { join } from 'path';

interface ICONTRACT_DEPLOY {
  artifactsPath: string;
  name: string;
  ctor?: any;
  jsonName: string;
}

const processDir = process.cwd();
const subgraphPath = join(processDir, '../add-ons/subgraph/');
const abiPath = join(subgraphPath, 'abis');
ensureDir(abiPath);
const srcPath = join(subgraphPath, 'src');
const contract_path_relative = '../src/assets/contracts/';
const contract_path = join(processDir, contract_path_relative);
ensureDir(contract_path);

async function main() {
  let network = hardhatArguments.network;
  if (network == undefined) {
    network = config.defaultNetwork;
  }

  const contract_config = JSON.parse(
    readFileSync(join(processDir, 'contract.config.json'), 'utf-8')
  ) as { [key: string]: ICONTRACT_DEPLOY };

  const deployContracts = ['theGraph'];

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  for (const toDeployName of deployContracts) {
    const toDeployContract = contract_config[toDeployName];
    if (toDeployContract == undefined) {
      console.error('Your contract is not yet configured');
      console.error(
        'Please add the configuration to /hardhat/contract.config.json'
      );
      return;
    }

    const metadata = JSON.parse(
      readFileSync(
        `${contract_path}/${toDeployContract.jsonName}_metadata.json`,
        'utf-8'
      )
    );

    const doc = load(
      readFileSync(join(subgraphPath, 'subgraph.yaml'), 'utf8')
    ) as any;

    const dataSources = doc['dataSources'];

    dataSources.name = toDeployContract.name;

    const contract_key = dataSources.filter((fil: any) => fil.kind == 'ethereum/contract')[0];

    contract_key.name = toDeployContract.name;

    const contractSource = contract_key.source;
    contractSource.address = metadata.address;
    contractSource.abi = toDeployContract.name;

    const contractMapping = contract_key.mapping;

    if (contractMapping.kind == 'ethereum/events') {
      /////// prepare events
      const events = metadata.abi.filter((fil: any) => fil.type == 'event');



      const yamlEvents = []; //contractMapping.eventHandlers

      for (const contractEvent of events) {
        const inputsStringRaw = contractEvent.inputs
          .map((input: any) => input.type)
          .reduce(
            (prev: any, current: any) => (current = prev + current + ','),
            ''
          ) as string;

        yamlEvents.push({
          event: inputsStringRaw.substring(0, inputsStringRaw.length - 1),
          handler: `handle${contractEvent.name}`,
        });
      }

      contractMapping.eventHandlers = yamlEvents;
  
      const abis_events = contractMapping.abis  == undefined ? [] : contractMapping.abis ;
      const newAbiEntry = {
        name: toDeployContract.name,
        path: `./abis/${toDeployContract.jsonName}.json`,
      };
      abis_events.push(newAbiEntry);
      contractMapping.abis = abis_events;
    }

   

    writeFileSync(
      join(abiPath, `${toDeployContract.jsonName}.json`),
      JSON.stringify(metadata.abi)
    );

    const result = dump(doc);
    writeFileSync(join(srcPath, 'subgraph.yaml'), result);
    // We recommend this pattern to be able to use async/await everywhere
    // and properly handle errors.
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
