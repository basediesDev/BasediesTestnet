// helper/utils.ts
import { ethers } from "ethers"; // npm install ethers
import Web3 from "web3";
import { IContractQueryResults } from "../store/interfaces";
import variables from "../config/variables";

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const hexToInt = (s: string) => {
  const bn = ethers.BigNumber.from(s);
  return parseInt(bn.toString());
};

export const getEnvConfig = (name: string) => {
  let varName = name.toLowerCase();
  let jsonString : string = variables[varName as keyof typeof variables]!;
  let jsonParsed = JSON.parse(jsonString);
  return jsonParsed;
}

export const reloadApp = () => {
  window.location.reload();
};

// Get the last block number
export const getLastBlockNumber = async (ethersProvider: any): Promise<any> => {
  return ethersProvider.getBlockNumber();
};

// Get the CRO balance of address
export const getCroBalance = async (
  serverWeb3Provider: ethers.providers.JsonRpcProvider,
  address: string
): Promise<number> => {
  const balance = await serverWeb3Provider.getBalance(address);
  // Balance is rounded at 2 decimals instead of 18, to simplify the UI
  return (
    ethers.BigNumber.from(balance)
      .div(ethers.BigNumber.from("10000000000000000"))
      .toNumber() / 100
  );
};

export const getRealTokensMap = async(
  name: string,
  tokens: string[]
): Promise<Map<string,string>> => {
  let url = getEnvConfig(name).metadataUrl;
  let newMap = new Map<string,string>();

  for(let i = 0; i < tokens.length; i++){
    let newUrl = url.replace('_metadata', tokens[i]);
    let response = await fetch(newUrl);
    let responseJson = await response.json();
    newMap.set(responseJson.name.split("#")[1].trim(), tokens[i]);
  }
  return newMap;
}

export const getRealTokens = async(
  tokenMap: Map<string,string>
): Promise<string[]> => {

  let realTokens = Array.from( tokenMap.keys() );
  return realTokens;
}

export const getRefreshedDataWeb3 = async (
  provider: any,
  smartContract: string,
  address: string
): Promise<IContractQueryResults> => {
  let smartContractJson = JSON.parse(smartContract);


  //prepare provider
  let web3 = new Web3(provider);

  //prepare contract
  let smartContractWeb3 = new web3.eth.Contract(
    smartContractJson.abi,
    smartContractJson.address
  )

  //number of already minted nfts
  const params = {
    to: smartContractJson.address,
    from: address,
    data: smartContractWeb3.methods.totalSupply().encodeABI(),
  };
  const totalSupplyResponse = await provider.request({
    method: "eth_call",
    params: [params, "latest"],
  });
  const totalSupply = web3.utils.hexToNumberString(totalSupplyResponse);

  //number of already minted for provided address
  params.data = smartContractWeb3.methods.balanceOf(address).encodeABI();
  const balanceResponse = await provider.request({
    method: "eth_call",
    params: [params, "latest"],
  });
  const balance = web3.utils.hexToNumberString(balanceResponse);

  //array of ids minted for provided address
  const tokens = await smartContractWeb3.methods.tokenOfwallet(address).call();

  const realTokensToTokensMap = await getRealTokensMap(
    smartContractJson.name,
    tokens
  );

  const realTokens = await getRealTokens(realTokensToTokensMap);

  //mint options available
  const wlMinting = await smartContractWeb3.methods.wlMinting().call();
  const publicMinting = await smartContractWeb3.methods.publicMinting().call();

  //number of spots for detailed WL
  params.data = smartContractWeb3.methods.getValueInWlMap(address).encodeABI();
  const wlSpotsResponse = await provider.request({
    method: "eth_call",
    params: [params, "latest"],
  });
  const wlSpotsString = web3.utils.hexToNumberString(wlSpotsResponse);
  const wlSpots = parseInt(wlSpotsString);

  let results: IContractQueryResults = {
    name: smartContractJson.name,
    address: smartContractJson.address,
    totalSupply: Number(totalSupply),
    balance: Number(balance),
    collectionSize: smartContractJson.total_supply,
    tokens: tokens,
    realTokens: realTokens,
    realTokensToTokens: realTokensToTokensMap,
    publicCost: smartContractJson.publicCost, //Number(convertedOtherCost),
    wlCost: smartContractJson.wlCost, //Number(convertedDetailedWlCost),
    publicMint: publicMinting,
    wlMint: wlMinting,
    wlSpots: wlSpots,
    description: smartContractJson.description,
    maxPerTx: smartContractJson.max_per_transaction,
    imagePath: smartContractJson.imagePath,
    gifPath: smartContractJson.gifPath
  }
  return results;
}

export const getTotalSupply = async (
  serverWeb3Provider: ethers.providers.JsonRpcProvider,
  smartContract: string
): Promise<number> => {
  let smartContractJson = JSON.parse(smartContract);
  // Create ethers.Contract object using the smart contract's ABI
  const contractAbi = smartContractJson.abi;
  const readContractInstance = new ethers.Contract(
    smartContractJson.address,
    contractAbi,
    serverWeb3Provider
  );
  const contractResponse = await readContractInstance.callStatic.totalSupply();
  let resp = hexToInt(contractResponse);
  return (
    resp
  );
};

export const getSupplyFromApi = async (
  contractAddress: string
): Promise<number> => {
  let varName = 'cronoscan_api_key';
  let key2 : string = variables[varName as keyof typeof variables]!;
  let url = 'https://base-sepolia.blockscout.com/api/v2/addresses/' + contractAddress;// + '&apikey=empty';
  try {
    const response = await fetch(url);
    const responseJson = await response.json();
    return responseJson.token.total_supply;
  } catch (err) {
    return 0;
  }
};
