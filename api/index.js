
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";
import fetch from 'node-fetch';

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const app = express();

app.use(express.json());



app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

// add your endpoints below this line



app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        auth0Id,
        name,
      },
    });

    res.json(newUser);
  }
});

app.get("/api/notes", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      include: {
        notes: true, // include the notes of the user
      },
    });

    if (!user) return res.status(404).send("User not found");

    res.json(user.notes); // return only the user's notes
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.post("/api/notes", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).send("Title and content fields required");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });
    if (!user) return res.status(404).send("User not found");

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: user.id,
      },
    });
    res.json(note);
  } catch (error) {
    res.status(500).send("Oops something went wrong");
  }
});

app.put("/api/notes/:id", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { title, content } = req.body;
  const id = parseInt(req.params.id);

  if (!title || !content) {
    return res.status(400).send("Title and content fields required");
  }

  try {
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) return res.status(404).send("Note not found");
    if (note.userId !== (await prisma.user.findUnique({ where: { auth0Id } })).id) {
      return res.status(403).send("Unauthorized access to the note");
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, content },
    });
    res.json(updatedNote);
  } catch (error) {
    res.status(500).send("Oops, something went wrong");
  }
});

app.delete("/api/notes/:id", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const id = parseInt(req.params.id);

  try {
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) return res.status(404).send("Note not found");
    if (note.userId !== (await prisma.user.findUnique({ where: { auth0Id } })).id) {
      return res.status(403).send("Unauthorized access to the note");
    }

    await prisma.note.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).send("Oops, something went wrong");
  }
});

app.post('/api/events', requireAuth,async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { title, location, description } = req.body;
  let eventDate;
  const user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  try {
    eventDate = new Date(req.body.date).toISOString();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        date: eventDate, // Now using the parsed and formatted date
        location,
        description,
        userId: user.id,
        
      },
    });
    res.json(event);
  } catch (error) {
    console.error("Failed to create event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// Get all events - Now open to all users, even unauthenticated ones
app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Update an event - Now open to all users, even unauthenticated ones
app.put('/api/events/:id', async (req, res) => {
  const { title, date, location, description } = req.body;
  const id = parseInt(req.params.id);

  let parsedDate;
  try {
    parsedDate = new Date(date).toISOString();
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { title, date: parsedDate, location, description },
    });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).send("Oops, something went wrong");
  }
});

// Delete an event - Now open to all users, even unauthenticated ones
app.delete('/api/events/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.event.delete({
      where: { id },
    });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).send("Oops, something went wrong");
  }
});

app.post('/api/user/timezones', requireAuth, async (req, res) => {
    const { timezone } = req.body;
    const { name } = req.body; 
    const auth0Id = req.auth.payload.sub;
  
    try {
      const user = await prisma.user.findUnique({ where: { auth0Id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const savedTimezone = await prisma.timezone.create({
        data: {
          ...req.body,
          userId: user.id
        }
      });
  
      return res.json(savedTimezone);
    } catch (error) {
     
      console.error('Failed to save timezone:', error);
      return res.status(500).json({ error: 'Failed to save timezone' });
    }
  });
  app.get('/api/user/timezones', requireAuth, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
  
    try {
      const user = await prisma.user.findUnique({ where: { auth0Id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const timezones = await prisma.timezone.findMany({
        where: {
          userId: user.id
        }
      });
  
      return res.json(timezones);
    } catch (error) {
      console.error('Failed to get timezones:', error);
      return res.status(500).json({ error: 'Failed to get timezones' });
    }
  });
  app.delete('/api/user/timezones/name/:name', requireAuth, async (req, res) => {
    const { name } = req.params; // Get the name from the URL
    const auth0Id = req.auth.payload.sub;
  
    try {
      // First, find the user to ensure the timezone belongs to the authenticated user
      const user = await prisma.user.findUnique({ where: { auth0Id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Delete the timezone by name and user ID
      const deleteResult = await prisma.timezone.deleteMany({
        where: {
          name: name,
          userId: user.id, // Ensure we're deleting only for the logged-in user
        },
      });
  
      if(deleteResult.count === 0){
        // No timezone found to delete
        return res.status(404).json({ message: 'Timezone not found or already deleted' });
      }
  
      // Successfully deleted
      res.json({ message: 'Timezone deleted successfully', deletedCount: deleteResult.count });
    } catch (error) {
      console.error('Failed to delete timezone:', error);
      return res.status(500).json({ error: 'Failed to delete timezone' });
    }
  });

app.get('/api/weather', requireAuth, async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.WEATHERAPI_API_KEY;
  const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;

  try {
    const weatherResponse = await fetch(weatherApiUrl);

    if (!weatherResponse.ok) {
      const errorBody = await weatherResponse.text(); // Try to read the error response
      console.error('Weather API responded with error:', errorBody);
      return res.status(weatherResponse.status).json({ message: "Error fetching weather data", details: errorBody });
    }

    const weatherData = await weatherResponse.json();
    res.json(weatherData);
  } catch (error) {
    console.error('Server error when calling Weather API:', error);
    res.status(500).json({ message: "Failed to fetch weather data", error: error.message });
  }
});



app.put("/users/", requireAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const auth0Id = req.auth.payload.sub;
    console.log(auth0Id)
    const user = await prisma.user.update({
      where: {
        auth0Id,
      },
      data: {
        email
      },
    });

    res.json(user);
  } catch (error) {
    res.json({ error: error.message })
  }
});
app.get('/api/user-profile', requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  try {
    const userProfile = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (userProfile) {
      res.json(userProfile);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});

