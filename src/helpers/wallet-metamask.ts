import { ethers } from "ethers"; // npm install ethers
import { IWallet, defaultWallet } from "../store/interfaces";
import * as utils from "./utils";
import * as config from "../config/config";
import { toast } from "react-toastify";

// Definiujemy typ rozszerzający ExternalProvider o metodę `on`
interface MetaMaskProvider extends ethers.providers.ExternalProvider {
  on?: (event: string, handler: (...args: any[]) => void) => void;
}

// Switch network using ethers.js provider
export const switchNetwork = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as MetaMaskProvider);
  const { chainId } = await provider.getNetwork();

  if (chainId !== parseInt(config.configVars.rpcNetwork.chainIdHex, 16)) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: config.configVars.rpcNetwork.chainIdHex }],
      });
    } catch (e: any) {
      if (e.code === 4902) {
        // If the network is not added to MetaMask, we need to add it
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: config.configVars.rpcNetwork.chainIdHex,
                chainName: config.configVars.rpcNetwork.chainName,
                rpcUrls: [config.configVars.rpcNetwork.rpcUrl],
                nativeCurrency: config.configVars.rpcNetwork.nativeCurrency,
                blockExplorerUrls: [config.configVars.rpcNetwork.blockExplorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.log("Error adding new chain: ", addError);
        }
      } else {
        console.log("Error switching network: ", e);
      }
    }
  }
};

// Main login flow using ethers.js
export const connect = async (): Promise<IWallet> => {
  try {
    if (!window.ethereum) {
      toast("MetaMask is not installed or available", {
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      return defaultWallet;
    }

    // Create a new ethers.js Web3Provider
    const provider = new ethers.providers.Web3Provider(window.ethereum as MetaMaskProvider);
    const { chainId } = await provider.getNetwork();

    if (chainId !== parseInt(config.configVars.rpcNetwork.chainIdHex, 16)) {
      await switchNetwork();
      await utils.delay(2000); // Adding delay after switching network
      return defaultWallet;
    }

    // Request accounts
    const accounts = await provider.send("eth_requestAccounts", []);
    console.log("Connected account:", accounts[0]);

    // Subskrybowanie zdarzeń (eventów) za pomocą rozszerzonego typu
    const metaMaskProvider = window.ethereum as MetaMaskProvider;
    if (metaMaskProvider.on) {
      metaMaskProvider.on("chainChanged", utils.reloadApp);
      metaMaskProvider.on("accountsChanged", utils.reloadApp);
      metaMaskProvider.on("disconnect", utils.reloadApp);
    }

    // Return wallet information
    return {
      ...defaultWallet,
      walletProviderName: "metamask",
      address: accounts[0],
      browserWeb3Provider: provider,
      serverWeb3Provider: new ethers.providers.JsonRpcProvider(config.configVars.rpcNetwork.rpcUrl),
      connected: true,
      chainId: chainId,
      wcProvider: window.ethereum
    };
  } catch (e) {
    toast("Error connecting to MetaMask", {
      type: "error",
      isLoading: false,
      autoClose: 2000,
    });
    console.log(e);
    return defaultWallet;
  }
};
