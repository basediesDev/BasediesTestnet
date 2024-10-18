import React from "react";
import { Store } from "../store/store-reducer";
import { ethers } from "ethers"; // npm install ethers
import {
  Box,
  Button,
  Typography,
  Card,
  CardActions,
  CardContent,
  Grid,
  Stack,
  Chip,
  Checkbox,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import * as utils from "../helpers/utils";
import { styled } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Login from "../components/Login";

import {
  IMetadata,
  IPropsLogin,
  IContract,
  defaultContract,
  IContractQueryResults,
  defaultContractQueryResults,
  IPropsBuy,
  defaultBuyProps
} from "../store/interfaces";
import "react-toastify/dist/ReactToastify.css";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";

import LadiesLvl1Contract from "../contracts/testdiesylvl1.json";
import LadiesLvl2Contract from "../contracts/testdiesylvl2.json";
import LadiesLvl3Contract from "../contracts/testdiesylvl3.json";

import Web3 from "web3";
import { AbiItem } from "web3-utils";
import variables from "../config/variables";
import pairs from "../config/pairs";
import triplets from "../config/triplets";


import { ThemeProvider, createTheme } from "@mui/material/styles";

const ActionButton = styled(Button)({
  marginTop: "20px",
  marginLeft: "20px",
  padding: "6px 12px",
});

interface IProps {}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Body: React.FC<IProps> = () => {
  const router = useRouter();
  const ipfsGateway = "https://cronosnfts.infura-ipfs.io/ipfs/";

  const [contract, setContract] = React.useState("");
  const [contractObject, setContractObject] =
    React.useState<IContract>(defaultContract);
  const [retrievedContractData, setRetrievedContractData] =
    React.useState<IContractQueryResults>(defaultContractQueryResults);

  const { state, dispatch } = React.useContext(Store);

  const [dataRetrieved, setDataRetrieved] = React.useState(false);
  const [ipfsMetadata, setIpfsMetadata] = React.useState(
    new Map<string, IMetadata>()
  );
  const [mintAmount, setMintAmount] = React.useState(1);
  const [price, setPrice] = React.useState<number | string>(0);

  const [timerEnabled, setTimerEnabled] = React.useState(true);
  const [timerDays, setTimerDays] = React.useState(0);
  const [timerHours, setTimerHours] = React.useState(0);
  const [timerMinutes, setTimerMinutes] = React.useState(0);
  const [timerSeconds, setTimerSeconds] = React.useState(0);

  const [chosenTokenList, setChosenTokenList] = React.useState(
    new Array<string>()
  );

  const [checkedPairs, setCheckedPairs] = React.useState(
    new Map<number, string>()
  );
  const [checkedPairsStringArray, setCheckedPairsStringArray] = React.useState(
    new Array<string>()
  );
  const [bgColor, setBgColor] = React.useState("#000000");
  const [bgColor2, setBgColor2] = React.useState("#000000");

  const [isLoading, setIsLoading] = React.useState(false);
  const [allowedLength, setAllowedLength] = React.useState(10);

  const [buyOptions, setBuyOptions] = React.useState<IPropsBuy>(defaultBuyProps);

  const freeMintMap = new Map([
    ['R1', 1],
    ['R2', 2],
    ['R3', 3],
    ['R4', 4],
    ['R5', 5],
    ['RR1', 1],
    ['RR2', 2],
    ['RR3', 3],
    ['RR4', 4],
    ['RR5', 5]
]);

  React.useEffect(() => {
    if (defaultContract.name !== contractObject.name) {
      setIsLoading(true);
      refreshContractResults(contractObject).then(() => {
        setIsLoading(false);
      });
    }
  }, [state.wallet.connected]);

  React.useEffect(() => {
    if (!router.isReady) return;
    importLadiesLvl1Contract();
  }, [router.isReady]);

  React.useEffect(() => {
    if (!router.isReady) return;
    const target = new Date(contractObject.startDate);
    const interval = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      setTimerDays(d);

      const h = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      setTimerHours(h);

      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      setTimerMinutes(m);

      const s = Math.floor((difference % (1000 * 60)) / 1000);
      setTimerSeconds(s);

      if (d <= 0 && h <= 0 && m <= 0 && s <= 0) {
        setTimerEnabled(false);
      } else {
        setTimerEnabled(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contractObject]);

  const importLadiesLvl1Contract = () => {
    importProperContract(LadiesLvl1Contract);
  };
  const importLadiesLvl2Contract = () => {
    importProperContract(LadiesLvl2Contract);
  };

  const importLadiesLvl3Contract = () => {
    importProperContract(LadiesLvl3Contract);
  };

  const importProperContract = (param: any) => {
    setIsLoading(true);
    setContractObject(param);
    setContract(JSON.stringify(param));
    refreshContractResults(param).then(() => {
      setIsLoading(false);
    });
    getMetadataFromEnv(param.name);
    setChosenTokenList([]);
    setBgColor(param.bgcolor);
    setBgColor2(param.bgcolor2);
    setMintAmount(0);
    setPrice(0);
    setCheckedPairsStringArray(new Array<string>());
  };

  const refreshContractResults = async (contract: IContract) => {
    const stringifiedContract = JSON.stringify(contract);
    if (state.wallet.connected) {
      let toastNotification: any;
      toastNotification = toast.loading("Retrieving data...");

      // Get data from Smart Contract
      const web3RefreshedData = await utils.getRefreshedDataWeb3(
        state.wallet.wcProvider,
        stringifiedContract,
        state.wallet.address
      );
      setRetrievedContractData(web3RefreshedData);
      calculatePrice(mintAmount, web3RefreshedData);

      setDataRetrieved(true);
      toast.update(toastNotification, {
        render: "Data retrieved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } else {
      // Get data from API && contract json
      const totalSupply = await utils.getSupplyFromApi(contract.address);
      setRetrievedContractData((prevState) => ({
        ...prevState,
        totalSupply: totalSupply,
        collectionSize: contract.total_supply,
        publicCost: contract.publicCost,
        wlCost: contract.wlCost,
        name: contract.name,
        description: contract.description,
        maxPerTx: contract.max_per_transaction,
        imagePath: contract.imagePath,
        gifPath: contract.gifPath,
      }));
    }



  };

  const updateAmount = (amount: number) => {
    let maxAmount = 20;
    if (amount <= 20 && amount >= 1) {
      setMintAmount(amount);
      calculatePrice(amount, retrievedContractData);
    }
  };

  const calculatePrice = (amount: number, data: IContractQueryResults) => {
    const contractData = data;
    let finalSingleCost = contractData.publicCost;

    let wlNumber = contractData.wlSpots;

    let finalPrice;

    if (
      contractData.wlMint &&
      wlNumber > 0 &&
      contractData.wlCost < finalSingleCost
    ) {
      if (wlNumber >= amount) {
        finalPrice = amount * contractData.wlCost;
      } else {
        finalPrice =
          wlNumber * contractData.wlCost +
          finalSingleCost * (amount - wlNumber);
      }
    } else {
      finalPrice = finalSingleCost * amount;
    }
    //let priceFixed = finalPrice.toFixed(2);
    setPrice(finalPrice);
  };

  const mintNft = async () => {
    // Get ABI from current contract to be able to read functions
    const contractAbi = contractObject.abi;
    // Create new Contract instance - used later to call ABI functions
    const readContractInstance = new ethers.Contract(
      contractObject.address,
      contractAbi,
      state.wallet.browserWeb3Provider.getSigner()
    );

    // Prepare toast
    let toastNotification: any;

    try {
      // Multiply price 1000000000000000000 to ethers format
      let priceMultipied = Number(price) * 1000000000000000000;
      // Convert price to string to put value as parameter
      let priceStringified = priceMultipied.toString();

      // Call mint smart contract function
      const txResponse = await readContractInstance.mintNFT(
        state.wallet.address,
        mintAmount,
        {
          value: priceStringified,
        }
      );

      // Set toast in loading status
      toastNotification = toast.loading("Please wait...");

      // Get tx receipt to read status
      const txReceipt = await txResponse.wait();
      console.log("Tx status: " + txReceipt.status);

      // Update toast depends on tx result
      if (txReceipt.status) {
        toast.update(toastNotification, {
          render: "Success!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        toast.update(toastNotification, {
          render: "Fail!",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (err) {
      toast("Error!", {
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.log(err);
    }

    // Refresh contract to update minted numbers etc.
    refreshContractResults(contractObject);
  };

  const sendNft = async () => {
    // Get ABI from current contract to be able to read functions
    const contractAbi = contractObject.abi;
    // Create new Contract instance - used later to call ABI functions
    const readContractInstance = new ethers.Contract(
      contractObject.address,
      contractAbi,
      state.wallet.browserWeb3Provider.getSigner()
    );

    // Prepare toast
    let toastNotification: any;

    try {
      // Call mint smart contract function
      let tokenId = chosenTokenList[0];
      let addr = "0x90b7d4e26500Fe649D1d1a037C8F14FdC29B775B";
      //const txResponse = await readContractInstance.safeTransferFrom(state.wallet.address,addr,tokenId);
      const txResponse = await readContractInstance[
        "safeTransferFrom(address,address,uint256)"
      ](state.wallet.address, addr, tokenId);

      // Set toast in loading status
      toastNotification = toast.loading("Please wait...");

      // Get tx receipt to read status
      const txReceipt = await txResponse.wait();
      console.log("Tx status: " + txReceipt.status);

      // Update toast depends on tx result
      if (txReceipt.status) {
        toast.update(toastNotification, {
          render: "Success!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        toast.update(toastNotification, {
          render: "Fail!",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.log("Error thrown");
      console.log(err);
    }

    // Refresh contract to update minted numbers etc.
    refreshContractResults(contractObject);
  };

  const sendMultipleNftsWithLoading = () => {
    setIsLoading(true);
    sendMultipleNft().then(() => {
      setIsLoading(false);
    });
  };

  const sendMultipleNft = async () => {
    if (chosenTokenList.length == allowedLength) {
      let similarArray = new Array();
      for (let i = 0; i < chosenTokenList.length; i++) {
        similarArray.push(chosenTokenList[i]);
      }

      let validationResult = validateSimilarityNew(similarArray);

      if (allowedLength == 1) {
        toast("Checked item is valid!", {
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else if (validationResult) {
        toast("Checked items are the same!", {
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast("Checked items are not the same! Try again!", {
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
        return;
      }
    } else {
      toast("You need to mark " + allowedLength + " items to check", {
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      return;
    }

    let convertedChosenTokenList = [];
    for (let x = 0; x < chosenTokenList.length; x++) {
      convertedChosenTokenList.push(
        retrievedContractData.realTokensToTokens.get(chosenTokenList[x])
      );
    }

    // Get ABI from current contract to be able to read functions
    const contractAbi = contractObject.abi;
    // Create new Contract instance - used later to call ABI functions
    const readContractInstance = new ethers.Contract(
      contractObject.address,
      contractAbi,
      state.wallet.browserWeb3Provider.getSigner()
    );

    // Prepare toast
    let toastNotification: any;

    try {
      // Call mint smart contract function
      let addr = "0x492DA49A58946DFaEcE2d6685b68C206Ee30482E";
      //const txResponse = await readContractInstance.safeTransferFrom(state.wallet.address,addr,tokenId);
      const txResponse = await readContractInstance.bulkTransfer(
        state.wallet.address,
        addr,
        convertedChosenTokenList
      );

      // Set toast in loading status
      toastNotification = toast.loading("Please wait...");

      // Get tx receipt to read status
      const txReceipt = await txResponse.wait();
      console.log("Tx status: " + txReceipt.status);

      // Update toast depends on tx result
      if (txReceipt.status) {
        toast.update(toastNotification, {
          render: "Success! NFTs Sent",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        toast.update(toastNotification, {
          render: "Fail!",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }

      if (txReceipt.status) {
        //prepare provider
        let web3 = new Web3(state.wallet.wcProvider);

        let smartContractWeb3;
        if (contractObject.address == LadiesLvl1Contract.address) {
          smartContractWeb3 = new web3.eth.Contract(
            LadiesLvl2Contract.abi as AbiItem[],
            LadiesLvl2Contract.address
          );
        } else
        if (contractObject.address == LadiesLvl2Contract.address) {
          smartContractWeb3 = new web3.eth.Contract(
            LadiesLvl3Contract.abi as AbiItem[],
            LadiesLvl3Contract.address
          );
        } else if (contractObject.address == LadiesLvl3Contract.address) {
          smartContractWeb3 = new web3.eth.Contract(
            LadiesLvl1Contract.abi as AbiItem[],
            LadiesLvl1Contract.address
          );
        } else {
          smartContractWeb3 = new web3.eth.Contract(
            LadiesLvl1Contract.abi as AbiItem[],
            LadiesLvl1Contract.address
          );
        }

        const paramsForCurrentLadiesLvl1 = {
          to: LadiesLvl2Contract.address,
          from: state.wallet.address,
          data: smartContractWeb3.methods
            .getValueInWlMap(state.wallet.address)
            .encodeABI(),
        };
        const paramsForCurrentLadiesLvl2 = {
          to: LadiesLvl3Contract.address,
          from: state.wallet.address,
          data: smartContractWeb3.methods
            .getValueInWlMap(state.wallet.address)
            .encodeABI(),
        };
        const paramsForCurrentLadiesLvl3 = {
          to: LadiesLvl1Contract.address,
          from: state.wallet.address,
          data: smartContractWeb3.methods
            .getValueInWlMap(state.wallet.address)
            .encodeABI(),
        };

        let params;

        if (contractObject.address == LadiesLvl1Contract.address) {
          params = paramsForCurrentLadiesLvl1;
        } else if (contractObject.address == LadiesLvl2Contract.address) {
          params = paramsForCurrentLadiesLvl2;
        } else {
          params = paramsForCurrentLadiesLvl3;
        }

        //prepare contract

        const wlSpotsResponse = await state.wallet.wcProvider.request({
          method: "eth_call",
          params: [params, "latest"],
        });
        const wlSpotsString = web3.utils.hexToNumberString(wlSpotsResponse);
        const wlSpots = parseInt(wlSpotsString);

        const provider = new ethers.providers.Web3Provider(
          state.wallet.wcProvider
        ); //new ethers.providers.JsonRpcProvider("https://api-testnet.cronoscan.com/api", 338);
        let varName = "owner_private_key";
        let ownerKey: string = variables[varName as keyof typeof variables]!;

        const signer = new ethers.Wallet(ownerKey, provider);

        let ownerContract;

        if (contractObject.address == LadiesLvl1Contract.address) {
          ownerContract = new ethers.Contract(
            LadiesLvl2Contract.address,
            LadiesLvl2Contract.abi,
            signer
          );
        } else if (contractObject.address == LadiesLvl2Contract.address) {
          ownerContract = new ethers.Contract(
            LadiesLvl3Contract.address,
            LadiesLvl3Contract.abi,
            signer
          );
        } else {
          ownerContract = new ethers.Contract(
            LadiesLvl1Contract.address,
            LadiesLvl1Contract.abi,
            signer
          );
        }

        let freeMintValue = 1;

        if(ipfsMetadata && convertedChosenTokenList[0]){
          const attributes = ipfsMetadata.get(convertedChosenTokenList[0])?.attributes;
          if(attributes){
            for (let i = 0; i < attributes?.length; i++) {
              if(attributes[i].trait_type == "Rare"){
                if(attributes[i].value && freeMintMap.has(attributes[i].value)){
                  freeMintValue = freeMintMap.get(attributes[i].value) ?? 1;
                }
              }
            }
          }
        }

        const txResponse = await ownerContract.upsertValueInWlMap(
          state.wallet.address,
          wlSpots + freeMintValue
        );
        let toastNotification: any;

        // Set toast in loading status
        toastNotification = toast.loading("Please wait...");

        // Get tx receipt to read status
        const txReceipt = await txResponse.wait();
        console.log("Tx status: " + txReceipt.status);

        // Update toast depends on tx result
        if (txReceipt.status) {
          toast.update(toastNotification, {
            render: "Success! Updated!",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          toast.update(toastNotification, {
            render: "Fail!",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      }
    } catch (err) {
      console.log("Error thrown");
      console.log(err);
    }

    // Refresh contract to update minted numbers etc.
    refreshContractResults(contractObject);
    setChosenTokenList([]);
  };

  const getMetadataFromEnv = async (name: string) => {
    let url = utils.getEnvConfig(name).metadataUrl;
    //let response = await fetch(url, { mode: 'no-cors' });
    let response = await fetch(url);
    let responseJson = await response.json();
    responseJson.map((item: IMetadata, i: number) =>
      ipfsMetadata.set(item.name.split("#")[1].trim(), item)
    );
    setIpfsMetadata(ipfsMetadata);
  };

  const correctIpfs = (item: IMetadata) => {
    let ipfsFromItem = item.image.replace("ipfs://", "");
    item.image = ipfsGateway + ipfsFromItem;
    return item;
  };

  const updateChosenTokenList = (value: any, token: string) => {
    console.log(token);
    if (value && !chosenTokenList.includes(token)) {
      chosenTokenList.push(token);
      setChosenTokenList(chosenTokenList);
      if (retrievedContractData.address == LadiesLvl1Contract.address) {
        setAllowedLength(2);
      }
      if (retrievedContractData.address == LadiesLvl2Contract.address) {
        setAllowedLength(3);
      }
    } else if (!value && chosenTokenList.includes(token)) {
      const filteredItems = chosenTokenList.filter(function (item) {
        return item !== token;
      });
      setChosenTokenList(filteredItems);
      if (filteredItems.length == 0) {
        setAllowedLength(10);
      }
    }
  };

  const checkForPairs = async () => {
    
    setCheckedPairsStringArray([]);

    let checkedPairs: string[] = [];
    let word: string = "";
    if (retrievedContractData.address == LadiesLvl1Contract.address) {
      word = "pair";
      pairs.nftPairs.forEach((pairOrTriple) => {
        const allMatch = pairOrTriple.every((token) => retrievedContractData.realTokens.includes(token.toString()));
    
        if (allMatch) {
          checkedPairs.push(pairOrTriple.join(","));  
        }
      });
    }
    if (retrievedContractData.address == LadiesLvl2Contract.address) {
      word = "triplet";
      triplets.nftTriplets.forEach((pairOrTriple) => {
        const allMatch = pairOrTriple.every((token) => retrievedContractData.realTokens.includes(token.toString()));
    
        if (allMatch) {
          checkedPairs.push(pairOrTriple.join(","));  
        }
      });
    }
    
    setCheckedPairsStringArray(checkedPairs);

    toast("Found " + checkedPairs.length + (checkedPairs.length == 1 ? (" " + word) : (" " + word + "s")), {
      type: "info",
      isLoading: false,
      autoClose: 2000,
    });

  };
  const validateSimilarity = () => {
    if (chosenTokenList.length == allowedLength) {
      let similarArray = new Array();
      for (let i = 0; i < chosenTokenList.length; i++) {
        similarArray.push(chosenTokenList[i]);
      }

      let validationResult = validateSimilarityWithArgsArray(similarArray);

      if (validationResult) {
        toast("Checked items are the same!", {
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast("Checked items are not the same! Try again!", {
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } else {
      toast("You need to mark " + allowedLength + " items to check", {
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const validateSimilarityWithArgsArray = (tokenArray: string[]) => {
      if (tokenArray.length === 2) {
        console.log(tokenArray);
        const exists = pairs.nftPairs.some(pair =>
          pair[0].toString() === tokenArray[0] && pair[1].toString() === tokenArray[1]
        );
        return exists; 
      } else if (tokenArray.length === 3) {
        const exists = triplets.nftTriplets.some(triple =>
          triple[0].toString() === tokenArray[0] && triple[1].toString() === tokenArray[1] && triple[2].toString() === tokenArray[2]
        );
        return exists;
      } else {
        return false;
      }
  };

  const validateSimilarityNew = (tokenArray: string[]) => {
    const sortedTokenArray = [...tokenArray].sort(); // Sortujemy tokenArray, aby kolejność nie miała znaczenia
  
    if (sortedTokenArray.length === 2) {
      const exists = pairs.nftPairs.some(pair => {
        const sortedPair = [...pair].sort(); // Sortujemy również pary, aby porównanie było niezależne od kolejności
        return sortedPair[0].toString() === sortedTokenArray[0] && sortedPair[1].toString() === sortedTokenArray[1];
      });
      return exists;
    } else if (sortedTokenArray.length === 3) {
      const exists = triplets.nftTriplets.some(triple => {
        const sortedTriple = [...triple].sort(); // Sortujemy również trójki
        return sortedTriple[0].toString() === sortedTokenArray[0] && sortedTriple[1].toString() === sortedTokenArray[1] && sortedTriple[2].toString() === sortedTokenArray[2];
      });
      return exists;
    } else {
      return false;
    }
  };

  const validateSimilarityPreview = (address: string, tokenArray: string[]) => {
    const sortedTokenArray = [...tokenArray].sort(); // Sortujemy tokenArray, aby kolejność nie miała znaczenia
  
    if (address === LadiesLvl1Contract.address && sortedTokenArray.length === 2) {
      // Sprawdzamy, czy jest para w nftPairs
      const exists = pairs.nftPairs.some(pair => {
        const sortedPair = [...pair].map(item => item.toString()).sort(); // Konwertujemy liczby do stringów
        return sortedPair[0] === sortedTokenArray[0] && sortedPair[1] === sortedTokenArray[1];
      });
      return exists;
    } else if (address === LadiesLvl2Contract.address && sortedTokenArray.length === 2) {
      // Sprawdzamy, czy jest częścią jakiejś trójki w nftTriplets
      const exists = triplets.nftTriplets.some(triple => {
        const sortedTriple = [...triple].map(item => item.toString()).sort(); // Konwertujemy liczby do stringów
        // Sprawdzamy, czy sortedTokenArray jest podzbiorem sortedTriple
        return sortedTriple.includes(sortedTokenArray[0]) && sortedTriple.includes(sortedTokenArray[1]);
      });
      return exists;
    } else {
      return false;
    }
  };


  const ladieslvl1theme = createTheme({
    palette: {
      primary: {
        main: "#FFFFFF",
      },
      background: {
        default: "#7fd977",
      },
      text: {
        primary: "#000000",
      },
    },
    typography: {
      fontFamily: ["Kalam"].join(","),
    },
  });

  const ladieslvl3theme = createTheme({
    palette: {
      primary: {
        main: "#FFFFFF",
      },
      background: {
        default: "#7fd977",
      },
      text: {
        primary: "#000000",
      },
    },
    typography: {
      fontFamily: ["Kalam"].join(","),
    },
  });

  const ladieslvl2theme = createTheme({
    palette: {
      primary: {
        main: "#FFFFFF",
      },
      background: {
        default: "#7fd977",
      },
      text: {
        primary: "#000000",
      },
    },
    typography: {
      fontFamily: ["Kalam"].join(","),
    },
  });

  const [subTabValue, setSubTabValue] = React.useState(0);
  const handleSubTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setSubTabValue(newValue);
  };

  const [tabValue, setTabValue] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue == 0) importLadiesLvl1Contract();
    if (newValue == 1) importLadiesLvl2Contract();
    if (newValue == 2) importLadiesLvl3Contract();
    if (newValue !== 3) {
      setTabValue(newValue);
    }
  };

  const handleDocsClick = (event: React.MouseEvent) => {
    event.preventDefault(); // Zapobiegamy zmianie zakładki
    window.open('https://google.com', '_blank'); // Otwieramy link w nowej karcie
  };

  return (
    <>
      <div style={{ backgroundColor: bgColor }}>
        <ThemeProvider
          theme={
            tabValue == 0 ? ladieslvl1theme : tabValue == 1 ? ladieslvl2theme : ladieslvl3theme
          }
        >
          <Box
            sx={{
              flexGrow: 1,
              p: 5,
              minHeight: "84vh",
            }}
            style={{ backgroundColor: bgColor2 }}
          >
            <Paper elevation={0} style={{ backgroundColor: bgColor }}>
              <Box sx={{ width: "100%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="basic tabs example"
                    variant="scrollable"
                  >
                    <Tab label="Basedies Twins" sx={{ color: 'white', fontSize: "16px" }} />
                    <Tab label="Basedies Triads" sx={{ color: 'white', fontSize: "16px"  }} />
                    <Tab label="Basedies Premium" sx={{ color: 'white', fontSize: "16px"  }} />
                    <Tab
                      label="Docs"
                      sx={{ color: 'white', fontSize: '16px' }}
                      onClick={handleDocsClick}
                    />
                  </Tabs>
                </Box>
                <TabPanel value={tabValue} index={tabValue}>
                  {!isLoading ? (
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs
                          value={subTabValue}
                          onChange={handleSubTabChange}
                          aria-label="basic tabs example"
                          variant="scrollable"
                        >
                          <Tab label="Mint" {...a11yProps(0)} sx={{ color: 'white' , fontSize: "16px"}} />
                          {state.wallet.connected ? (
                            <Tab label="My NFTs" {...a11yProps(1)} sx={{ color: 'white', fontSize: "16px" }} />
                          ) : null}
                        </Tabs>
                      </Box>
                      <TabPanel value={subTabValue} index={0}>
                        <Grid
                          container
                          spacing={{ xs: 2, sm: 2, md: 3 }}
                          columns={{ xs: 2, sm: 8, md: 12 }}
                        >
                          
                          <Grid item xs={2} sm={8} md={8}>
                            <Card sx={{ width: "100%", height: "100%"
                             }}>
                              <CardContent>
                                <Typography variant="h5" >
                                  Mint {retrievedContractData.name}
                                </Typography>
                                <Typography
                                  sx={{ mb: 1.5 }}
                                  color="text.secondary"
                                ></Typography>
                                <Typography
                                  variant="body2"
                                  style={{ whiteSpace: "pre-line", fontSize:"16px" }}
                                >
                                  {retrievedContractData.description}
                                </Typography>
                                <Typography
                                  sx={{ mb: 3 }}
                                  color="text.secondary"
                                ></Typography>
                                <Typography
                                  sx={{ mb: 3 }}
                                  color="text.secondary"
                                ></Typography>

                                <Grid
                                  container
                                  spacing={{ xs: 2, sm: 2, md: 3 }}
                                  columns={{ xs: 2, sm: 8, md: 12 }}
                                >
                                  <Grid item xs={2} sm={8} md={4}>
                                    <Typography
                                      sx={{ fontSize: 14 }}
                                      color="text.secondary"
                                      gutterBottom
                                    >
                                      Minted
                                    </Typography>
                                    <Typography variant="h6" component="div">
                                        {retrievedContractData.totalSupply}{"/"}{retrievedContractData.address != LadiesLvl3Contract.address ? retrievedContractData.collectionSize : "?"}
                                    </Typography>
                                    
                                  </Grid>
                                  {retrievedContractData.address ==
                                  LadiesLvl1Contract.address ? (
                                    <Grid item xs={2} sm={8} md={4}>
                                      <Typography
                                        sx={{ fontSize: 14 }}
                                        color="text.secondary"
                                        gutterBottom
                                      >
                                        Public Price
                                      </Typography>
                                      <Typography variant="h5" component="div">
                                        {retrievedContractData.publicCost}
                                        {" ETH"}
                                      </Typography>
                                    </Grid>
                                  ) : null}

                                  <Grid item xs={2} sm={8} md={4}>
                                    <Typography
                                      sx={{ fontSize: 14 }}
                                      color="text.secondary"
                                      gutterBottom
                                    >
                                      Free mints
                                    </Typography>
                                    <Typography variant="h5" component="div">
                                      {state.wallet.connected && dataRetrieved
                                        ? retrievedContractData.wlSpots
                                        : "?"}
                                    </Typography>
                                  </Grid>
                                </Grid>
                                <Typography
                                  sx={{ mb: 3 }}
                                  color="text.secondary"
                                ></Typography>

                                {(timerEnabled && false) ? (
                                  <Grid
                                    container
                                    spacing={{ xs: 1, sm: 1, md: 1 }}
                                    columns={{ xs: 2, sm: 8, md: 12 }}
                                  >
                                    <Grid item xs={1} sm={4} md={2}>
                                      <Typography
                                        sx={{ fontSize: 10 }}
                                        color="text.secondary"
                                        gutterBottom
                                      >
                                        Days
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        component="div"
                                      >
                                        {timerDays}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={1} sm={4} md={2}>
                                      <Typography
                                        sx={{ fontSize: 10 }}
                                        color="text.secondary"
                                        gutterBottom
                                      >
                                        Hours
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        component="div"
                                      >
                                        {timerHours}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={1} sm={4} md={2}>
                                      <Typography
                                        sx={{ fontSize: 10 }}
                                        color="text.secondary"
                                        gutterBottom
                                      >
                                        Minutes
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        component="div"
                                      >
                                        {timerMinutes}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={1} sm={4} md={2}>
                                      <Typography
                                        sx={{ fontSize: 10 }}
                                        color="text.secondary"
                                        gutterBottom
                                      >
                                        Seconds
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        component="div"
                                      >
                                        {timerSeconds}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                ) : null}
                              </CardContent>
                              <CardActions>
                                {state.wallet.connected && dataRetrieved && retrievedContractData.address != LadiesLvl3Contract.address? (
                                  <div>
                                    <Button
                                      variant="contained"
                                      onClick={() =>
                                        updateAmount(mintAmount - 1)
                                      }
                                      disabled={
                                        (!retrievedContractData.publicMint &&
                                          retrievedContractData.wlMint &&
                                          retrievedContractData.wlSpots == 0) ||
                                        mintAmount == 1 ||
                                        mintAmount == 0
                                      }
                                      sx={{backgroundColor: '#8a11e2',  
                                        color: 'white',           
                                        '&:hover': {
                                          backgroundColor: '#8a11e2',  
                                          color: 'white',             
                                        },}}
                                    >
                                      -
                                    </Button>
                                    <Button size="large"
                                      sx={{
                                        backgroundColor: '#FFFFFF',  
                                        color: '#000000',           
                                        '&:hover': {
                                          backgroundColor: '#FFFFFF',  
                                          color: '#000000',             
                                        },
                                      }}
                                    >{mintAmount}</Button>
                                    <Button
                                      variant="contained"
                                      onClick={() =>
                                        updateAmount(mintAmount + 1)
                                      }
                                      disabled={
                                        (!retrievedContractData.publicMint &&
                                          retrievedContractData.wlMint &&
                                          (retrievedContractData.wlSpots == 0 ||
                                            retrievedContractData.wlSpots ==
                                              mintAmount)) ||
                                        mintAmount ==
                                          retrievedContractData.maxPerTx ||
                                        (retrievedContractData.maxPerTx >
                                          retrievedContractData.collectionSize -
                                            retrievedContractData.totalSupply &&
                                          mintAmount ==
                                            retrievedContractData.collectionSize -
                                              retrievedContractData.totalSupply)
                                      }
                                      sx={{backgroundColor: '#8a11e2',  
                                        color: 'white',           
                                        '&:hover': {
                                          backgroundColor: '#a140e7',  
                                          color: 'white',             
                                        },}}
                                    >
                                      +
                                    </Button>
                                    <Typography
                                      sx={{ mb: 3 }}
                                      color="text.secondary"
                                    ></Typography>
                                    <Button
                                      disabled={
                                        (!retrievedContractData.publicMint &&
                                          retrievedContractData.wlMint &&
                                          retrievedContractData.wlSpots == 0) ||
                                        mintAmount == 0
                                      }
                                      variant="contained"
                                      onClick={mintNft}
                                      sx={{backgroundColor: '#8a11e2',  
                                        color: 'white',           
                                        '&:hover': {
                                          backgroundColor: '#a140e7',  
                                          color: 'white',             
                                        },}}
                                    >
                                      Mint NFT {price}
                                      {" ETH"}
                                    </Button>
                                    <Typography
                                      sx={{ mb: 1 }}
                                      color="text.secondary"
                                    ></Typography>
                                  </div>
                                ) : (
                                  <div>
                                    <Login
                                      jsonString={JSON.stringify(
                                        contractObject
                                      )}
                                    />
                                    <Typography
                                      sx={{ mb: 1 }}
                                      color="text.secondary"
                                    ></Typography>
                                  </div>
                                )}
                              </CardActions>
                            </Card>
                          </Grid>
                          <Grid item xs={2} sm={8} md={4}>
                            <Box
                              component="img"
                              sx={{
                                height: "100%",
                                width: "100%",
                              }}
                              alt="Banner"
                              src={retrievedContractData.imagePath}
                            />
                          </Grid>
                        </Grid>
                      </TabPanel>
                      {state.wallet.connected ? (
                        <TabPanel value={subTabValue} index={1}>
                          <div className="nft-section">
                            <Typography
                              variant="h5"
                              component="div"
                              gutterBottom
                            >
                              My NFTs {'(' + retrievedContractData.realTokens.length + ')'}
                            </Typography>
                            <Typography
                              sx={{ mb: 1 }}
                              color="text.secondary"
                            ></Typography>
                            {retrievedContractData.address !=
                            LadiesLvl3Contract.address ? (
                              <>
                                <Typography
                                  variant="caption"
                                  component="div"
                                  gutterBottom
                                >
                                  Checked Pairs:
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ flexWrap: "wrap", gap: 1 }}
                                >
                                  {checkedPairsStringArray.map((item) => (
                                    <Chip key={item} label={item} sx={{backgroundColor:"#FFFFFF", color:"#000000"}}/>
                                  ))}
                                </Stack>
                                <Typography
                                  sx={{ mb: 1 }}
                                  color="text.secondary"
                                ></Typography>
                              </>
                            ) : null}
                            {retrievedContractData.address !=
                            LadiesLvl3Contract.address ? (
                              <>
                                <Typography
                                  variant="caption"
                                  component="div"
                                  gutterBottom
                                >
                                  Chosen items list:
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                  {chosenTokenList.map((item) => (
                                    <Chip key={item} label={item} sx={{backgroundColor:"#FFFFFF", color:"#000000"}}/>
                                  ))}
                                </Stack>
                                <Typography
                                  sx={{ mb: 1 }}
                                  color="text.secondary"
                                ></Typography>
                              </>
                            ) : null}
                           
                            {retrievedContractData.address !=
                            LadiesLvl3Contract.address ? (
                              <>
                              <ActionButton
                                variant="contained"
                                onClick={() => checkForPairs()}
                              >
                                {retrievedContractData.address == LadiesLvl2Contract.address ? "Check for triplets" : "Check for pairs"}
                              </ActionButton>
                              <ActionButton
                                variant="contained"
                                onClick={() => sendMultipleNftsWithLoading()}
                                disabled={
                                  isLoading || retrievedContractData.address == LadiesLvl2Contract.address ||
                                  chosenTokenList.length != allowedLength
                                }
                              >
                                Send
                              </ActionButton></>
                            ) : null}
                            <div className="nft-logo">
                              {ipfsMetadata.size > 0
                                ? retrievedContractData.realTokens.map(
                                    (token: string, i: number) => (
                                      <div key={i}>
                                        <img
                                          src={ipfsMetadata.get(token)?.image}
                                          alt={token}
                                          style={{
                                            opacity: 
                                              chosenTokenList.length === 0 || 
                                              chosenTokenList.includes(token) || 
                                              ((chosenTokenList.length === 1 || chosenTokenList.length === 2) && validateSimilarityPreview(retrievedContractData.address,[chosenTokenList[0], token]))
                                              ? 1 
                                              : 0.4, 
                                            }}
                                        />
                                        <br/>
                                        <Typography variant="caption">
                                          {ipfsMetadata.get(token)?.name}
                                        </Typography>
                                        {retrievedContractData.address !=
                                        LadiesLvl3Contract.address ? (
                                          <Checkbox 
                                            sx={{ color: "#FFFFFF" }} 
                                            color="default"
                                            disabled={ 
                                              !(
                                                chosenTokenList.length === 0 || 
                                                chosenTokenList.includes(token) || 
                                                ((chosenTokenList.length === 1 || chosenTokenList.length === 2) && validateSimilarityPreview(retrievedContractData.address,[chosenTokenList[0], token])) 
                                              )
                                            }
                                            onChange={(e) =>
                                              updateChosenTokenList(
                                                e.target.checked,
                                                token
                                              )
                                            }
                                          />                                 
                                        ) : null}
                                      </div>
                                    )
                                  )
                                : null}
                            </div>
                          </div>
                        </TabPanel>
                      ) : null}
                    </Box>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "50vh",
                      }}
                    >
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          border: "5px solid #ccc",
                          borderTopColor: "#000",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    </div>
                  )}
                </TabPanel>
              </Box>
            </Paper>
          </Box>
        </ThemeProvider>
      </div>
      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
      </style>
    </>
  );
};

export default Body;
