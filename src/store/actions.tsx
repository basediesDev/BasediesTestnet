import {
  Dispatch,
  IWallet,
} from "./interfaces";


export const updateWalletAction = (dispatch: Dispatch, wallet: IWallet) => {
  return dispatch({
    type: "WALLET_UPDATED",
    payload: wallet,
  });
};

