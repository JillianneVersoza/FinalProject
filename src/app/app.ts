import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutFormComponent } from './workout-form/workout-form';
import { WorkoutService, Workout } from './services/workout';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, FormsModule, WorkoutFormComponent, DatePipe],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App implements OnInit {
    workoutService = inject(WorkoutService);
    currentPage = signal<'workouts' | 'history' | 'about'>('workouts');
    selectedWorkout = signal<Workout | null>(null);

    // Inline edit properties
    isEditing = signal<boolean>(false);
    editForm = {
        exerciseName: '',
        category: '',
        sets: 0,
        reps: 0,
        weight: 0,
        duration: 0,
        notes: ''
    };

    ngOnInit(): void {
        this.workoutService.fetchWorkouts();
    }

    selectSection(section: 'workouts' | 'history' | 'about'): void {
        this.currentPage.set(section);
        if (section !== 'history') {
            this.selectedWorkout.set(null);
            this.isEditing.set(false);
        }
    }

    selectWorkout(workout: Workout): void {
        this.selectedWorkout.set(workout);
        this.currentPage.set('history');
        this.isEditing.set(false);
    }

    deleteSelectedWorkout(): void {
        const workout = this.selectedWorkout();
        if (!workout?._id) return;

        if (!confirm('Are you sure you want to delete this workout?')) return;

        this.workoutService.deleteWorkout(workout._id).subscribe({
            next: () => {
                this.workoutService.fetchWorkouts();
                this.selectedWorkout.set(null);
            },
            error: (err) => console.error(err)
        });
    }

    // Inline edit functions
    startInlineEdit(): void {
        const workout = this.selectedWorkout();
        if (!workout) return;

        this.editForm = {
            exerciseName: workout.exerciseName,
            category: workout.category,
            sets: workout.sets || 0,
            reps: workout.reps || 0,
            weight: workout.weight || 0,
            duration: workout.duration || 0,
            notes: workout.notes || ''
        };
        this.isEditing.set(true);
    }

    saveInlineEdit(): void {
        const workout = this.selectedWorkout();
        if (!workout?._id) return;

        // Calculate calories
        let caloriesPerMinute = 5;
        if (this.editForm.category === 'cardio') {
            caloriesPerMinute = 8;
        } else if (this.editForm.category === 'strength') {
            caloriesPerMinute = 6;
        } else if (this.editForm.category === 'hiit') {
            caloriesPerMinute = 10;
        } else if (this.editForm.category === 'flexibility') {
            caloriesPerMinute = 3;
        }

        const updatedWorkout = {
            ...this.editForm,
            caloriesBurned: Math.round(this.editForm.duration * caloriesPerMinute)
        };

        this.workoutService.updateWorkout(workout._id, updatedWorkout).subscribe({
            next: () => {
                this.workoutService.fetchWorkouts();
                this.isEditing.set(false);
                // Update selected workout with new data
                this.selectedWorkout.set({ ...workout, ...updatedWorkout });
                alert('Workout updated!');
            },
            error: (err) => console.error('Update failed:', err)
        });
    }

    cancelInlineEdit(): void {
        this.isEditing.set(false);
    }

    // Getters for summary stats and section headings
    get totalWorkouts(): number {
        return this.workoutService.workoutList().length;
    }

    get totalCaloriesBurned(): number {
        return this.workoutService.workoutList()
            .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    }

    get totalDuration(): number {
        return this.workoutService.workoutList()
            .reduce((sum, w) => sum + (w.duration || 0), 0);
    }

    get sectionHeading(): string {
        const page = this.currentPage();
        if (page === 'workouts') return 'Log a Workout';
        if (page === 'history') return 'Workout History';
        if (page === 'about') return 'About';
        return 'FitTrack';
    }

    get sectionSubtitle(): string {
        const page = this.currentPage();
        if (page === 'workouts') return 'Use the form below to save your exercise session.';
        if (page === 'history') return 'Select a workout from the sidebar to view or edit details.';
        if (page === 'about') return 'Read about the app and the development team.';
        return 'Track workouts, review history, and stay motivated.';
    }
}