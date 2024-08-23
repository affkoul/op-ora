import { http, createConfig } from "@wagmi/core";
import {
  sepolia,
  mainnet,
  optimismSepolia,
  optimism,
} from "@wagmi/core/chains";

const OPTIMISM_L2_CHAIN_ID = "0xa455"; // chain ID (42069) in hex format, e.g., "0xAABBCC" (use "0x" prefix for hex)
const ETHEREUM_SEPOLIA_CHAIN_ID = "0xaa36a7"; // chain ID (11155111) in hex format, e.g., "0xAABBCC" (use "0x" prefix for hex)
const ETHEREUM_MAINNET_CHAIN_ID = "0x1"; // chain ID (1) in hex format, e.g., "0xAABBCC" (use "0x" prefix for hex)
const OPTIMISM_SEPOLIA_CHAIN_ID = "0xaa37dc"; // chain ID (11155420) in hex format, e.g., "0xAABBCC" (use "0x" prefix for hex)
const OPTIMISM_MAINNET_CHAIN_ID = "0xa"; // chain ID (10) in hex format, e.g., "0xAABBCC" (use "0x" prefix for hex)

const opAnat = {
  id: 42069,
  name: "Op-anat",
  network: "op-anat",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
    public: { http: ["http://localhost:8545"] },
  },
  blockExplorers: {
    default: { name: "Op-anat Explorer", url: "http://localhost:8545" },
  },
};

export const config = createConfig({
  chains: [opAnat, sepolia, mainnet, optimismSepolia, optimism],
  transports: {
    [opAnat.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [optimismSepolia.id]: http(),
    [optimism.id]: http(),
  },
});

export const NETWORK_CONFIGS = {
  OPTIMISM_L2_CHAIN: {
    chainId: OPTIMISM_L2_CHAIN_ID,
    chainName: "Op-anat",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["http://localhost:8545"],
    blockExplorerUrls: null,
  },

  ETHEREUM_SEPOLIA_CHAIN: {
    chainId: ETHEREUM_SEPOLIA_CHAIN_ID,
    chainName: "Sepolia test network",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },

  ETHEREUM_MAINNET_CHAIN: {
    chainId: ETHEREUM_MAINNET_CHAIN_ID,
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"],
  },

  OPTIMISM_SEPOLIA_CHAIN: {
    chainId: OPTIMISM_SEPOLIA_CHAIN_ID,
    chainName: "Optimism Sepolia",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.optimism.io"],
    blockExplorerUrls: ["https://sepolia-optimism.etherscan.io"],
  },

  OPTIMISM_MAINNET_CHAIN: {
    chainId: OPTIMISM_MAINNET_CHAIN_ID,
    chainName: "Optimism Mainnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
};

export const models = [
  { id: 11, name: "LLaMA", feature: "Chat" },
  { id: 50, name: "Stable Diffusion", feature: "Image" },
];
