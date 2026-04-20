import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class WorkoutService {

  private apiUrl = 'http://localhost:3000/workouts';

  constructor(private http: HttpClient) {}

  fetchWorkouts() {
    return this.http.get(this.apiUrl);
  }

  saveWorkout(workout: any) {
    return this.http.post(this.apiUrl, workout);
  }

  updateWorkout(id: string, workout: any) {
    return this.http.put(${this.apiUrl}/${id}, workout);
  }

  deleteWorkout(id: string) {
    return this.http.delete(${this.apiUrl}/${id});
  }

  searchExercises(query: string) {
    return this.http.get(`http://localhost:3000/api/exercises/search?name=${query}`);
  }
}