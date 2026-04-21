import { HttpClient } from '@angular/common/http';
import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Workout {
    _id?: string;
    exerciseName: string;
    category: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    caloriesBurned?: number;
    date?: Date;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class WorkoutService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/workouts';
    private exerciseApiUrl = 'http://localhost:3000/api/exercises/search';

    workoutList = signal<Workout[]>([]);
    exerciseResults = signal<any[]>([]);
    isLoading = signal<boolean>(false);

    fetchWorkouts(): void {
        this.isLoading.set(true);
        this.http.get<Workout[]>(this.apiUrl).subscribe({
            next: (data) => {
                this.workoutList.set(data);
                this.isLoading.set(false);
                console.log('Fetched workouts:', data.length);
            },
            error: (err) => {
                console.error('Error:', err);
                this.isLoading.set(false);
            }
        });
    }

    searchExercises(query: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.exerciseApiUrl}?name=${query}`);
    }

    saveWorkout(data: any): Observable<Workout> {
        return this.http.post<Workout>(this.apiUrl, data);
    }

    updateWorkout(id: string, data: any): Observable<Workout> {
        return this.http.put<Workout>(`${this.apiUrl}/${id}`, data);
    }

    deleteWorkout(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}