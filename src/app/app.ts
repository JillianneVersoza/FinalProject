import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutFormComponent } from './workout-form/workout-form';
import { WorkoutService, Workout } from './services/workout';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, FormsModule, WorkoutFormComponent],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App implements OnInit {
    title = 'FitTrack - Workout Tracker';
    workoutService = inject(WorkoutService);
    currentPage = signal<'home' | 'workouts' | 'history' | 'about'>('home');
    selectedWorkout = signal<Workout | null>(null);
    searchResults = signal<any[]>([]);
    isSearching = signal(false);
    errorMessage = signal<string | null>(null);
    searchQuery = '';

    ngOnInit(): void {
        this.workoutService.fetchWorkouts();
    }

    selectSection(section: 'home' | 'workouts' | 'history' | 'about'): void {
        this.currentPage.set(section);
        if (section !== 'history') {
            this.selectedWorkout.set(null);
        }
        if (section !== 'home') {
            this.searchResults.set([]);
            this.errorMessage.set(null);
        }
    }

    selectWorkout(workout: Workout): void {
        this.selectedWorkout.set(workout);
        this.currentPage.set('history');
    }

    editSelectedWorkout(): void {
        const workout = this.selectedWorkout();
        if (!workout) {
            return;
        }
        this.workoutService.editingWorkout.set(workout);
        this.currentPage.set('workouts');
    }

    deleteSelectedWorkout(): void {
        const workout = this.selectedWorkout();
        if (!workout?._id) {
            return;
        }
        if (!confirm('Are you sure you want to delete this workout?')) {
            return;
        }
        this.workoutService.deleteWorkout(workout._id).subscribe({
            next: () => {
                this.workoutService.fetchWorkouts();
                this.selectedWorkout.set(null);
            },
            error: (err) => {
                console.error(err);
                alert('Could not delete workout.');
            }
        });
    }

    searchHomeExercises(query: string): void {
        this.searchQuery = query;
        const trimmed = query.trim();
        if (!trimmed) {
            this.searchResults.set([]);
            return;
        }
        this.isSearching.set(true);
        this.errorMessage.set(null);

        this.workoutService.searchExercises(trimmed).subscribe({
            next: (data) => {
                this.searchResults.set(data || []);
                this.isSearching.set(false);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set('Search error. Make sure the backend is running.');
                this.isSearching.set(false);
            }
        });
    }

    get sectionHeading(): string {
        const page = this.currentPage();
        if (page === 'home') {
            return 'Search Exercises from API Ninjas';
        }
        if (page === 'workouts') {
            return 'Log a Workout';
        }
        if (page === 'history') {
            return 'Workout History';
        }
        if (page === 'about') {
            return 'About';
        }
        return 'FitTrack';
    }

    get sectionSubtitle(): string {
        const page = this.currentPage();
        if (page === 'home') {
            return 'Search exercises from API Ninjas to find your next workout.';
        }
        if (page === 'workouts') {
            return 'Use the form below to save your exercise session.';
        }
        if (page === 'history') {
            return 'Choose a workout from the sidebar to view full details here.';
        }
        if (page === 'about') {
            return 'Read about the app and the development team.';
        }
        return 'Track workouts, review history, and stay motivated.';
    }
}