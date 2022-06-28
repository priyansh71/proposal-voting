import React from "react";
import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Proposal from "./pages/Proposal";
import moralisLogo from "./images/Moralis.svg";
import { ConnectButton } from "web3uikit";

const App = () => {
  return (
    <>
      <div className="header">
        <Link to="/">
        <img width="100px" src={moralisLogo} alt="logo" />
        </Link>
        <ConnectButton />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/proposal" element={<Proposal />} />
      </Routes>
    </>
  );
};

export default App;
