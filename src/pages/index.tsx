import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.min.css';
import { ToastContainer, toast } from 'react-toastify';
import Header from "../components/Header";
import Footer from "../components/Footer";
import Body from "../components/Body";
import React from "react";
import { styled } from "@mui/material/styles";
import { Box, Button } from "@mui/material";
import Paper from "@mui/material/Paper";
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] })

const ActionButton = styled(Button)({
  marginTop: "20px",
  marginLeft: "20px",
  padding: "6px 12px",
});

export default function Home() {
  return (
    <>
    <div>
      <Head>
        <title>Basedies</title>
        <meta name="description" content="Basedies" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Body />    
      <Footer />
      <ToastContainer toastStyle={{ fontFamily: "Kalam", fontSize: 16 }} />
      </div> 
    </>
  )
}
