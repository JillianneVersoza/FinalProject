require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

app.listen(3000, () => {
    console.log("Server is running on port 3000!");
});

const Workout = require('./models/workout');

// CREATE - Add workout
app.post('/api/workouts', async (req, res) => {
    const workout = new Workout(req.body);
    await workout.save();
    res.send(workout);
    console.log("Added new workout: ", workout);
});

// READ - Get all workouts
app.get('/api/workouts', async (req, res) => {
    const workouts = await Workout.find().sort({ date: -1 });
    res.send(workouts);
    console.log("Fetched All Workouts!");
});

// UPDATE - Update workout
app.put('/api/workouts/:id', async (req, res) => {
    const updatedWorkout = await Workout.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true }
    );
    res.send(updatedWorkout);
});

// DELETE - Delete workout
app.delete('/api/workouts/:id', async (req, res) => {
    await Workout.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// ============ API NINJAS INTEGRATION ============
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
        console.error('API Ninjas Error:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});