"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getAIOracleContract } from "../../lib/aiOracle";
// import { getPromptContract } from "../../lib/prompt";
// import { getSimplePromptContract } from "../../lib/simplePrompt";
import {
  Contract,
  formatUnits,
  parseUnits,
  toUtf8Bytes,
  toUtf8String,
  BrowserProvider,
  Eip1193Provider,
} from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { getGasPrice, estimateGas, getAccount, connect } from "@wagmi/core";
import { injected } from "@wagmi/connectors";
import { parseEther } from "viem";
import { config, NETWORK_CONFIGS, models } from "../../config";
import { HexDataStructure } from "../../types";
import { fetchImageFromIPFS } from "../../lib/fetchImageFromIPFS";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [networkCorrect, setNetworkCorrect] = useState<boolean>(false);
  const [networkType, setNetworkType] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<number>(11);
  const [connectedAccount, setConnectedAccount] = useState<HexDataStructure>();
  const { isConnected } = getAccount(config);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined" && window.ethereum?.request) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setWalletConnected(true);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined" && window.ethereum?.request) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletConnected(true);
        toast.success("Wallet connected successfully!");
      } catch (error) {
        console.error("Error connecting wallet:", error);
        if (error instanceof Error) {
          setError(`Error connecting wallet: ${error.message}`);
          toast.error(`Error connecting wallet: ${error.message}`);
        }
      }
    } else {
      setError(
        "MetaMask is not installed. Please install it to connect your wallet.",
      );
      toast.error(
        "MetaMask is not installed. Please install it to connect your wallet.",
      );
    }
  };

  const switchNetwork = async () => {
    if (typeof window.ethereum !== "undefined" && window.ethereum?.request) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            NETWORK_CONFIGS.OPTIMISM_L2_CHAIN ||
              NETWORK_CONFIGS.ETHEREUM_SEPOLIA_CHAIN ||
              NETWORK_CONFIGS.ETHEREUM_MAINNET_CHAIN ||
              NETWORK_CONFIGS.OPTIMISM_SEPOLIA_CHAIN ||
              NETWORK_CONFIGS.OPTIMISM_MAINNET_CHAIN,
          ],
        });
        toast.success("Network switched successfully!");
        setNetworkCorrect(true);
      } catch (switchError) {
        console.error("Failed to switch network:", switchError);
        if (switchError instanceof Error) {
          toast.error(`Failed to switch network: ${switchError.message}`);
        }
      }
    }
  };

  async function fetchWithTimeout(url: string, timeout = 30000): Promise<any> {
    return Promise.race([
      axios.get(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout),
      ),
    ]);
  }

  async function estimateTransactionCost(to: string) {
    try {
      const gasPriceInWei = await getGasPrice(config);
      const gasEstimate = await estimateGas(config, {
        to: `0x${to}`,
        value: gasPriceInWei,
      });
      const transactionCostInWei = gasEstimate * gasPriceInWei;
      const transactionCostInEther = formatUnits(transactionCostInWei, "ether");

      return transactionCostInEther;
    } catch (error) {
      toast.error(
        `Estimate Error: Could not estimate transaction cost. Try again later.`,
      );
      console.error("Error estimating gas:", error);
      throw error;
    }
  }

  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Prompt cannot be empty. Please enter a valid prompt.");
      return;
    }

    const contract = await getAIOracleContract();
    const llamaModelId = 11;
    const stableDiffusionModelId = 50;
    const gasLimit = 500000;

    try {
      setLoading(true);
      const provider = new BrowserProvider(
        window.ethereum as unknown as Eip1193Provider,
      );
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const accounts = await provider.send("eth_accounts", []);
      if (accounts.length === 0) {
        toast.error(
          `Error: Wallet is not connected. Please connect your wallet.`,
        );
        throw new Error("Wallet is not connected. Please connect your wallet.");
      }
      const network = await provider.getNetwork();
      const networkId = network.chainId;
      let fee;
      if (networkId == BigInt(42069)) {
        fee = parseEther("0.01");
      } else if (networkId == BigInt(11155111)) {
        fee = parseEther("0.02");
      } else if (networkId == BigInt(1)) {
        fee = parseEther("0.01");
      } else if (networkId == BigInt(11155420)) {
        fee = parseEther("0.01");
      } else if (networkId == BigInt(10)) {
        fee = parseEther("0.01");
      }
      const connectedWalletAddress = await signer.getAddress();
      // const oracleContractAddress = await contract.getAddress();
      // const strippedOracleContractAddress = oracleContractAddress.slice(2);
      // const txCostEstimate = await estimateTransactionCost(
      //   strippedOracleContractAddress,
      // );
      // const txCostEstimateInWei = parseUnits(txCostEstimate, "ether");
      // const oneThousandsTimesTxCostEstimateInWei =
      //   txCostEstimateInWei * BigInt(1000);
      // console.log(oneThousandsTimesTxCostEstimateInWei);
      let tx;
      if (selectedModel === 11) {
        tx = await contract.requestCallback(
          llamaModelId,
          toUtf8Bytes(prompt),
          connectedWalletAddress,
          gasLimit,
          "0x",
          // { value: txCostEstimateInWei },
          { value: fee },
        );
      } else {
        tx = await contract.requestCallback(
          stableDiffusionModelId,
          toUtf8Bytes(prompt),
          connectedWalletAddress,
          gasLimit,
          "0x",
          // { value: txCostEstimateInWei },
          { value: fee },
        );
      }
      await tx.wait();

      toast.success("Request submitted! Waiting for the result...");
      setResult("Request submitted! Waiting for the result...");
    } catch (error) {
      setLoading(false);
      console.error("Error submitting prompt:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
        selectedModel === 11
          ? setResult(`Error: ${error.message}`)
          : setResult(null);
      }
    }
    // finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    const wagmiConnectWallet = async () => {
      const connectWalletActionResult = await connect(config, {
        connector: injected(),
      });
      setConnectedAccount(connectWalletActionResult.accounts);
    };
    if (!isConnected) wagmiConnectWallet();
    return () => {};
  }, [isConnected]);

  useEffect(() => {
    const handleChainChanged = (chainId: string) => {
      if (chainId === NETWORK_CONFIGS.OPTIMISM_L2_CHAIN.chainId) {
        setNetworkType("0");
        setNetworkCorrect(true);
        checkWalletConnection();
        toast.success("Switched to the Op-anat network!");
      } else if (chainId === NETWORK_CONFIGS.ETHEREUM_SEPOLIA_CHAIN.chainId) {
        setNetworkType("1");
        setNetworkCorrect(true);
        checkWalletConnection();
        toast.success("Switched to the Ethereum Sepolia network!");
      } else if (chainId === NETWORK_CONFIGS.ETHEREUM_MAINNET_CHAIN.chainId) {
        setNetworkType("2");
        setNetworkCorrect(true);
        checkWalletConnection();
        toast.success("Switched to the Ethereum Mainnet network!");
      } else if (chainId === NETWORK_CONFIGS.OPTIMISM_SEPOLIA_CHAIN.chainId) {
        setNetworkType("3");
        setNetworkCorrect(true);
        checkWalletConnection();
        toast.success("Switched to the Optimism Sepolia network!");
      } else if (chainId === NETWORK_CONFIGS.OPTIMISM_MAINNET_CHAIN.chainId) {
        setNetworkType("4");
        setNetworkCorrect(true);
        checkWalletConnection();
        toast.success("Switched to the Optimism Mainnet network!");
      } else {
        console.log("CURRENTLY NOT RECOGNIZED CHAIN ID");
        console.log(chainId);
        setNetworkCorrect(false);
        toast.error(
          "You are connected to the wrong network. Please switch to the Op-anat Optimistic L2 Roll Up Testnet.",
        );
      }
    };

    if (typeof window.ethereum !== "undefined" && window.ethereum?.on) {
      // Listen for the network change event
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (
        typeof window.ethereum !== "undefined" &&
        window.ethereum?.removeListener
      ) {
        // Cleanup event listener when the component unmounts
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  useEffect(() => {
    const checkWalletConnectionAndNetwork = async () => {
      if (typeof window.ethereum !== "undefined" && window.ethereum?.request) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (chainId === NETWORK_CONFIGS.OPTIMISM_L2_CHAIN.chainId) {
          setNetworkType("0");
          setNetworkCorrect(true);
          checkWalletConnection();
        } else if (chainId === NETWORK_CONFIGS.ETHEREUM_SEPOLIA_CHAIN.chainId) {
          setNetworkType("1");
          setNetworkCorrect(true);
          checkWalletConnection();
        } else if (chainId === NETWORK_CONFIGS.ETHEREUM_MAINNET_CHAIN.chainId) {
          setNetworkType("2");
          setNetworkCorrect(true);
          checkWalletConnection();
        } else if (chainId === NETWORK_CONFIGS.OPTIMISM_SEPOLIA_CHAIN.chainId) {
          setNetworkType("3");
          setNetworkCorrect(true);
          checkWalletConnection();
        } else if (chainId === NETWORK_CONFIGS.OPTIMISM_MAINNET_CHAIN.chainId) {
          setNetworkType("4");
          setNetworkCorrect(true);
          checkWalletConnection();
        } else {
          console.log("CURRENTLY NOT RECOGNIZED CHAIN ID");
          console.log(chainId);
          setNetworkCorrect(false);
          toast.error(
            "You are connected to the wrong network. Please switch to the Op-anat Optimistic L2 Roll Up Testnet.",
          );
        }
      }
    };
    checkWalletConnectionAndNetwork();
  }, [walletConnected, networkCorrect]);

  useEffect(() => {
    async function fetchIPFSData(cid: string): Promise<string> {
      try {
        // const response = await fetchWithTimeout(`https://ipfs.io/ipfs/${cid}`);
        // console.log(response);
        // return response.data;
        return `https://ipfs.io/ipfs/${cid}`;
      } catch (error) {
        console.error("Failed to fetch data from IPFS:", error);
        toast.error(`Failed to fetch data from IPFS: ${error}`);
        return "Error fetching data from IPFS";
      }
    }

    const getImage = async (imageUrlArg: string) => {
      console.log("INSIDE");
      console.log(imageUrlArg);
      if (selectedModel === 50) {
        const fetchedImageUrl = await fetchImageFromIPFS(imageUrlArg);
        console.log("fetched image url");
        console.log(fetchedImageUrl);
        setImageUrl(fetchedImageUrl);
      }
    };

    const listenForResult = async () => {
      try {
        setLoading(true);
        const contract = await getAIOracleContract();

        const handleResult = async (
          account: string,
          requestId: number,
          invoker: string,
          output: string,
        ) => {
          // console.log("RESULT");
          // console.log(selectedModel);
          // console.log(output);
          // console.log(toUtf8String(output));
          if (selectedModel === 50) {
            const cid = toUtf8String(output);
            console.log(cid);
            const ipfsData = await fetchIPFSData(cid);
            console.log(ipfsData);
            console.log("BEFORE");
            getImage(ipfsData);
            console.log("AFTER");
            console.log(imageUrl);
            setResult(imageUrl);
          } else {
            setResult(toUtf8String(output));
          }
          toast.success("AI result received successfully!");
        };

        contract.on("AICallbackResult", handleResult);

        return async () => {
          contract.removeAllListeners("AICallbackResult");
        };
      } catch (error) {
        console.error("Error setting up event listener:", error);
        if (error instanceof Error) {
          setError(`Error setting up event listener: ${error.message}`);
          toast.error(`Error setting up event listener: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (walletConnected && networkCorrect) {
      listenForResult();
    }
  }, [walletConnected, networkCorrect, selectedModel]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ToastContainer />
      <div className="pl-5 z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {/* <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p> */}
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          {/* <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a> */}
          <select
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(Number(e.target.value));
              setResult(null);
            }}
            className="border border-gray-300 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 lg:pointer-events-auto lg:p-4"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.feature}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* The AI Oracle dApp section */}
      <div className="z-10 w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-8">AI Oracle dApp</h1>
        {!networkCorrect ? (
          <div>
            <p className="mb-4 text-lg">
              You are connected to the wrong network. Please switch to the
              Op-anat Optimistic L2 Roll Up Testnet.
            </p>
            <button
              onClick={switchNetwork}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Switch Network
            </button>
          </div>
        ) : !walletConnected ? (
          <div>
            <p className="mb-4 text-lg">
              Please connect your MetaMask wallet to continue.
            </p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Connect Wallet
            </button>
            {error && <p className="mt-4 text-red-500">{error}</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your AI prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : selectedModel == 11
                ? "Submit"
                : "Generate Image"}
            </button>
          </form>
        )}
        {selectedModel === 50 &&
          result &&
          (isValidUrl(result) ? (
            <Image
              src={`/api/proxy?ipfsUrl=${encodeURIComponent(result)}`}
              alt="Generated AI Image"
              className="mt-4 max-w-full h-auto"
              width={400}
              height={400}
              priority
            />
          ) : (
            <p className="mt-4 text-lg">{result}</p>
          ))}

        {selectedModel === 11 && result && (
          <p className="mt-4 text-lg">{result}</p>
        )}
      </div>

      {/* Original Next.js and Tailwind content */}
      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        {/* <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        /> */}
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Docs{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Find in-depth information about ORA features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Learn{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Learn about ORA in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Templates{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Explore starter templates for ORA.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Deploy{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Instantly deploy your ORA site to a shareable URL with Vercel or own
            EC2.
          </p>
        </a>
      </div>
    </main>
  );
}
