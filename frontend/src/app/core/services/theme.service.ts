// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Injectable, signal } from '@angular/core';

/**
 * Estado y aplicación del tema claro/oscuro, centralizado para toda la app.
 * AZ-022: antes solo DashboardComponent aplicaba la clase 'light-theme' a <body>,
 * así que refrescar en /settings o /profile dejaba la UI en oscuro pese a que
 * localStorage decía 'light'. Ahora se aplica desde el componente raíz (app.ts),
 * sin importar la ruta de entrada.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isLightTheme = signal(
    typeof window !== 'undefined' && localStorage.getItem('azkin-theme') === 'light'
  );

  /** Sincroniza la clase 'light-theme' de <body> con el signal actual. Idempotente. */
  applyToDom(): void {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('light-theme', this.isLightTheme());
  }

  /**
   * Alterna el tema y lo persiste. Si se pasa el MouseEvent del click y el navegador
   * soporta View Transitions API, anima un círculo que crece desde el cursor.
   */
  toggle(event?: MouseEvent): void {
    const doc = document as any;
    const isLight = !this.isLightTheme();
    localStorage.setItem('azkin-theme', isLight ? 'light' : 'dark');

    const apply = () => {
      this.isLightTheme.set(isLight);
      this.applyToDom();
    };

    if (!event || !doc.startViewTransition) {
      apply();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => apply());

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 450,
          easing: 'ease-out',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  }
}
