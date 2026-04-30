import { Component, OnInit, inject, signal, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { WorkoutService, Workout } from '../services/workout';

@Component({
    selector: 'app-workout-form',
    standalone: true,
    imports: [ReactiveFormsModule , FormsModule],
    templateUrl: './workout-form.html',
    styleUrls: ['./workout-form.css']
})
export class WorkoutFormComponent implements OnInit {
    viewMode = input<string>('workouts');

    workoutForm!: FormGroup;
    editingWorkout = signal<Workout | null>(null);
    successMessage = signal<string | null>(null);
    searchQuery = signal<string>('');
    showResults = signal<boolean>(false);
    editingId = signal<string | null>(null);

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
            date: [new Date().toISOString().split('T')[0]],
            notes: ['']
        });

        this.workoutForm.get('duration')?.valueChanges.subscribe(() => this.calculateCalories());
        this.workoutForm.get('category')?.valueChanges.subscribe(() => this.calculateCalories());

        const editing = this.workoutService.editingWorkout();
        if (editing && editing._id) {
            this.editingWorkout.set(editing);
            this.editingId.set(editing._id);

        }

        this.workoutService.fetchWorkouts();
    }

    searchExercise(): void {
        const query = this.searchQuery().trim();
        if (!query) return;

        this.showResults.set(true);
        this.workoutService.searchExercises(query).subscribe({
            next: (data) => {
                this.workoutService.exerciseResults.set(data || []);
            }
        });
    }

    selectExercise(exercise: any): void {
        this.workoutForm.patchValue({
            exerciseName: exercise.name,
            category: exercise.type || 'strength'
        });
        this.showResults.set(false);
        this.searchQuery.set('');
        this.workoutService.exerciseResults.set([]);
    }

    startEdit(workout: Workout): void {
        if (!workout._id) return;
        this.editingWorkout.set(workout);
        this.editingId.set(workout._id);

    }

    deleteWorkout(id: string): void {
        if (!confirm('Are you sure you want to delete this workout?')) return;

        this.workoutService.deleteWorkout(id).subscribe({
            next: () => {
                this.showMessage('Workout deleted!');
                this.workoutService.fetchWorkouts();
            }
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

    cancelEdit(): void {
        this.editingWorkout.set(null);
        this.editingId.set(null);
        this.workoutService.editingWorkout.set(null);
        this.workoutForm.reset({
            exerciseName: '',
            category: 'strength',
            sets: 3,
            reps: 10,
            weight: 0,
            duration: 30,
            caloriesBurned: 0,
            date: new Date().toISOString().split('T')[0],
            notes: ''
        });
    }

    onSubmit(): void {
        if (this.workoutForm.invalid) {
            return;
        }

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
                    this.showMessage('Workout logged!');
                    this.workoutService.fetchWorkouts();
                    this.workoutForm.reset({
                        exerciseName: '',
                        category: 'strength',
                        sets: 3,
                        reps: 10,
                        weight: 0,
                        duration: 30,
                        caloriesBurned: 0,
                        date: new Date().toISOString().split('T')[0],
                        notes: ''
                    });
                }
            });
        }
    }

    getCategoryColor(category: string): string {
        const colors: { [key: string]: string } = {
            'strength': '#ef4444',
            'cardio': '#3b82f6',
            'flexibility': '#10b981',
            'hiit': '#f59e0b',
            'other': '#8b5cf6'
        };
        return colors[category] || '#6b7280';
    }

    private showMessage(message: string): void {
        this.successMessage.set(message);
        setTimeout(() => {
            this.successMessage.set(null);
        }, 3000);
    }
}