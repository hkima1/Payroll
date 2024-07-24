import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col,Button  } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";


const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptosClient = new Aptos(aptosConfig);
function Employee() {

    const { account } = useWallet();

    useEffect(() => {
        fetchEmplyee();
        fetchRes();
      }, [account?.address]);
      

    const fetchEmplyee = async () => {
    if (!account) return [];
    // change this to be your module account address
    const CONTRACT_ADDRESS = "7b3a1639f5fbe11f3a92ca1257bb1e9be4742a3ba99a27448dbfe11963d60a55";
    const payload = {
        function: `${CONTRACT_ADDRESS}::PayrollV2::get_employee_characteristics`,
        functionArguments: [account.address],
      };
    //const response = await aptosClient.view({ payload });

    };
    const fetchRes = async () => {
        if (!account) return [];
        // change this to be your module account address
        const moduleAddress = "7b3a1639f5fbe11f3a92ca1257bb1e9be4742a3ba99a27448dbfe11963d60a55";
        try {
          const todoListResource = await aptosClient.getAccountResource(
            {
              accountAddress:account?.address,
              resourceType:`${moduleAddress}::PayrollV2::Employee`
            }
          );
          console.log("vectoire");
        } catch (e: any) {
          console.log("lose")
        }
      };
  
    return (
    <div>
      <h1>Employee Section</h1>
      
    </div>
  );
}

export default Employee;