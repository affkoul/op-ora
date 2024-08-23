import { ethers } from "ethers";
import PromptABI from "../../artifacts/contracts/Prompt.sol/Prompt.json";
import { toast } from "react-toastify";

// Define the contract interface using the ABI
export async function getPromptContract(): Promise<ethers.Contract> {
  try {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(
        window.ethereum as unknown as ethers.Eip1193Provider,
      );
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const networkId = network.chainId;
      let promptContractAddress;
      if (networkId == BigInt(42069)) {
        promptContractAddress = process.env.NEXT_PUBLIC_AI_PROMPT_ADDRESS;
      } else if (networkId == BigInt(11155111)) {
        promptContractAddress =
          process.env.NEXT_PUBLIC_AI_PROMPT_ADDRESS_ETHEREUM_SEPOLIA;
      } else if (networkId == BigInt(1)) {
        promptContractAddress =
          process.env.NEXT_PUBLIC_AI_PROMPT_ADDRESS_ETHEREUM_MAINNET;
      } else if (networkId == BigInt(11155420)) {
        promptContractAddress =
          process.env.NEXT_PUBLIC_AI_PROMPT_ADDRESS_OPTIMISM_SEPOLIA;
      } else if (networkId == BigInt(10)) {
        promptContractAddress =
          process.env.NEXT_PUBLIC_AI_PROMPT_ADDRESS_OPTIMISM_MAINNET;
      }
      const signer = provider.getSigner();
      const accounts = await (await signer).getAddress();
      if (!accounts) {
        throw new Error("No accounts found. Please connect your wallet.");
      }
      return new ethers.Contract(
        promptContractAddress as string,
        PromptABI.abi,
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
