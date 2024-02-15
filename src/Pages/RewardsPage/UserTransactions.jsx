import React,{useEffect, useState} from 'react'
import { Card,Typography } from "@material-tailwind/react";
import {  db } from '../../firebaseConfig';
import { getDocs, collection ,query , where} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import MainLayout from '../../Layouts/MainLayout';
import Points from '../../MainComponents/Points';
import { useSelector } from 'react-redux';
import { selectUser } from '../../userSlice';


function UserTransactions () {

    const user = useSelector(selectUser);
    const userId = user.userProfile.uid

    async function fetchDataFromFireStore() {
        const userRef = collection(db, 'Transactions');
        const q = query(userRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q)
    
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
        
       },);

    return (
      <div>
        <MainLayout>
        
         <div className='container m-auto'>
         <div className='m-auto column flex justify-between'>
          <div className=' flex sm:m-auto my-auto'>
          <Link to="/rewards">
                <p className='font-bold text-white md:text-[28px] text-[14px]'>REWARDS</p>
                </Link> 
                <p className='md:px-3 px-1 font-bold text-secondary md:text-[28px] text-[14px]'>MY TRANSACTIONS</p>
                  
                </div>
            <div key="key" className='w-4/12 container p-4'>
              <div className='m-auto flex justify-center bg-secondary rounded-[99px] shadow-xl p-2'>
                <span className='text-primary font-bold sm:text-[12px] '>
                  <Points />
                </span>
              </div>
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
                    const classes = isLast ? "p-4 " : "p-4 border-b border-blue-gray-50 ";
        
                    return (
                    <tr key={transactions.id}>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            {transactions.userName}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className={`font-normal ${transactions.type === 'redeem' ? 'text-red-500' : ''}`}
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
         
        </MainLayout>
      </div>
    )
  }
  
  export default UserTransactions