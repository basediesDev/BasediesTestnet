import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Store } from "../store/store-reducer";
import { useState, useContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// These are the wallet SDK helpers
import * as walletMetamask from "../helpers/wallet-metamask";
import * as walletDefiwallet from "../helpers/wallet-defiwallet";
import * as walletConnect from "../helpers/wallet-connect";
import * as walletCoinbase from "../helpers/wallet-coinbase";

import { toast } from "react-toastify";
import { IPropsLogin } from "../store/interfaces";

import { updateWalletAction } from "../store/actions";

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === "light"
        ? "rgb(55, 65, 81)"
        : theme.palette.grey[300],
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

declare global {
  interface Window {
    ethereum: any;
  }
}

const Login: React.FC<IPropsLogin> = (smartContract: IPropsLogin) => {
  const { state, dispatch } = React.useContext(Store);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Uncomment this to auto-connect in MetaMask in-app browser
  // React.useEffect(() => {
  //   async function initialLoad() {
  //     activate(injectedConnector);
  //   }
  //   initialLoad();
  // }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickConnect = async (option: string) => {
    let toastNotification = toast.loading("Connecting wallet...");
    let newWallet: any;
    switch (option) {
      // Wallet injected within browser (MetaMask)
      case "metamask-injected":
        newWallet = await walletMetamask.connect();
        break;
      // Crypto.com DeFi Wallet Extension (browser)
      case "defiwallet":
        newWallet = await walletDefiwallet.connect();
        break;
      // Crypto.com DeFi Wallet mobile app (via Wallet Connect)
      case "wallet-connect":
        newWallet = await walletConnect.connect();
        break;
      case "coinbase":
        newWallet = await walletCoinbase.connect();
        break;
      default:
        newWallet = await walletMetamask.connect();
    }
    // If wallet is connected, query the blockchain and update stored values
    if (newWallet.connected) {
      updateWalletAction(dispatch, newWallet);
    }
    toast.dismiss(toastNotification);
    handleClose();
  };

  // Disconnect wallet clears the data stored by the front-end app
  // Some wallets can be asked to actually disconnect from the app, but most cannot.
  // The recommended secure approach is for the user to disconnect their wallet
  // themselves in the wallet app or browser extension.
  const disconnectWallet = async () => {
    switch (state.wallet.walletProviderName) {
      case "defiwallet":
        await state.wallet.wcConnector.deactivate();
        break;
      default:
    }

    window.location.reload();
  };

  const renderLoginButton = () => {
    if (state.wallet.connected) {
      return (
        <div>
          {/*<Button color="inherit" onClick={disconnectWallet}>
          Disconnect
      </Button>*/}
          <Button
            id="demo-customized-button"
            aria-controls="demo-customized-menu"
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            variant="contained"
            disableElevation
            onClick={handleClick}
            endIcon={<KeyboardArrowDownIcon />}
          >
            {String(state.wallet.address).substring(0, 6) +
              "..." +
              String(state.wallet.address).substring(38)}
          </Button>
          <StyledMenu
            id="demo-customized-menu"
            MenuListProps={{
              "aria-labelledby": "demo-customized-button",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={disconnectWallet} disableRipple>
              Disconnect
            </MenuItem>
          </StyledMenu>
        </div>
      );
    } else {
      return (
        <div>
          <Button
            id="demo-customized-button"
            aria-controls="demo-customized-menu"
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            variant="contained"
            disableElevation
            onClick={handleClick}
            endIcon={<KeyboardArrowDownIcon />}
          >
            Connect Wallet
          </Button>
          <StyledMenu
            id="demo-customized-menu"
            MenuListProps={{
              "aria-labelledby": "demo-customized-button",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem
              onClick={() => {
                handleClickConnect("metamask-injected");
              }}
              disableRipple
            >
              MetaMask
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClickConnect("coinbase");
              }}
              disableRipple
            >
              Coinbase
            </MenuItem>
          </StyledMenu>
        </div>
      );
    }
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: "#8a11e2",
      },
    },
    typography: {
      fontFamily: [
        'Kalam',
      ].join(','),
    }
  });

  return (
    <div>
      <ThemeProvider theme={theme}>{renderLoginButton()}</ThemeProvider>
    </div>
  );
};

export default Login;
