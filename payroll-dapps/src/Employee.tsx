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
      fetchPayrollSystemResource();
        //fetchEmplyee();
        //fetchRes();
      }, [account?.address]);
      

    /*const fetchEmplyee = async () => {
    if (!account) return [];
    // change this to be your module account address
    const CONTRACT_ADDRESS = "7b3a1639f5fbe11f3a92ca1257bb1e9be4742a3ba99a27448dbfe11963d60a55";
    const payload = {
        function: `${CONTRACT_ADDRESS}::PayrollV2::get_employee_characteristics`,
        functionArguments: [account.address],
      };
    //const response = await aptosClient.view({ payload });

    };*/
    const moduleAddress = "7b3a1639f5fbe11f3a92ca1257bb1e9be4742a3ba99a27448dbfe11963d60a55";
    const fetchPayrollSystemResource = async () => {
      if (!account) return [];
      
      try {
        const payrollSystemResource = await aptosClient.getAccountResource({
          accountAddress: account.address,
          resourceType: `${moduleAddress}::PayrollV3::PayrollSystem`
        });
        console.log("PayrollSystem resource fetched successfully:", payrollSystemResource);
        // Access the Employee data within the PayrollSystem resource
        const employees = payrollSystemResource.data.employees;
        console.log("Employees:", employees);
      } catch (e) {
        console.error("Failed to fetch PayrollSystem resource:", e);
      }
    };
    
    // Call the function to fetch the PayrollSystem resource
    fetchPayrollSystemResource();
    
    


    return (
    <div>
      <h1>Employee Section</h1>
      
    </div>
  );
}

export default Employee;