import { ethers } from "ethers";
import AIOracleABI from "../../artifacts/contracts/AIOracle.sol/AIOracle.json";
import { toast } from "react-toastify";

// Define the contract interface using the ABI
export async function getAIOracleContract(): Promise<ethers.Contract> {
  try {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(
        window.ethereum as unknown as ethers.Eip1193Provider,
      );
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const networkId = network.chainId;
      let oracleContractAddress;
      if (networkId == BigInt(42069)) {
        oracleContractAddress = process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS;
      } else if (networkId == BigInt(11155111)) {
        oracleContractAddress =
          process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS_ETHEREUM_SEPOLIA;
      } else if (networkId == BigInt(1)) {
        oracleContractAddress =
          process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS_ETHEREUM_MAINNET;
      } else if (networkId == BigInt(11155420)) {
        oracleContractAddress =
          process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS_OPTIMISM_SEPOLIA;
      } else if (networkId == BigInt(10)) {
        oracleContractAddress =
          process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS_OPTIMISM_MAINNET;
      }
      const signer = provider.getSigner();
      const accounts = await (await signer).getAddress();
      if (!accounts) {
        throw new Error("No accounts found. Please connect your wallet.");
      }
      return new ethers.Contract(
        oracleContractAddress as string,
        AIOracleABI.abi,
        await signer,
      );
    } else {
      throw new Error(
        "Ethereum provider not found. Make sure MetaMask is installed.",
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An unexpected error occurred.");
    }
    throw error; // Re-throw the error so it can still be handled elsewhere if needed
  }
}
