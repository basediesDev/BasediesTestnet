import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Store } from "../store/store-reducer";
import { useState, useContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { toast } from "react-toastify";
import { IPropsBuy } from "../store/interfaces";

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

const Buy: React.FC<IPropsBuy> = (options: IPropsBuy) => {
  const { state, dispatch } = React.useContext(Store);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickUrl = async (url: string) => {
    window.open(url, "_blank");
    handleClose();
  };

  // Disconnect wallet clears the data stored by the front-end app
  // Some wallets can be asked to actually disconnect from the app, but most cannot.
  // The recommended secure approach is for the user to disconnect their wallet
  // themselves in the wallet app or browser extension.

  const renderBuyButton = () => {
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
          Buy
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
          {options.options.map((item) => (
            <MenuItem
              key={item.url}
              onClick={() => {
                handleClickUrl(item.url);
              }}
              disableRipple
            >
              {item.display}
            </MenuItem>
          ))}
        </StyledMenu>
      </div>
    );
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: "#4f4f4f",
      },
    },
    typography: {
      fontFamily: ["PressStart2P"].join(","),
    },
  });

  return (
    <div>
      <ThemeProvider theme={theme}>{renderBuyButton()}</ThemeProvider>
    </div>
  );
};

export default Buy;
