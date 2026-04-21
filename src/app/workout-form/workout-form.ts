import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkoutService, Workout } from '../services/workout';


@Component({
    selector: 'app-workout-form',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, FormsModule],
    templateUrl: './workout-form.html',
    styleUrls: ['./workout-form.css']
})
export class WorkoutFormComponent implements OnInit {
    workoutForm!: FormGroup;
    editingId = signal<string | null>(null);
    successMessage = signal<string | null>(null);
    
    searchQuery = '';
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
    
    calculateCalories(): void {
        const duration = this.workoutForm.get('duration')?.value || 0;
        const category = this.workoutForm.get('category')?.value;
        
        let caloriesPerMinute = 5;
        switch(category) {
            case 'cardio': caloriesPerMinute = 8; break;
            case 'strength': caloriesPerMinute = 6; break;
            case 'hiit': caloriesPerMinute = 10; break;
            case 'flexibility': caloriesPerMinute = 3; break;
            default: caloriesPerMinute = 5;
        }
        
        const estimatedCalories = Math.round(duration * caloriesPerMinute);
        this.workoutForm.patchValue({ caloriesBurned: estimatedCalories }, { emitEvent: false });
    }
    
    searchExercise(): void {
        if (!this.searchQuery.trim()) return;
        
        this.workoutService.searchExercises(this.searchQuery).subscribe({
            next: (data) => {
                this.workoutService.exerciseResults.set(data);
                this.showResults.set(true);
            },
            error: (err) => {
                console.error('Search error:', err);
                alert('Error searching exercises. Make sure backend is running.');
            }
        });
    }
    
    selectExercise(exercise: any): void {
        this.workoutForm.patchValue({
            exerciseName: exercise.name,
            category: exercise.type || 'strength',
            notes: exercise.instructions || ''
        });
        this.showResults.set(false);
        this.searchQuery = '';
    }
    
    deleteWorkout(id: string): void {
        if (confirm('Are you sure you want to delete this workout?')) {
            this.workoutService.deleteWorkout(id).subscribe({
                next: () => {
                    this.showMessage('Workout deleted!');
                    this.workoutService.fetchWorkouts();
                }
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
    
    onSubmit(): void {
        if (this.workoutForm.invalid) return;
        
        const data = this.workoutForm.getRawValue();
        const id = this.editingId();
        
        if (id) {
            this.workoutService.updateWorkout(id, data).subscribe({
                next: () => {
                    this.showMessage('Workout updated!');
                    this.workoutService.fetchWorkouts();
                    this.cancelEdit();
                }
            });
        } else {
            this.workoutService.saveWorkout(data).subscribe({
                next: () => {
                    this.showMessage('Workout logged! ');
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
                }
            });
        }
    }
    
    private showMessage(message: string): void {
        this.successMessage.set(message);
        setTimeout(() => this.successMessage.set(null), 3000);
    }
    

    }
