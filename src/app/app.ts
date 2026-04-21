import { Component } from '@angular/core';
import { WorkoutFormComponent } from './workout-form/workout-form';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [WorkoutFormComponent],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App {
    title = 'FitTrack - Workout Tracker';
}