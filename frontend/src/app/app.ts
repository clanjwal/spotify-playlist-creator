import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackendService } from './services/backend.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  message = '';
  constructor(private backendService: BackendService) {}

  ngOnInit() {
    this.backendService.getHello().subscribe(response => {
      this.message = response;
    });
  }
}
