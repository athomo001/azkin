import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Contenedor de n skeletons que simulan tarjetas de monitor durante la carga -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (item of items(); track $index) {
        <div class="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-3 animate-pulse">
          <div class="flex justify-between items-center">
            <div class="h-4 bg-zinc-800 rounded-md w-2/3"></div>
            <div class="h-5 bg-zinc-800 rounded-full w-14"></div>
          </div>
          <div class="h-3 bg-zinc-800 rounded-md w-1/2"></div>
          <div class="h-3 bg-zinc-800 rounded-md w-3/4"></div>
          <div class="flex gap-2 mt-2">
            <div class="h-3 bg-zinc-800 rounded-md w-12"></div>
            <div class="h-3 bg-zinc-800 rounded-md w-16"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class SkeletonLoaderComponent {
  // Cantidad de tarjetas esqueleto a renderizar (por defecto 6 para llenar la grilla)
  readonly count = input<number>(6);
  readonly items = () => Array(this.count()).fill(null);
}
