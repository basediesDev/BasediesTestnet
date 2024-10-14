import * as React from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import FemaleIcon from '@mui/icons-material/Female';
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Link from "next/link";
import { ThemeProvider, createTheme } from "@mui/material/styles";

declare global {
  interface Window {
    ethereum: any;
  }
}

interface IProps {}

const Header: React.FC<IProps> = () => {
  const goHome = () => {
    //navigate('/');
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: "#000000",
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
      <ThemeProvider theme={theme}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                sx={{ mr: 2 }}
                LinkComponent={Link}
                href="/"
              >
                <FemaleIcon />
              </IconButton>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1 }}
                onClick={goHome}
              >
                Basedies
              </Typography>
              <Login jsonString="" />
            </Toolbar>
          </AppBar>
        </Box>
      </ThemeProvider>
    </div>
  );
};

export default Header;
