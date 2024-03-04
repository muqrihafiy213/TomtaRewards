import React, { useEffect, useState } from 'react';
import { db, imgDB } from '../../firebaseConfig';
import img from "../../Assets/No_avatar.png";
import { ref, getDownloadURL as getImgDownloadURL } from 'firebase/storage';
import { getDocs, collection, onSnapshot, where, query } from 'firebase/firestore';
import { updateUserPoints } from './Components/GivePoints';
import AdminLayout from '../../Layouts/AdminLayout';
import { ChevronDoubleUp } from '@emotion-icons/heroicons-solid';
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import {
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Checkbox,
  Card, CardHeader, CardBody, CardFooter,
  Typography,
  Button,
  Tabs, TabsHeader, Tab,
  Avatar,
  Tooltip,
} from "@material-tailwind/react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../../userSlice';
import { earnedPoints } from './Components/CreatePointTransaction';

const TABS = [
  { label: "All", value: "All" },
  { label: "Admins", value: "Admins" },
  { label: "Superiors", value: "Superiors" },
  { label: "Normal", value: "Normal" },
];

const TABLE_HEAD = ["Members", "Role", "Superior", "Employed", ""];

function UserList() {
  const user = useSelector(selectUser);
  const currentUser = user.userProfile.uid;
  const currentUserName = user?.userProfile?.firstName + ' ' + user?.userProfile?.lastName;

  const [usersData, setUsersData] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState(null);
  const [open, setOpen] = useState(false);

  const UserTypeLabel = (type) =>{
    if(type === "0001"){
      return "SuperAdmin"
    }
    else if(type === "0002"){
      return "Admin"
    }
    else if(type === "0003"){
      return "Superior User"
    }
    else if(type === "0004"){
      return "Normal User"
    }
  }

  const showToastMessage = (status) => {
    if(status === "success"){
      toast.success("Points Given Success", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    else if(status === "nonselected"){
      toast.warning("No User Selected", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    else if(status === "nopoints"){
      toast.error("Please Choose a Selection", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    else if(status === "error"){
      toast.error("Point Error", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleOpen = () => {
    if (selectedUsers.length === 0) {
      showToastMessage("nonselected")
      return;
    }
    setOpen(!open);
  };

  const handleUserClick = (userId) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  const handleGivePoints = async () => {
    if (selectedPoints === null) {
      showToastMessage("nopoints")
      return;
    }

    // Update points for selected users
    for (const userId of selectedUsers) {
      try {
        const userRef = collection(db, 'Roles', 'Users', 'UserProfile');
        const q = query(userRef, where('uid', '==', userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.docs.length > 0) {
          const user = querySnapshot.docs[0];
          const currentPoints = user.data().points || 0;
          const selectedUserNames = user.data().firstName + user.data().lastName || null ;

          // Update points for the user
          await updateUserPoints(userId, currentPoints + selectedPoints);
          await earnedPoints(userId,selectedUserNames,currentUserName,selectedPoints);
        } else {
          console.error(`User with ID ${userId} not found.`);
        }
      } catch (error) {
        console.error('Error updating user points:', error);
      }
    }

    // Clear selected users and points after giving points
    setSelectedUsers([]);
    setSelectedPoints(null);

    showToastMessage("success")
  };

  const fetchImageData = async (users) => {
    const updatedUsersData = await Promise.all(
      users.map(async (user) => {
        if (!user.profile_image) {
          return { ...user, imageUrl: null };
        }

        const imageRef = ref(imgDB, user.profile_image);
        try {
          const url = await getImgDownloadURL(imageRef);
          return { ...user, imageUrl: url };
        } catch (error) {
          console.error('Error fetching image:', error);
          return { ...user, imageUrl: null };
        }
      })
    );
    setUsersData(updatedUsersData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let q;
        switch (activeTab) {
          case "Admins":
            q = query(collection(db, 'Roles', 'Users', 'UserProfile'), where('user_type', '==', '0002'),);
            break;
          case "Superiors":
            q = query(collection(db, 'Roles', 'Users', 'UserProfile'), where('user_type', '==', '0003'));
            break;
          case "Normal":
            q = query(collection(db, 'Roles', 'Users', 'UserProfile'), where('user_type', '==', '0004'));
            break;
          default:
            q = collection(db, 'Roles', 'Users', 'UserProfile');
            break;
        }

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("data", data)
        return data;
      } catch (error) {
        console.error('Error fetching data:', error);
        return [];
      }
    };

    // Real-time updates
    const unsubscribe = onSnapshot(collection(db, 'Roles', 'Users', 'UserProfile'), (snapshot) => {
      const updatedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredData = updatedData.filter(user => user.uid !== currentUser);
      const filteredUpdatedData = filteredData.filter(user => {
        switch (activeTab) {
          case "Admins":
            return user.user_type === '0002';
          case "Superiors":
            return user.user_type === '0003';
          case "Normal":
            return user.user_type === '0004';
          default:
            return true;
        }
      });
      fetchImageData(filteredUpdatedData);
    });

    async function fetchDataForTab() {
      const data = await fetchData();
      const filteredData = data.filter(user => user.id !== currentUser);
      fetchImageData(filteredData);
    };

    fetchDataForTab();

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [activeTab,currentUser]);

  return (
    <AdminLayout>
      <ToastContainer />
      <h1 className='m-3 2xl:m-7 font-bold text-secondary 2xl:text-[38px] md:text-[28px] text-[20px]'>USER HUB</h1>
      <Card className=" w-11/12 mx-auto my-5">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-8 flex items-center justify-between gap-8"></div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Tabs value="all" className="w-full md:w-max">
              <TabsHeader>
                {TABS.map(({ label, value }) => (
                  <Tab key={value} value={value} onClick={() => setActiveTab(value)} className={activeTab === value ? "text-buttons" : ""}>
                    &nbsp;&nbsp;{label}&nbsp;&nbsp;
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
            <div className="w-full md:w-72 flex justify-center">
              <Button className="flex items-center gap-3" size="sm" onClick={handleOpen}>
                <ChevronDoubleUp strokeWidth={2} className="h-4 w-4" /> Give Points
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="max-h-[60vh] h-auto overflow-scroll px-0">
          <table className="mt-4 w-full  min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head, index) => (
                  <th
                    key={head}
                    className="  cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                    >
                      {head}{" "}
                      {index !== TABLE_HEAD.length - 1 && (
                        <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                      )}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody c>
              {usersData.length === 0 ? (
                <div className='m-auto container flex justify-center '>
                  <div className='p-10'>No Users Available</div>
                </div>
              ) : (
                usersData.map((user, index) => {
                  const isLast = index === usersData.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                  return (
                    <tr key={user.id}>
                      <td className={classes}>
                        <div className=" flex items-center gap-3">
                          {user.imageUrl ? (
                            <Avatar src={user.profile_image} alt={user.firstName} onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = img;
                              e.target.alt = 'placeholder';
                            }} size="sm" />) : (
                              <img
                                className='shadow w-9 h-9 rounded-full bg-gray-300'
                                src={img}
                                alt='placeholder'
                              />
                            )}
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal opacity-70"
                            >
                              {user.email}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {UserTypeLabel(user.user_type)}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="w-max">
                          {"TBA"}
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {"TBA"}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Tooltip content="Pick User">
                          <Checkbox className="h-8 w-8 rounded-full border-gray-900/20 bg-buttons transition-all hover:scale-105 hover:before:opacity-0"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserClick(user.id)}
                          />
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          {/* <div className="flex gap-2">
            <Button variant="outlined" size="sm">
              Previous
            </Button>
            <Button variant="outlined" size="sm">
              Next
            </Button>
          </div> */}
        </CardFooter>
      </Card>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Choose Recognition</DialogHeader>
        <DialogBody>
          <div className='row '>
            <div className='flex justify-center'>{selectedPoints}</div>
            <div className='flex gap-4 p-2'>
              <Button
                color="blue"
                onClick={() => setSelectedPoints(10)}
              >
                Applause (10)
              </Button>
              <Button
                color="red"
                onClick={() => setSelectedPoints(20)}
              >
                Bravo (20)
              </Button>
              <Button
                color="green"
                onClick={() => setSelectedPoints(30)}
              >
                Cheers (30)
              </Button>
              <Button
                color="amber"
                onClick={() => setSelectedPoints(40)}
              >
                Delight (40)
              </Button>
              <Button
                color="indigo"
                onClick={() => setSelectedPoints(50)}
              >
                Extraordinary (50)
              </Button>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="green" onClick={() => {
            handleGivePoints();
            handleOpen();
          }}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </AdminLayout>
  );
}

export default UserList;
