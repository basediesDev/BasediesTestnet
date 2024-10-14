import { ethers } from "ethers"; // npm install ethers
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'; // npm install @coinbase/wallet-sdk

import { IWallet, defaultWallet } from "../store/interfaces";
import * as utils from "./utils";
import * as config from "../config/config";
import { toast } from "react-toastify";

let coinbaseWallet: CoinbaseWalletSDK | null = null;

// Funkcja do zmiany sieci
export const switchNetwork = async (provider: ethers.providers.ExternalProvider) => {
  if (!provider || !provider.request) {
    throw new Error("Provider jest niezdefiniowany lub nieobsługiwany.");
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: config.configVars.rpcNetwork.chainIdHex }],
    });
  } catch (e) {
    console.log(e);
    await provider.request({
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
  }
};

// Główna funkcja logowania do portfela Coinbase Wallet
export const connect = async (): Promise<IWallet> => {
  try {
    // Sprawdzenie, czy kod działa po stronie klienta
    if (typeof window !== 'undefined') {
      // Inicjalizacja Coinbase Wallet SDK po stronie klienta
      coinbaseWallet = new CoinbaseWalletSDK({
        appName: "YourAppName",
        appLogoUrl: "https://example.com/logo.png",
        appChainIds: [84532],
      });
    } else {
      throw new Error("Coinbase Wallet SDK musi być używane po stronie klienta.");
    }

    const ethereumProvider = coinbaseWallet!.makeWeb3Provider(); // Używamy coinbaseWallet po stronie klienta

    if (!ethereumProvider || !ethereumProvider.request) {
      throw new Error("Provider jest niezdefiniowany lub nieobsługiwany.");
    }

    // Rzutowanie wyniku `eth_chainId` na string
    const chainId = (await ethereumProvider.request({ method: "eth_chainId" })) as string;
    console.log(chainId);

    // Sprawdzenie, czy użytkownik jest na odpowiedniej sieci
    if (!(chainId === config.configVars.rpcNetwork.chainIdHex)) {
      await switchNetwork(ethereumProvider);
      await utils.delay(2000);
      return defaultWallet;
    }

    // Uzyskiwanie kont z portfela
    const accounts = (await ethereumProvider.request({ method: "eth_requestAccounts" })) as string[];

    // Subskrybowanie wydarzeń zmiany sieci, konta lub rozłączenia
    ethereumProvider.on("chainChanged", utils.reloadApp);
    ethereumProvider.on("accountsChanged", utils.reloadApp);
    ethereumProvider.on("disconnect", utils.reloadApp);

    // Zwracanie szczegółów połączenia
    return {
      ...defaultWallet,
      walletProviderName: "coinbasewallet",
      address: accounts[0],
      browserWeb3Provider: new ethers.providers.Web3Provider(ethereumProvider),
      serverWeb3Provider: new ethers.providers.JsonRpcProvider(
        config.configVars.rpcNetwork.rpcUrl
      ),
      connected: true,
      chainId: utils.hexToInt(chainId),
      wcProvider: ethereumProvider,
    };
  } catch (e) {
    // Obsługa błędów
    toast("Error connecting Coinbase Wallet", {
      type: "error",
      isLoading: false,
      autoClose: 2000,
    });
    console.log(e);
    return defaultWallet;
  }
};
