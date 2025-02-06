import React from 'react';

import './Home.css';
import { useAuth0 } from '@auth0/auth0-react';
import Login from './Login';


import EventList from './EventList';
const Home = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  // Replace with actual username and tasks data

  <div>
  {!isAuthenticated && (
    <button className="btn-primary" onClick={() => loginWithRedirect()}>
      Login
    </button>
  )}
  {isAuthenticated && (
    <>
      <button className="btn-primary" onClick={() => {/* logic to navigate to app */}}>
        Enter App
      </button>
      <button className="btn-secondary" onClick={() => logout({ returnTo: window.location.origin })}>
        Logout
      </button>
    
    </>
  )}
  
</div>

  return (
    <div className="home">
      <h1> Welcome To Your Personal App</h1>
      <Login />
     <EventList />
   
     
    </div>
  );
};

export default Home;
