import React,{useEffect, useState} from 'react'
import { Card,Typography, ButtonGroup, Button, CardFooter } from "@material-tailwind/react";
import {  db } from '../../firebaseConfig';
import {  collection ,query , where , onSnapshot,  orderBy, limit, startAfter, limitToLast, endBefore} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import MainLayout from '../../Layouts/MainLayout';
import Points from '../../MainComponents/Points';
import { useSelector } from 'react-redux';
import { selectUser } from '../../userSlice';


function UserTransactions () {

    const user = useSelector(selectUser);
    const userId = user.userProfile.uid;

      const TABLE_HEAD = ["Name", "Points", "Quantity","Reward Name", "Date" ];
      const [transactionData, setTransactionData] = useState([]);
      const [currentPage, setCurrentPage] = useState(1);
      const [hasNextPage, setHasNextPage] = useState(true)

      useEffect(() => {
        const q = query(collection(db, "Transactions"), where('userId', '==', userId), orderBy("transaction_date"), limit(5));
        const unsubscribe = onSnapshot(q, (documents) => {
            const data = [];
            documents.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setTransactionData(data);
        });
        return () => unsubscribe();
    }, [userId]);

    const showNext = ({ item }) => {
        if(transactionData.length === 0) {
            alert("Thats all we have for now !")
        } else {
        const q = query(collection(db, "Transactions"),where('userId', '==', userId),orderBy("transaction_date"), limit(5), startAfter(item.transaction_date));
        const unsubscribe = onSnapshot(q, (documents) => {
            const data = [];
            documents.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            
                setCurrentPage(currentPage + 1);
                if(documents.size > 5){
                    data.pop();
                }
                else{
                    setHasNextPage(false)
                }
            
            setTransactionData(data); 
            
           
        });
        return () => unsubscribe();
            };
        }
    

    const showPrevious = ({item}) => {
        const q = query(collection(db, "Transactions"),where('userId', '==', userId), orderBy("transaction_date"), endBefore(item.transaction_date) ,limitToLast(5));
        const unsubscribe = onSnapshot(q, (documents) => {
            const data = [];
            documents.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setTransactionData(data);
            setCurrentPage(currentPage - 1)
            setHasNextPage(true)
        });
        return () => unsubscribe();
    };

    return (
      <div>
        <MainLayout>
        
         <div className='p-2 2xl:p-4'>
         <div className='m-auto column flex justify-between '>
          <div className=' flex sm:m-auto my-auto'>
          <Link to="/rewards">
                <p className='font-bold text-white  2xl:text-[38px] md:text-[28px] text-[20px]'>REWARDS</p>
                </Link> 
                <p className='md:px-3 px-1 font-bold text-secondary  2xl:text-[38px] md:text-[28px] text-[20px] underline underline-offset-8'>MY TRANSACTIONS</p>
                  
                </div>
            <div key="key" className='w-4/12 container p-4'>
              <div className='m-auto flex justify-center bg-secondary rounded-[99px] shadow-xl p-2'>
                <span className='text-primary font-bold sm:text-[12px] 2xl:text-[24px]'>
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
                        className="font-normal leading-none opacity-70 text-[16px] "
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
                    const transactionDate = transactions?.transaction_date && transactions.transaction_date.toDate();
                    return (
                    <tr key={transactions.id}>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal text-[12px]  "
                        >
                            {transactions.userName}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className={`font-normal text-[12px]   ${transactions.type === 'redeem' ? 'text-red-500' : 'text-green-500'}`}
                        >
                            {transactions.totalpoints}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal text-[12px]  "
                        >
                            {transactions.quantity}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal text-[12px]  "
                        > 
                         {transactions.rewardId}
                        </Typography>
                        </td>
                        <td className={classes}>
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="font-normal"
                                                    >
                                                        {transactionDate ? new Date(transactionDate).toLocaleDateString() : 'Invalid Date'}
                                                    </Typography>
                        </td>
                        
                    </tr>
                    );
                })}
                </tbody>
            </table>
            <CardFooter>
            <ButtonGroup>
                        {
                //show previous button only when we have items
                currentPage === 1 ? '' : 
                <Button onClick={() => showPrevious({ item: transactionData[0] }) }>Previous</Button>
                         }
                                    {
                                        //show next button only when we have items
                                       hasNextPage ? 
                                            <Button onClick={() => showNext({ item: transactionData[transactionData.length - 1] })}>Next</Button> : ""
                                    }
            </ButtonGroup>
            </CardFooter>
            </Card>
            
            </div>
         
         </div>
         
        </MainLayout>
      </div>
    )
  }
  
  export default UserTransactions