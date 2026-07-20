// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  constructor() {
    // Aplica el tema guardado al arrancar, sin importar la ruta de entrada/refresh.
    inject(ThemeService).applyToDom();
  }
}
