import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col,Button  } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";


const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);
function Employee() {
    const { account } = useWallet();
    useEffect(() => {
        fetchEmplyee();
      
      }, [account?.address]);
      
    const fetchEmplyee = async () => {
    if (!account) return [];
    // change this to be your module account address
    const moduleAddress = "7b3a1639f5fbe11f3a92ca1257bb1e9be4742a3ba99a27448dbfe11963d60a55";
    try {
        const PayrollSystemResource = await aptos.getAccountResource(
        {
            accountAddress:account?.address,
            resourceType:`${moduleAddress}::PayrollV1::PayrollSystem`
        }
        );
        console.log(PayrollSystemResource);
        
    } catch (e: any) {
        
    }
    };
    
    return (
        <h1>hi</h1>
      );
    }

export default Employee;