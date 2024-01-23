import React,{useEffect, useState} from 'react'
import AdminLayout from '../../Layouts/AdminLayout';
import { Card,Typography } from "@material-tailwind/react";
import {  db } from '../../firebaseConfig';
import { getDocs, collection } from 'firebase/firestore';
import { Link } from 'react-router-dom';


function Transactions () {

    async function fetchDataFromFireStore() {
        const querySnapshot = await getDocs(collection(db, "Transactions"))
    
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        return data;
      }
      const TABLE_HEAD = ["Name", "Points", "Quantity","Reward Name", ];
      const [transactionData, setTransactionData] = useState([]);
      

        

      

      useEffect(() => {
        async function fetchData() {
            const data = await fetchDataFromFireStore();
            setTransactionData(data);
        }
        fetchData();
        
       },[]);

    return (
      <div>
        <AdminLayout>
        
         <div className='container m-auto'>
            <div className='m-auto  flex justify-between p-3'>
            <div className=' flex '>
            <Link to="/RewardsAdmin">
                <p className='font-bold text-white text-[28px]'>REWARDS LISTING</p>
                </Link>
                <p className='px-3 font-bold text-primary text-[28px]'>TRANSACTIONS</p>
                  
                </div>
                    
                </div>
                
            <div className=''>
            <Card className="h-full w-full overflow-scroll ">
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                <tr>
                    {TABLE_HEAD.map((head) => (
                    <th
                        key={head}
                        className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                    >
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                        >
                        {head}
                        </Typography>
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {transactionData.map((transactions,index) => {
                    const isLast = index === transactionData.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
        
                    return (
                    <tr key={transactions.id}>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            {transactions.userId}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            {transactions.totalpoints}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            {transactions.quantity}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        > 
                         {transactions.rewardId}
                        </Typography>
                        </td>
                        
                        
                    </tr>
                    );
                })}
                </tbody>
            </table>
            </Card>
            </div>
         
         </div>
         
        </AdminLayout>
      </div>
    )
  }
  
  export default Transactions