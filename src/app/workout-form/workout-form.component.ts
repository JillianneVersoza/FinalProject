import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkoutService } from '../workout.service';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workout-form.component.html',
  styleUrl: './workout-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutFormComponent implements OnInit {

  private formBuilder = inject(FormBuilder);
  private workoutService = inject(WorkoutService);

  workoutForm = this.formBuilder.nonNullable.group({
    exerciseName: ['', Validators.required],
    category: ['', Validators.required],
    sets: [1, [Validators.required, Validators.min(1)]],
    reps: [1, [Validators.required, Validators.min(1)]],
    weight: [0, [Validators.required, Validators.min(0)]],
    duration: [1, [Validators.required, Validators.min(1)]],
    calories: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.workoutService.fetchWorkouts();
  }

  onSubmit(): void {
    if (this.workoutForm.invalid) return;

    const data = this.workoutForm.getRawValue();

    this.workoutService.saveWorkout(data).subscribe({
      next: () => {
        this.workoutService.fetchWorkouts();
        this.workoutForm.reset({
          exerciseName: '',
          category: '',
          sets: 1,
          reps: 1,
          weight: 0,
          duration: 1,
          calories: 0
        });
      },
      error: (err) => console.error(err)
    });
  }
}