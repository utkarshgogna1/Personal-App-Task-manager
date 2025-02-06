import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthToken } from "../AuthTokenContext";
import './Event.css';
const Event = () => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [events, setEvents] = useState([]);
  const [submitStatus, setSubmitStatus] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { accessToken } = useAuthToken();
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events`,{
        method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    }});

      if (!response.ok) throw new Error('Error fetching events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error:', error);
      setEvents([]);
      setSubmitStatus('Failed to fetch events. Please try again.');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventDate(event.date);
    setEventLocation(event.location);
    setEventDescription(event.description);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: eventTitle,
          date: eventDate,
          location: eventLocation,
          description: eventDescription,
        }),
      });

      if (!response.ok) throw new Error('Error adding event');

      const newEvent = await response.json();
      setEvents([newEvent, ...events]);
      setEventTitle('');
      setEventDate('');
      setEventLocation('');
      setEventDescription('');
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('Failed to add event. Please try again.');
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    if (!selectedEvent) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: eventTitle,
          date: eventDate,
          location: eventLocation,
          description: eventDescription,
        }),
      });

      if (!response.ok) throw new Error('Error updating event');

      const updatedEvent = await response.json();
      const updatedEventsList = events.map((event) =>
        event.id === selectedEvent.id ? updatedEvent : event
      );

      setEvents(updatedEventsList);
      setEventTitle('');
      setEventDate('');
      setEventLocation('');
      setEventDescription('');
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('Failed to update event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error('Error deleting event');

      const updatedEvents = events.filter((event) => event.id !== eventId);
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('Failed to delete event. Please try again.');
    }
  };

  const handleCancelEvent = () => {
    setEventTitle('');
    setEventDate('');
    setEventLocation('');
    setEventDescription('');
    setSelectedEvent(null);
  };

  return (
  <div>
    <AppLayout />
    <div className="container">
      
      <h1>Here is your Events App</h1>
      <form onSubmit={(event) => (selectedEvent ? handleUpdateEvent(event) : handleAddEvent(event))}>

        <div className="form-group">
          <label className="label" htmlFor="eventTitle">Event Title</label>
          <input
            className="input"
            type="text"
            id="eventTitle"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Event Title"
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="eventDate">Event Date</label>
          <input
            className="input"
            type="datetime-local"
            id="eventDate"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="eventLocation">Location</label>
          <input
            className="input"
            type="text"
            id="eventLocation"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="Location"
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="eventDescription">Description</label>
          <textarea
            className="textarea"
            id="eventDescription"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Description"
          />
        </div>

        {selectedEvent ? (
          <div className="edit-buttons">
            <button className="button" type="submit">Save</button>
            <button className="button" onClick={handleCancelEvent}>Cancel</button>
          </div>
        ) : (
          <button className="button" type="submit">Add Event</button>
        )}
      </form>

      {submitStatus && <div>{submitStatus}</div>}

      <h2>Here is a list of your events:</h2>
      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <div className="event-header">
              <button onClick={() => handleDeleteEvent(event.id)}>x</button>
            </div>
            <h3>{event.title}</h3>
            <p>{new Date(event.date).toLocaleString()}</p>
            <p>{event.location}</p>
            <p>{event.description}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};


export default Event;