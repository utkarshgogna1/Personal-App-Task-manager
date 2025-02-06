import React, { useState, useEffect } from 'react';
import './TimezoneDisplay.css';
import { useAuth0 } from "@auth0/auth0-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
const TimezoneDisplay = () => {
  const [timezones, setTimezones] = useState([]);
  const [selectedTimezones, setSelectedTimezones] = useState([]);
  const [timezoneTimes, setTimezoneTimes] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const [isEditMode, setIsEditMode] = useState(false);
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  useEffect(() => {
    const fetchSavedTimezones = async () => {
      try {
        setIsLoading(true);
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/timezones`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"

          },
        });
        if (!response.ok) {
          throw new Error(`Error fetching timezones: ${response.statusText}`);
        }
        const savedTimezones = await response.json();
        setSelectedTimezones(savedTimezones.map(tz => tz.name)); // Assuming the response structure has a 'name' property
      } catch (error) {
        console.error('Error fetching saved timezones:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSavedTimezones();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    // Fetch the list of all available timezones
    const fetchTimezones = async () => {
      const response = await fetch('https://worldtimeapi.org/api/timezone', {method: "GET"});
      const data = await response.json();
      setTimezones(data);
    };
    fetchTimezones();
  }, []);

  const filteredTimezones = timezones.filter((tz) =>
    tz.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    console.log(filteredTimezones); // This should log the filtered list of timezones
  }, [searchTerm, timezones]);


  const fetchTimeForTimezone = async (timezone) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`);
     
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
      setTimezoneTimes(prevTimes => ({
        ...prevTimes,
        [timezone]: new Date(data.datetime)
      }));
    } catch (error) {
      console.error("Error fetching timezone data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    selectedTimezones.forEach(timezone => {
      if (!timezoneTimes[timezone]) {
        fetchTimeForTimezone(timezone);
      }
    });
  }, [selectedTimezones, fetchTimeForTimezone]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Increment each timezone by one second
      setSelectedTimezones((currentSelectedTimezones) => {
        let newTimes = { ...timezoneTimes };
        currentSelectedTimezones.forEach((tz) => {
          if (timezoneTimes[tz]) {
            newTimes[tz] = new Date(timezoneTimes[tz].getTime() + 1000);
          }
        });
        setTimezoneTimes(newTimes);
        return currentSelectedTimezones;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timezoneTimes]);

  const deleteTimezone = async (timezoneName) => {
    try {
      setIsLoading(true);
      const accessToken = await getAccessTokenSilently();
      // Assuming the API can delete by name now, adjust as necessary
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/timezones/name/${encodeURIComponent(timezoneName)}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        setSelectedTimezones(currentSelectedTimezones =>
          currentSelectedTimezones.filter((name) => name !== timezoneName)
        );
      } else {
        console.error(`Failed to delete timezone. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete timezone:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const addTimezone = async (timezone) => {
    if (!selectedTimezones.includes(timezone)) {
      try {
        setIsLoading(true);
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/timezones`, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ timezone }),
        });
        if (!response.ok) {
          throw new Error(`Error saving timezone: ${response.statusText}`);
        }
        const newTimezone = await response.json();
        setSelectedTimezones([...selectedTimezones, newTimezone.name]);
      } catch (error) {
        console.error('Error saving timezone:', error);
      } finally {
        setIsLoading(false);
        setDropdownOpen(false);
      }
    }
  };
  const handleTimezoneClick = async (event, timezone) => {
    event.preventDefault();
    event.stopPropagation();

    if (selectedTimezones.includes(timezone)) {
      console.log(`Timezone ${timezone} is already selected.`);
      return;
    }

    try {
      setIsLoading(true);
      const accessToken = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/timezones`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: timezone })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setSelectedTimezones(prevSelectedTimezones => [...prevSelectedTimezones, result.name]);
    } catch (error) {
      console.error('Error while adding timezone:', error);
    } finally {
      setIsLoading(false);
      setDropdownOpen(false); // you might want to keep it open, depends on UX
    }
  };
  const formatTime = (timezone) => {
    const time = timezoneTimes[timezone];
    return time ? time.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone
    }) : 'Loading...';
  };


  return (
    <div className="app">
      {/* <div><AppLayout /></div> */}
      <div className='world-clock'><h2>Welcome To Your World Clock</h2></div>
      <div className="timezone-container">


        <div className="dropdown-container"> {/* Add this wrapper */}
          <button onClick={toggleEditMode}>Edit</button>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}  role="plus" className="add-timezone-button">+</button>
          {dropdownOpen && (
            <>
              <input
                type="text"
                placeholder="Search timezones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="timezone-search"
              />
              <ul className="timezone-dropdown" role="timezone">
                {console.log(filteredTimezones)}
                {filteredTimezones.map((timezone) => (
                  <li key={timezone} onClick={(e) => handleTimezoneClick(e, timezone)}>
                    {timezone}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="timezone-block">
          {selectedTimezones.map((timezone) => (
            <div key={timezone.id} className="timezone-block" data-testid="timezone">
              <span className="timezone-name">{timezone}:</span>
              <span className="timezone-time">{formatTime(timezone)}</span>
              {isEditMode && (
                <button className="delete-timezone-button" onClick={() => deleteTimezone(timezone)}>
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimezoneDisplay;