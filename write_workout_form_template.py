from pathlib import Path

content = '''<div class="container">
    <div *ngIf="successMessage" class="success-message">{{ successMessage }}</div>

    <hr />

    <form [formGroup]="workoutForm" (ngSubmit)="onSubmit()">
        <h3>{{ editingWorkout ? 'Edit Workout' : 'Log New Workout' }}</h3>

        <div class="form-group">
            <label>Exercise Name *</label>
            <input type="text" formControlName="exerciseName" placeholder="e.g., Bench Press">
        </div>

        <div class="form-group">
            <label>Category</label>
            <select formControlName="category">
                <option value="cardio">Cardio</option>
                <option value="strength">Strength</option>
                <option value="flexibility">Flexibility</option>
                <option value="hiit">HIIT</option>
                <option value="other">Other</option>
            </select>
        </div>

        <div class="form-row">
            <div class="form-group"><label>Sets</label><input type="number" formControlName="sets"></div>
            <div class="form-group"><label>Reps</label><input type="number" formControlName="reps"></div>
            <div class="form-group"><label>Weight (lbs)</label><input type="number" formControlName="weight"></div>
            <div class="form-group"><label>Duration (min)</label><input type="number" formControlName="duration"></div>
        </div>

        <div class="form-group">
            <label>Calories Burned</label>
            <input type="number" formControlName="caloriesBurned" readonly>
        </div>

        <div class="form-group">
            <label>Notes</label>
            <textarea formControlName="notes" rows="2" placeholder="Add notes..."></textarea>
        </div>

        <div class="form-actions">
            <button type="submit" [disabled]="workoutForm.invalid" class="btn-primary">
                {{ editingWorkout ? 'Update Workout' : 'Log Workout' }}
            </button>
            <button type="button" *ngIf="editingWorkout" (click)="cancelEdit()" class="btn-secondary">Cancel</button>
        </div>
    </form>
</div>
'''
Path(r'c:/Users/Administrator/FinalProject/src/app/workout-form/workout-form.html').write_text(content, encoding='utf-8')
