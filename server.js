require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Debug: Check if API key is loaded
console.log('API Key loaded:', process.env.EXERCISE_API_KEY ? 'YES' : 'NO');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB error:', err));

// START SERVER 
app.listen(3000, () => {
    console.log("Server is running on port 3000!");
});

// this is a workout schema 
const workoutSchema = new mongoose.Schema({
    exerciseName: String,
    category: String,
    sets: Number,
    reps: Number,
    weight: Number,
    duration: Number,
    caloriesBurned: Number,
    date: { type: Date, default: Date.now },
    notes: String
});

const Workout = mongoose.model('Workout', workoutSchema);

// This is the CRUD ROUTES

// CREATE - Add workout
app.post('/api/workouts', async (req, res) => {
    try {
        const workout = new Workout(req.body);
        await workout.save();
        res.status(201).json(workout);
        console.log("Added new workout:", workout.exerciseName);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// READ - Get all workouts
app.get('/api/workouts', async (req, res) => {
    try {
        const workouts = await Workout.find().sort({ date: -1 });
        res.json(workouts);
        console.log("Fetched", workouts.length, "workouts");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE - Update workout
app.put('/api/workouts/:id', async (req, res) => {
    try {
        const updatedWorkout = await Workout.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedWorkout);
        console.log("Updated workout:", updatedWorkout?.exerciseName);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Delete workout
app.delete('/api/workouts/:id', async (req, res) => {
    try {
        await Workout.findByIdAndDelete(req.params.id);
        res.status(204).send();
        console.log("Deleted workout ID:", req.params.id);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// This is API NINJAS SEARCH 
app.get('/api/exercises/search', async (req, res) => {
    const query = req.query.name;

    if (!query) {
        return res.status(400).json({ error: 'Exercise name is required' });
    }

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(
            `https://api.api-ninjas.com/v1/exercises?name=${query}`,
            {
                headers: {
                    'X-Api-Key': process.env.EXERCISE_API_KEY
                }
            }
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

