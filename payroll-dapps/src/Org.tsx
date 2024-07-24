import { useWallet,InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col,Button  } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";


const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);
function Org() {

  const [employeeId, setEmployeeId] = useState('');
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [role, setRole] = useState('');

  const moduleAddress = "7b3a1639f5fbe11f3a92ca1257bb1e9be4742a3ba99a27448dbfe11963d60a55";
  const { account,signAndSubmitTransaction  } = useWallet();
  useEffect(() => {
    //addemployee();
    
    }, [account?.address]);
    
    const addemployee = async () => {
      if (!account) return [];
      
        const transaction:InputTransactionData = {
          data: {
            function:`${moduleAddress}::PayrollV3::add_employee`,
            functionArguments:[]
          }
        }
      try {
        // sign and submit transaction to chain
        const response = await signAndSubmitTransaction(transaction);
        // wait for transaction
        await aptos.waitForTransaction({transactionHash:response.hash});
        console.log("Employees added");
      } catch (error: any) {
        console.log("Employees!");
      }
    };
    
      return (
        
        <div >
          <h1>Organazation Section</h1>
          <div className="addEmployee">
          <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Employee ID" />
          <input value={employeeAddress} onChange={(e) => setEmployeeAddress(e.target.value)} placeholder="Employee Address" />
          <input value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="Hourly Rate" />
          <input value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} placeholder="Overtime Rate" />
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
          <button onClick={addemployee}>Add Employee</button>
          </div>
        </div>
      );
    }

export default Org;