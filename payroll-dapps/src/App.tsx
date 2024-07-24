import React from 'react';
import logo from './logo.svg';
import './App.css';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import Employee from './Employee'

function App() {
  return (
    <div className="App">
     <h1  style={{ textAlign: "right", paddingRight: "200px" }}>
  <WalletSelector />
</h1>
<Employee/>
    </div>
  );
}

export default App;
