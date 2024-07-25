import { useWallet,InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network} from "@aptos-labs/ts-sdk";
import {AptosClient, HexString ,Types,AptosAccount, TxnBuilderTypes} from "aptos"
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col,Button  } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";


const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);
function Org() {
  // Define the type for the employee data
  type Employee = {
    id: string; // Assuming id is a string representation of u64
    address: string; // Assuming address is a string representation of the address
    hourly_rate: string; // Assuming hourly_rate is a string representation of u64
    overtime_rate: string; // Assuming overtime_rate is a string representation of u64
    hours_worked: string; // Assuming hours_worked is a string representation of u64
    overtime_hours: string; // Assuming overtime_hours is a string representation of u64
    attendance: string; // Assuming attendance is a string representation of u64
    turnover: string; // Assuming turnover is a string representation of u64
    payroll_errors: string; // Assuming payroll_errors is a string representation of u64
    last_paid_day: string; // Assuming last_paid_day is a string representation of u64
    role: string; // Assuming role is a string representation of vector<u8>
    confirmed: boolean;
  };



  const [employeeId, setEmployeeId] = useState('NONE');
  const [employeeAddress, setEmployeeAddress] = useState('NONE');
  const [hourlyRate, setHourlyRate] = useState('NONE');
  const [overtimeRate, setOvertimeRate] = useState('NONE');
  const [role, setRole] = useState('NONE');
  const[employees, setEmployees] = useState<Employee[]>([ {
    id: "NONE",
    address: "NONE",
    hourly_rate: "NONE",
    overtime_rate: "NONE", 
    hours_worked: "NONE",
    overtime_hours:"NONE", 
    attendance: "NONE",
    turnover:"NONE",
    payroll_errors: "NONE",
    last_paid_day: "NONE",
    role: "NONE",
    confirmed:false,
}]); // Use the Employee type for the state

  
  const client = new AptosClient('https://fullnode.devnet.aptoslabs.com');
  const moduleAddress = "7b3a1639f5fbe11f3a92ca1257bb1e9be4742a3ba99a27448dbfe11963d60a55";
  const { account,signAndSubmitTransaction} = useWallet();
  useEffect(() => {
    //addemployee();
    
    }, [account?.address]);
/*
    const callInitialize = async () => {
      const transaction:InputTransactionData = {
        data: {
          function:`${moduleAddress}::PayrollV4::initialize`,
          functionArguments:[]
        }
      }
      try {
        // sign and submit transaction to chain
        const response = await signAndSubmitTransaction(transaction);
        // wait for transaction
        await aptos.waitForTransaction({transactionHash:response.hash});
        console.log("payroll_system is initialized");
      } catch (error: any) {
        console.log("payroll system isn't initialized");
      }
    };
    callInitialize();


/*

    const encoder = new TextEncoder();
    const employeeRoleBytes = encoder.encode("qeffe");
    console.log(employeeRoleBytes);
    const addemployee = async () => {
      if (!account) return [];
      
        const transaction:InputTransactionData = {
          data: {
            function:`${moduleAddress}::PayrollV4::add_employee`,
            functionArguments:[2, moduleAddress, 12, 12,Array.from(employeeRoleBytes)]
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
    };*/

    const encoder = new TextEncoder();
    const employeeRoleBytes = encoder.encode("qeffe");
    async function getEmployeesByRole(accountAddress :string, role: Uint8Array) {
        const payload = {
          function: `${moduleAddress}::PayrollV4::get_employees_by_role`,
          type_arguments:[],
          arguments:[accountAddress,role],
        };
      
        try {
          const employeeInfo= await client.view(payload);
          console.log("Employee Info by Role:", employeeInfo);
         // setEmployees(employeeInfo);
          // Process the employeeInfo as needed

        } catch (error) {
          console.error("Error fetching employee info:", error);
        }
      };


      const getEmployeeInfo = async (accountAddress : string) => {
        const payload = {
          function: `${moduleAddress}::PayrollV4::get_employee_characteristics`,
          type_arguments:[],
          arguments:[accountAddress],
        };
      
        try {
          const employeeInfo = await client.view(payload);
          console.log("Employee Info:", employeeInfo);
          // Process the employeeInfo as needed
        } catch (error) {
          console.error("Error fetching employee info:", error);
        }
      };

  

    
      return (
        
        <div >
         <h1>Organazation Section</h1>

        <div className="addEmployee">
            <h3>Add Employee</h3>
            <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Employee ID" />
            <input value={employeeAddress} onChange={(e) => setEmployeeAddress(e.target.value)} placeholder="Employee Address" />
            <input value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="Hourly Rate" />
            <input value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} placeholder="Overtime Rate" />
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
            <button /*</div>onClick={addemployee}*/>Add Employee</button>
          </div>
          <br />
          <br />
          <br />
          <br />
           <div className="EmployByRole">
            <h3>Find Employ By Role</h3>
              { /*Input for the role */}
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Enter role"
              />

              {/* Button to fetch employees by role */}
              <Button
                type="primary"
                onClick={() => getEmployeesByRole(account?.address as string, employeeRoleBytes)}
              >
                Get Employees By Role
              </Button>

              {/* Display the employees */}
              <div>
                {employees.map((employee, index) => (
                  <div key={index}>
                    <p>ID: {employee.id}</p>
                    <p>Address: {employee.address}</p>
                  </div>
                ))}
              </div>
        </div>
        </div>
      );
    }

export default Org;