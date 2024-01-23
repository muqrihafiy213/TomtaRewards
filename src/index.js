import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store';
import reportWebVitals from './reportWebVitals';
import { 
  createHashRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";

import Home from './Pages/HomePage/Home';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Protected from './MainComponents/Protected';
import Profile from './Pages/ProfilePage/Profile';
import Rewards from './Pages/RewardsPage/Rewards';
import RewardsAdmin from './Pages/RewardsPage/RewardsAdmin';
import Transactions from './Pages/RewardsPage/Transactions';
import Activity from './Pages/ActivityPage/Activity';
import ActivityAdmin from './Pages/ActivityPage/ActivityAdmin';
import AnnnouncementHub from './Pages/AnnouncementPage/AnnouncmentHub';
import UserList from './Pages/UserListsPage/UserList';
import TeamMembers from './Pages/TeamMembersPage/TeamMember';
import UserTransactions from './Pages/RewardsPage/UserTransactions';

const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={ 
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
          <App />
          </PersistGate>
    </Provider>}>
      <Route path="signup" element={<Signup />} />
      <Route path="login" element={<Login />} />
      <Route path="/" element={<Protected />}>
        <Route path="/" index element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/announcements" element={<AnnnouncementHub />} />
        <Route path="/activityAdmin" element={<ActivityAdmin />} />
        <Route path="/rewardsAdmin" element={<RewardsAdmin />} />
        <Route path="/teamMembers" element={<TeamMembers />} />
        <Route path="/userlist" element={<UserList />} />
        <Route path="/usertransactions" element={<UserTransactions />} 
        />
        <Route path="/transactions" element={<Transactions />} 
        />
      </Route>
      
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    
      <RouterProvider router={router} />
     
  </React.StrictMode>
);

reportWebVitals();