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



  const [employeeId, setEmployeeId] = useState('');
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [role, setRole] = useState('');
  const [role1, setRole1] = useState('');
  const[employee, setEmployee] = useState<Employee>();
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

    const callInitialize = async () => {
      const transaction:InputTransactionData = {
        data: {
          function:`${moduleAddress}::PayrollV5::initialize`,
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
    //callInitialize();


    function stringToHex(str: string): string {
      const hex: string[] =[];
      for (let i = 0; i < str.length; i++) {
        hex.push(str.charCodeAt(i).toString(16));
      }
      return '0x' + hex.join('');
    }
    
    

    // Add New Employee
    const addemployee = async (id: number ,address:string,hourly_rate:  number,overtime_rate: number,role: string) => {
      if (!account) return [];
      
        const transaction:InputTransactionData = {
          data: {
            function:`${moduleAddress}::PayrollV5::add_employee`,
            functionArguments:[id, address, hourly_rate, overtime_rate,stringToHex(role)]
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
    
    // Find Employee By Role
    async function getEmployeesByRole(role: string) {
        const payload = {
          function: `${moduleAddress}::PayrollV5::get_employees_by_role`,
          type_arguments:[],
          arguments:[stringToHex(role)],
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


      // Get Specific Employee Info
      const getEmployeeInfo = async (accountAddress : string) => {
        const payload = {
          function: `${moduleAddress}::PayrollV5::get_employee_characteristics`,
          type_arguments:[],
          arguments:[accountAddress],
        };
      
        try {
          const employeeInfo = await client.view(payload);
          console.log("Employee Info:", employeeInfo);
          //setEmployees(employeeInfo);
          // Process the employeeInfo as needed
        } catch (error) {
          console.error("Error fetching employee info:", error);
        }
      };

    // Record Daily Hours
    const record_hours = async (id: number, hours_worked: number,overtime_hours: number) => {
      if (!account) return [];
      
        const transaction:InputTransactionData = {
          data: {
            function:`${moduleAddress}::PayrollV5::record_hours`,
            functionArguments:[id, hours_worked, overtime_hours]
          }
        }
      try {
        // sign and submit transaction to chain
        const response = await signAndSubmitTransaction(transaction);
        // wait for transaction
        await aptos.waitForTransaction({transactionHash:response.hash});
        console.log("Hours added");
      } catch (error: any) {
        console.log("There is Problem!");
      }
    };

    
      return (
        
      <div >
         <h1>Organazation Section</h1>
         <div>
      <Button
        type="primary"
        onClick={() => getEmployeeInfo(account?.address as string)}
      >
        Get Employee Info
      </Button>
      {employee && (
        <div>
          <h2>Employee Information</h2>
          <p>ID: {employee.id}</p>
          <p>Address: {employee.address}</p>
          <p>Hourly Rate: {employee.hourly_rate}</p>
          <p>Overtime Rate: {employee.overtime_rate}</p>
          <p>Hours Worked: {employee.hours_worked}</p>
          <p>Overtime Hours: {employee.overtime_hours}</p>
          <p>Attendance: {employee.attendance}</p>
          <p>Turnover: {employee.turnover}</p>
          <p>Payroll Errors: {employee.payroll_errors}</p>
          <p>Last Paid Day: {employee.last_paid_day}</p>
          <p>Role: {employee.role}</p>
          <p>Confirmed: {employee.confirmed}</p>
        </div>
      )}
    </div>
    
        <div className="addEmployee">
            <h3>Add Employee</h3>
            <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Employee ID" />
            <input value={employeeAddress} onChange={(e) => setEmployeeAddress(e.target.value)} placeholder="Employee Address" />
            <input value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="Hourly Rate" />
            <input value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} placeholder="Overtime Rate" />
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
            <button onClick={() => addemployee(parseInt(employeeId, 10),employeeAddress,parseInt(hourlyRate, 10),parseInt(overtimeRate, 10),stringToHex(role))}>Add Employee</button>
          </div>
          <br />
          <br />
          <br />
          <br />
           <div className="EmployByRole">
            <h3>Find Employ By Role</h3>
              { /*Input for the role */}
              <input
                value={role}
                onChange={(e) => setRole1(e.target.value)}
                placeholder="Enter role"
              />

              {/* Button to fetch employees by role */}
              <Button
                type="primary"
                onClick={() => getEmployeesByRole(role)}
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

        <div className="RecordHours">
            <h3>Add Daily Hours</h3>
            <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Employee ID" />
            <input value={employeeAddress} onChange={(e) => setEmployeeAddress(e.target.value)} placeholder="Employee Address" />
            <input value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="Hourly Rate" />
            <input value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} placeholder="Overtime Rate" />
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
            <button onClick={() => addemployee( Number(employeeId), employeeAddress,Number(hourlyRate),Number(overtimeRate),role)}>Add Employee</button>
          </div>



        </div>
      );
    }

export default Org;