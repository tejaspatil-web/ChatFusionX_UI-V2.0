import { CommonModule } from '@angular/common';
import {Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent implements OnInit {
  percentage = 0;
  isLoading = true;
  isCompleted = false;
  loadingMessage = 'loading...';
  private progressInterval: any;
  constructor() {}

  ngOnInit() {
    this.startLoading();
  }

  startLoading() {
    this.isLoading = true;
    this.percentage = 0;
    this.isCompleted = false;
    let progress = 0;
    this.progressInterval = setInterval(() => {
      if (progress >= 95) {
        clearInterval(this.progressInterval);
        return;
      }

      progress += 1;
      this.percentage = progress;

      if (progress === 3)
        this.loadingMessage = 'Server is waking up, please wait...';
      if (progress === 30)
        this.loadingMessage = 'Still loading... please wait.';
      if (progress === 60) this.loadingMessage = 'Almost done...';
      if (progress === 90) this.loadingMessage = 'Finalizing, just a moment...';
    }, 1500);
  }

  completeLoading() {
    clearInterval(this.progressInterval);
    this.percentage = 100;
    setTimeout(() => {
      this.loadingMessage = 'Completed';
      this.isLoading = false;
      this.isCompleted = true;
    }, 100);
  }
}
