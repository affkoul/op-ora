import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  ignition: {
    requiredConfirmations: 1,
  },
  networks: {
    optimismL2: {
      url: "http://localhost:8545",
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
      gas: 8000000,
      gasPrice: 10000000000,
    },
    ethereumSepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
      gas: 8000000,
      gasPrice: 10000000000,
    },
    ethereumMainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
      gas: 8000000,
      gasPrice: 10000000000,
    },
    optimismSepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.OPTIMISM_DEPLOYER_PRIVATE_KEY}`],
      gas: 8000000,
      gasPrice: 10000000000,
    },
    optimismMainnet: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.OPTIMISM_DEPLOYER_PRIVATE_KEY}`],
      gas: 8000000,
      gasPrice: 10000000000,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
