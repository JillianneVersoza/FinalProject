const mongoose = require('mongoose');

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

module.exports = mongoose.model('Workout', workoutSchema);