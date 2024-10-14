import { ethers } from "ethers";
import React from "react";
import { StringLiteralLike } from "typescript";

export type Dispatch = React.Dispatch<IAction>;

export interface IState {
  wallet: IWallet;
}

export interface IAction {
  type: string;
  payload: any;
}

export interface IContract {
  name: string,
  symbol: string,
  total_supply: number,
  chain_symbol: string,
  chain: string,
  chain_id: number,
  address: string,
  publicCost: number,
  wlCost: number,
  startDate: string,
  abi: Object[],
  description: string,
  max_per_transaction: number,
  imagePath: string,
  gifPath: string
}

export const defaultContract: IContract = {
  name: 'Default',
  symbol: 'Default',
  total_supply: 0,
  chain_symbol: 'Default',
  chain: 'Default',
  chain_id: 0,
  address: 'Default',
  publicCost: 0,
  wlCost: 0,
  startDate: '',
  abi: [],
  description: '',
  max_per_transaction: 0,
  imagePath: '',
  gifPath: ''
};

// Interfaces.tsx
export interface IWallet {
  walletProviderName: string; // for example, "metamask" or "defiwallet"
  address: string; // 0x address of the user
  browserWeb3Provider: any; // Web3 provider connected to the wallet's browser extension
  serverWeb3Provider: ethers.providers.JsonRpcProvider | null; // cloud based Web3 provider for read-only
  wcConnector: any; // connector object provided by some wallet connection methods, stored if relevant
  wcProvider: any; // provider object provided by some wallet connection methods, stored if relevant
  connected: boolean; // is the wallet connected to the Dapp, or not?
  chainId: number; // for example, 25 for Cronos mainnet, and 338 for Cronos testnet
  provider: any;
}

export const defaultWallet: IWallet = {
  walletProviderName: "",
  address: "",
  browserWeb3Provider: null,
  serverWeb3Provider: null,
  wcConnector: null,
  wcProvider: null,
  connected: false,
  chainId: 0,
  provider: null,
};

export interface IAssetData {
  symbol: string;
  name: string;
  decimals: string;
  contractAddress: string;
  balance?: string;
}

export interface IMetadata {
  name: string;
  description: string;
  image: string;
  edition: string;
  attributes: IAttributes[]
}

export interface IAttributes {
  trait_type: string;
  value: string;
}


export interface IContractQueryResults {
  totalSupply: number;
  name: string;
  address: string;
  publicMint: boolean;
  wlMint: boolean;
  wlCost: number;
  wlSpots: number;
  publicCost: number;
  balance: number;
  collectionSize: number;
  tokens: string[];
  realTokens: string[];
  realTokensToTokens: Map<string,string>,
  description: string;
  maxPerTx: number;
  imagePath: string;
  gifPath: string;
}

export const defaultContractQueryResults: IContractQueryResults = {
  totalSupply: 0,
  name: '',
  address: '',
  publicMint: false,
  wlMint: false,
  publicCost: 0,
  wlCost: 0,
  wlSpots: 0,
  balance: 0,
  collectionSize: 0,
  tokens: [],
  realTokens: [],
  realTokensToTokens: new Map<string,string>(),
  description: '',
  maxPerTx: 0,
  imagePath: '',
  gifPath: ''
};

export interface IPropsLogin {
  jsonString: string;
};

export interface IPropsBuy {
  options: {
    display: string;
    url: string;
  } []
}

export const defaultBuyProps: IPropsBuy = {
  options: []
}
  
