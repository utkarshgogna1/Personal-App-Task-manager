import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import NotFound from "./components/NotFound";
import Home from "./components/Home";

import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./AuthTokenContext";
import App from "./components/App";
import ProfilePage from "./components/ProfilePage";
import VerifyUser from "./components/VerifyUser";
import AppLayout from "./components/AppLayout";
import AuthDebugger from "./components/AuthDebugger";
import Event from "./components/Event";
import TimeZonePage from "./components/TimeZonePage";
import TimezoneDisplay from "./components/TimezoneDisplay";

import EventList from "./components/EventList";
const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

const requestedScopes = ["profile", "email"];
function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  // If the user is not authenticated, redirect to the home page
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, display the children (the protected page)
  return children;
}

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/app/events" element={<RequireAuth><Event/></RequireAuth>}/>
            <Route path="/verify-user" element={<VerifyUser/>} />
            <Route path="/App/notes" element={<App/>} />
            <Route path="/App/Profile" element={<ProfilePage />} />
            <Route path="/app/debugger" element={<AuthDebugger />}/>
            <Route path="/App" element={<RequireAuth><AppLayout/></RequireAuth>}/>
            <Route path="/App/world-clock"element={<RequireAuth><TimeZonePage/></RequireAuth>}/>
            <Route path="/" element={<EventList />} />
           
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);