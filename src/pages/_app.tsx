import type { AppProps } from "next/app";
import { useState } from "react";
import { Store } from "../store/store-reducer";
import "../styles/index.css";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { defaultWallet, IAction, IState } from "../store/interfaces";

const initialState: IState = {
  wallet: defaultWallet,
};

function reducer(state: IState, action: IAction): IState {
  switch (action.type) {
    case "WALLET_UPDATED":
      return { ...state, wallet: action.payload };
    default:
      return state;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <Store.Provider value={{ state, dispatch }}>
      <Component {...pageProps} />
      <Analytics />
    </Store.Provider>
  );
}
