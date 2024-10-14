import { createContext } from "react";
import {
    defaultWallet,
    IAction,
    IState,
  } from "../store/interfaces";

  const initialState: IState = {
    wallet: defaultWallet,
  };

const WalletContext = createContext<IState | any>(initialState);

export default WalletContext;