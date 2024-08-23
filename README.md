# op-ora

Onchain AI Oracle powered chat and image generator

## How To

1. Start by cloning this repository code.

2. cd to the root directory of the project and run yarn install to get smart-contracts back-end dependencies ready.

3. Configure the file .env.local inside the root directory properly.

4. cd to the folder oao-nextjs-dapp and run yarn install to get front-end dependencies set.

5. Then, configure the .env.local file inside the oao-nextjs-dapp directory properly.

6. Back to the root folder, you can run npx hardhat compile to compile the contracts.

7. Still inside the root folder, you can run npx hardhat ignition deploy ./ignition/modules/AIOracle.ts --network <your-network> to deploy the AIOracle to your network chain.

8. If you are interested in deploying your own Optimism L2 Rollup Testnet, head to https://docs.optimism.io/builders/chain-operators/tutorials/create-l2-rollup for steps to follow.

9. Next, cd to the folder oao-nextjs-dapp and run yarn dev to start your front-end.

10. Finally, you can interact with the onChain AI models.

## In Action

![GAC Logo](https://geniusandcourage.com/favicon.ico)

Onchain AI Oracle powered chat and image generator by [GAC DEV](https://geniusandcourage.com)

![Nft Market Place](https://hlwsdtech.com:8081/images/web3AIGen.jpg)

## Support

More about the web3 back-end framework documentation can be found at https://github.com/ora-io/OAO
