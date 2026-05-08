import { Component, OnInit, inject, signal, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkoutService, Workout } from '../services/workout';

@Component({
    selector: 'app-workout-form',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, CommonModule],
    templateUrl: './workout-form.html',
    styleUrls: ['./workout-form.css']
})
export class WorkoutFormComponent implements OnInit {
    viewMode = input<string>('workouts');

    workoutForm!: FormGroup;
    editingId = signal<string | null>(null);
    successMessage = signal<string | null>(null);
    searchQuery: string = '';
    showResults = signal<boolean>(false);

    private formBuilder = inject(FormBuilder);
    workoutService = inject(WorkoutService);

    ngOnInit(): void {
        this.workoutForm = this.formBuilder.group({
            exerciseName: ['', Validators.required],
            category: ['strength'],
            sets: [3],
            reps: [10],
            weight: [0],
            duration: [30, Validators.required],
            caloriesBurned: [0],
            notes: ['']
        });

        this.workoutForm.get('duration')?.valueChanges.subscribe(() => this.calculateCalories());
        this.workoutForm.get('category')?.valueChanges.subscribe(() => this.calculateCalories());

        this.workoutService.fetchWorkouts();
    }

    // ============ API SEARCH ============
    searchExercise(): void {
        const query = this.searchQuery.trim();
        console.log('1. Search clicked. Query:', query);
        
        if (!query) {
            alert('Please enter an exercise name');
            return;
        }

        console.log('2. Calling API...');
        this.workoutService.searchExercises(query).subscribe({
            next: (data) => {
                console.log('3. API Response:', data);
                this.workoutService.exerciseResults.set(data || []);
                this.showResults.set(true);
                
                if (!data || data.length === 0) {
                    alert('No exercises found. Try "pushup" or "squat"');
                }
            },
            error: (err) => {
                console.error('4. API Error:', err);
                alert('Error: Make sure backend is running on port 3000');
            }
        });
    }

    selectExercise(exercise: any): void {
        console.log('Selected exercise:', exercise);
        this.workoutForm.patchValue({
            exerciseName: exercise.name,
            category: exercise.type || 'strength'
        });
        this.showResults.set(false);
        this.searchQuery = '';
        this.workoutService.exerciseResults.set([]);
    }

    // ============ CRUD OPERATIONS ============
    deleteWorkout(id: string): void {
        if (confirm('Are you sure you want to delete this workout?')) {
            this.workoutService.deleteWorkout(id).subscribe({
                next: () => {
                    this.showMessage('Workout deleted!');
                    this.workoutService.fetchWorkouts();
                },
                error: (err) => console.error('Delete failed:', err)
            });
        }
    }

    startEdit(workout: Workout): void {
        this.editingId.set(workout._id!);
        this.workoutForm.patchValue(workout);
    }

    cancelEdit(): void {
        this.editingId.set(null);
        this.workoutForm.reset({
            exerciseName: '',
            category: 'strength',
            sets: 3,
            reps: 10,
            weight: 0,
            duration: 30,
            caloriesBurned: 0,
            notes: ''
        });
    }

    calculateCalories(): void {
        const duration = this.workoutForm.get('duration')?.value || 0;
        const category = this.workoutForm.get('category')?.value;

        let caloriesPerMinute = 5;
        if (category === 'cardio') {
            caloriesPerMinute = 8;
        } else if (category === 'strength') {
            caloriesPerMinute = 6;
        } else if (category === 'hiit') {
            caloriesPerMinute = 10;
        } else if (category === 'flexibility') {
            caloriesPerMinute = 3;
        }

        const estimatedCalories = Math.round(duration * caloriesPerMinute);
        this.workoutForm.patchValue({ caloriesBurned: estimatedCalories }, { emitEvent: false });
    }

    onSubmit(): void {
    console.log('Submit clicked');  // Add this debug
    if (this.workoutForm.invalid) {
        console.log('Form is invalid', this.workoutForm.errors);
        return;
    }
    
    const data = this.workoutForm.getRawValue();
    console.log('Data to save:', data);
    const id = this.editingId();
    
    if (id) {
        this.workoutService.updateWorkout(id, data).subscribe({
            next: () => {
                this.showMessage('Workout updated!');
                this.workoutService.fetchWorkouts();
                this.cancelEdit();
            },
            error: (err) => console.error('Update failed:', err)
        });
    } else {
        this.workoutService.saveWorkout(data).subscribe({
            next: () => {
                this.showMessage('Workout logged! 💪');
                this.workoutService.fetchWorkouts();
                this.workoutForm.reset({
                    exerciseName: '',
                    category: 'strength',
                    sets: 3,
                    reps: 10,
                    weight: 0,
                    duration: 30,
                    caloriesBurned: 0,
                    notes: ''
                });
            },
            error: (err) => console.error('Save failed:', err)
        });
    }
}

    private showMessage(message: string): void {
        this.successMessage.set(message);
        setTimeout(() => {
            this.successMessage.set(null);
        }, 3000);
    }
}