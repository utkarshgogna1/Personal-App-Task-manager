import { useAuth0 } from "@auth0/auth0-react";
import React, { useState, useEffect } from 'react';

import AppLayout from "./AppLayout";

export default function Profile() {
  const { user, getAccessTokenSilently, isLoading, isAuthenticated } = useAuth0();
  const [editEmail, setEditEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [fetchedUserData, setFetchedUserData] = useState({email: ""});

  const getUserData = async () => {
    const accessToken = await getAccessTokenSilently();
    const fetchData = async () => {
      const userBack = await fetch(`${process.env.REACT_APP_API_URL}/api/user-profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${accessToken}`,
        }
      });
      const data = await userBack.json()
      setFetchedUserData(data);
    }
    if(accessToken){
        await fetchData();
    }
  }

  useEffect(() => {
    getUserData();
  }, [])

  // Set the user email when the user object is available
  useEffect(() => {
    if (user) {
      setNewEmail(user.email);
    }
  }, [user]);

  const handleEmailEdit = () => {
    setEditEmail(!editEmail);
  };

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);
  };

  const handleEmailUpdate = async () => {
    const accessToken = await getAccessTokenSilently();
    const userData = {
      email: newEmail
    };

    // Here you'd send userData to your server-side endpoint
    // For example:
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      // Handle successful email update
      setEditEmail(false);
    } else {
      alert(response)
    }
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please login to view your profile.</div>;
  }

  return (
    <div>
      {/* <div><AppLayout /></div> */}
      {user && (
        <>
          <div className="name">Name: {user.name}</div>
          <div>
            <img src={user.picture} width="70" alt="profile avatar" />
          </div>
          <div>
            {editEmail ? (
              <div>
                <input type="email" onChange={handleEmailChange} />
                <button onClick={handleEmailUpdate}>Update Email</button>
                <button onClick={handleEmailEdit}>Cancel</button>
              </div>
            ) : (
              <div>
                📧 Email: {fetchedUserData.email}
                <button onClick={handleEmailEdit}>Edit</button>
              </div>
            )}
          </div>
          <div>🔑 Auth0Id: {user.sub}</div>
          <div>✅ Email verified: {user.email_verified?.toString()}</div>
        </>
      )}
    </div>
  );
}