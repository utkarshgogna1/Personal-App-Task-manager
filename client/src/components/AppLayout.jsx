import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Outlet, Link } from 'react-router-dom';


import './AppLayout.css';
import Welcome from './Welcome';
import EventList from './EventList';

const AppLayout = () => {
  const { isLoading, logout, getAccessTokenSilently } = useAuth0();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weather, setWeather] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };




  useEffect(() => {
    const fetchWeather = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const accessToken = await getAccessTokenSilently();

          const url = `${process.env.REACT_APP_API_URL}/api/weather?lat=${latitude}&lon=${longitude}`;

          try {
            const response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            if (!response.ok) {
              throw new Error('Weather API error');
            }

            const data = await response.json();
            setWeather(data);
            console.log(weather)
          } catch (error) {
            console.error('Error fetching weather data:', error);
          }
        });
      }
    };

    fetchWeather();
  }, [getAccessTokenSilently]);

  const weatherDisplay = weather ? (
    <div className="weather-display">
      <div className="weather-ticker">
        <div className="weather-ticker-content">
          <p>🌡️ Temperature: {weather.current.temp_f}°F</p>
          <p> 🌬️ Wind: {weather.current.wind_kph} kph</p>
          <p>💧 Humidity: {weather.current.humidity}%</p>
          <p>🔎 Condition: {weather.current.condition.text}</p>
          {/* Add more data points that you wish to display */}
        </div>
      </div>
    </div>
  ) : null;
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }



  return (
    <div className="app">
      <div className="header-container">
        <h1>Your Personal App</h1>


        <div className="hamburger" onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        {weatherDisplay}
      </div>

      <nav className={`header ${isMenuOpen ? 'menu-open' : ''}`}>
        <ul className="menu">
          <li>
            <Link to="/app/Profile">Profile</Link>
          </li>
          <li>
            <Link to="/app/notes">Notes App</Link>
          </li>
          <li>
            <Link to="/app/debugger">Auth Debugger</Link>
          </li>
          <li>
            <Link to="/app/events">Events App</Link>
          </li>
          <li>
            <Link to="/app/world-clock">World Clock</Link>
          </li>
          <li>
            <button className="exit-button" onClick={() => logout({ returnTo: window.location.origin })}>
              Logout
            </button>
          </li>

        </ul>
      </nav>

      <div className="content">

        <div className='Welcome'><Welcome />
        </div>

        <Outlet /> </div>

    </div>
  );


};

export default AppLayout;
