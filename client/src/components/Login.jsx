import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './AppLayout.css'; 
const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="login-container">
      
      <button onClick={() => loginWithRedirect()} className="btn-primary">
        Log In / Sign Up
      </button>
    </div>
  );
};

export default Login;
