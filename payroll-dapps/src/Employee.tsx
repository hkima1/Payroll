import { useWallet,InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network  } from "@aptos-labs/ts-sdk";
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col,Button,List  } from "antd";
import {AptosClient, HexString ,Types} from "aptos"
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import axios from 'axios';

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptosClient = new Aptos(aptosConfig);
function Employee() {
  type Employee = {
    id: string; 
    address: string;
    hourly_rate: string; 
    overtime_rate: string; 
    hours_worked: string;
    overtime_hours: string; 
    attendance: string; 
    turnover: string;
    payroll_errors: string; 
    last_paid_day: string; 
    role: string; 
    confirmed: boolean;
  };


  interface Notification {
    message: string;
    timestamp: number;
  }



  interface PreCheckEventData {
    employee_id: string;
    address: string;
    content: string;
  }
  
  interface PreCheckEvent {
    data: PreCheckEventData;
    // Include other relevant fields from the event object if necessary
  }

  const[employees, setEmployees] = useState<Employee>();
    const { account ,signAndSubmitTransaction } = useWallet();
    const [notifications, setNotifications] = useState<Notification[]>([{message: "None",
      timestamp: 0}]);
    const[preCheckEvents, setPreCheckEvents] = useState([]);
    const[filteredEvents, setFilteredEvents] = useState<PreCheckEvent[]>([
      {
        data: {
          employee_id: 'None',
          address: 'None',
          content: 'None',
        },
        // ... other fields
      },
      // ... more events
    ]);

    useEffect(() => {
      getEmployeeInfo(account?.address as MaybeHexString);
        //fetchEmplyee();
        //fetchRes();
      }, [account?.address]);
      

    const API_BASE_URL = 'https://fullnode.devnet.aptoslabs.com';
    const client = new AptosClient(API_BASE_URL);
    const moduleAddress = "7b3a1639f5fbe11f3a92ca1257bb1e9be4742a3ba99a27448dbfe11963d60a55";




    // Employee fetch data ::
    const getEmployeeInfo = async (accountAddress : string) => {
      const payload = {
        function: `${moduleAddress}::PayrollV4::get_employee_characteristics`,
        type_arguments:[],
        arguments:[accountAddress],
      };
    
      try {
        const employeeInfo = await client.view(payload);
        //setEmployees(employeeInfo);
        console.log("Employee Info:", employeeInfo);
        // Process the employeeInfo as needed
      } catch (error) {
        console.error("Error fetching employee info:", error);
      }
    };
    console.log(account);
    //getEmployeeInfo(account?.address as string);





    // Employ confirmation ::
    type MaybeHexString = string;
    async function getPreCheckEventsByAddress(eventKey :string, address : string) {
      try {
        // Fetch the events for the given event key
        const response = await axios.get(`${API_BASE_URL}/v1/events/${eventKey}`);
        const events: PreCheckEvent[] = response.data;
    
        // Filter the events by the specified address
        const filteredEvents = events.filter((event: PreCheckEvent) => event.data.address === address);
        setFilteredEvents(filteredEvents);
        return filteredEvents;
      } catch (error) {
        console.error('Error fetching events:', error);
        return[];
      }
    }
    
    const creationNum = 0; // This should be the actual creation number for your event
    // Convert the creation number to a little-endian hex string
    const creationNumHex = creationNum.toString(16).padStart(16, '0');

    // Concatenate the little-endian creation number and the account address to form the event key
    const eventKey = `${creationNumHex}${moduleAddress}`;
    const events=getPreCheckEventsByAddress(eventKey, account?.address as string)
      .then(events => {
        console.log('Filtered PreCheckEvents:', events);
      });

    // Polling interval (e.g., every 10 seconds)
    //setInterval(getPreCheckEventsByAddress, 10000);




    const confirmEmployee = async (employeeAddress :string, confirmation : boolean) => {
      // The account that will sign the transaction
      const transaction:InputTransactionData = {
        data: {
          function:`${moduleAddress}::PayrollV4::confirm_employee`,
          functionArguments:[employeeAddress, confirmation]
        }
      }

      try {
        // sign and submit transaction to chain
        const response = await signAndSubmitTransaction(transaction);
        console.log(`Transaction submitted with hash: ${response}`);
        // wait for transaction
        await aptosClient.waitForTransaction({transactionHash:response.hash});
      } catch (error: any) {
          console.error("Error confirming employee by address:", error);
      }
    };

    const NotificationComponent = () => {
      
      const fetchNotifications = async () => {
        if (!account) return;
    
    
        try {
          const notificationListResource = await aptosClient.getAccountResource({
            accountAddress: account.address,
            resourceType:`${moduleAddress}::PayrollV4::NotificationList`
          });
    
          // Assuming notifications are sorted with the newest first
          const latestNotifications = notificationListResource.notifications.slice(0, 3);
          setNotifications(latestNotifications);
        } catch (e) {
          console.error('Error fetching notifications:', e);
        }
      };
    
      useEffect(() => {
        const intervalId = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    
        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
      },[account?.address]); // Re-run the effect if the account address changes

    }

    return (
      <div>
        <h1>Employee Section</h1>
     <div>
          <h2>Employee Information</h2>
          {/* Render the employee information here */}
          <p>ID: {employees?.id}</p>
          <p>Address: {employees?.address}</p>
          <p>Hourly Rate: {employees?.hourly_rate}</p>
          <p>Overtime Rate: {employees?.overtime_rate}</p>
          <p>Hours Worked: {employees?.hours_worked}</p>
          <p>Overtime Hours: {employees?.overtime_hours}</p>
          <p>Attendance: {employees?.attendance}</p>
          <p>Turnover: {employees?.turnover}</p>
          <p>Payroll Errors: {employees?.payroll_errors}</p>
          <p>Last Paid Day: {employees?.last_paid_day}</p>
          <p>Role: {employees?.role}</p>
          <p>Confirmed: {employees?.confirmed ? 'Yes' : 'No'}</p>
          {/* Add more fields as necessary */}
    </div>
    
    <div>
        <h2>Exesting Event</h2>
          <List
            itemLayout="horizontal"
            dataSource={filteredEvents}
            renderItem={(event: PreCheckEvent) => (
              <List.Item>
                <List.Item.Meta
                  title={`Employee ID: ${event.data.employee_id}`}
                  description={
                    <>
                      <p>Address: {event.data.address}</p>
                      <p>Content: {event.data.content}</p>
                    </>
                  }
                />
              </List.Item>
            )}
          />
      </div>


      <div className="Notifications" >
      <h2>Latest Notifications</h2>
      {notifications.map((notification, index) => (
        <div key={index} >
          <p>Notification: {notification.message}</p>
          <p>Timestamp: {new Date(notification.timestamp * 1000).toLocaleString()}</p>
        </div>
      ))}
    </div>
    </div>
  );
};

export default Employee;