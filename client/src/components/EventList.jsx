import React, { useEffect, useState } from 'react';

const EventList = ({ onSelectEvent, isAuthenticated }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events`, {method: "GET"});
        if (!response.ok) throw new Error('Error fetching events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="list-events">
      <div className="list-events"><h2>Here is a list of your events:</h2></div>
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-item">
              <div className="event-header">
              
              </div>
              
              <h2>{event.title}</h2>
              <p>{event.date}</p>
              <p>{event.location}</p>
              <p>{event.description}</p>
            </div>
          ))}
        </div>
    </div>
  );
};

export default EventList;
