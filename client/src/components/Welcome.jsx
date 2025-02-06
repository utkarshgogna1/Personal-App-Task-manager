import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import './AppLayout.css';

const Welcome = () => {
    const { user, isLoading, logout } = useAuth0();
    if (isLoading) {
        return <div className="loading">Loading...</div>;
      }
    
return(
    <div>
        <p>Welcome 👋 {user.name}.</p>
      </div>
);
}
export default Welcome;