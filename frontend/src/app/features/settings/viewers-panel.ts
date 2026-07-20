// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService, IViewer, IViewerPermission, IAdmin } from '../../core/services/user.service';
import { MonitorService } from '../../core/services/monitor.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';
import { ChangePasswordModalComponent } from '../../shared/components/change-password-modal';

/** Pestaña "Viewers": gestión de cuentas Viewer y de otros Administradores. Extraido de settings.ts. */
@Component({
  selector: 'app-viewers-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ChangePasswordModalComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Formulario de Viewer -->
      <div class="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg h-fit">
        <div class="p-6 space-y-4">
          <div>
            <h3 class="text-sm font-bold text-white tracking-tight">{{ isEditingViewer() ? lang.t('settings.viewers.editTitle') : lang.t('settings.viewers.createTitle') }}</h3>
            <p class="text-[11px] text-zinc-500 mt-0.5 font-medium">{{ lang.t('settings.viewers.desc') }}</p>
          </div>

          <div class="space-y-4 pt-2">
            @if (!isEditingViewer()) {
              <div>
                <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.viewers.username') }}</label>
                <input type="text" [(ngModel)]="viewerForm.username" placeholder="Ej. tv_operaciones" required
                  class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.viewers.email') }}</label>
                <input type="email" [(ngModel)]="viewerForm.email" placeholder="viewer@empresa.com"
                  class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{{ lang.t('settings.viewers.password') }}</label>
                <input type="password" [(ngModel)]="viewerForm.password" [placeholder]="lang.t('settings.viewers.minChars')"
                  class="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
              </div>

              <div class="flex items-center gap-2 bg-zinc-950/60 p-3 rounded-lg border border-orange-900/40">
                <input type="checkbox" [(ngModel)]="viewerForm.asAdmin" id="asAdmin" class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                <label for="asAdmin" class="text-[11px] text-orange-400 font-semibold cursor-pointer">Crear como Administrador (acceso total, sin permisos granulares)</label>
              </div>
            }

            @if (!viewerForm.asAdmin) {
              <div class="flex items-center gap-2 bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
                <input type="checkbox" [(ngModel)]="viewerForm.isTvSessionEnabled" id="isTvSessionEnabled" class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                <label for="isTvSessionEnabled" class="text-[11px] text-zinc-300 font-semibold cursor-pointer">{{ lang.t('settings.viewers.extSession') }}</label>
              </div>
            }

            <!-- Permisos Granulares -->
            @if (!viewerForm.asAdmin) {
            <div class="space-y-3 border-t border-zinc-850 pt-4">
              <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{{ lang.t('settings.viewers.granularPerms') }}</span>

              <label class="flex items-center gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850 cursor-pointer">
                <input type="checkbox" [checked]="isAllSelected()" (change)="setAllSelected($any($event.target).checked)"
                  class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                <span class="text-[11px] text-zinc-200 font-semibold">{{ lang.t('settings.viewers.viewAll') }}</span>
              </label>

              @if (!isAllSelected()) {
                <div class="space-y-2 animate-fade-in">
                  <div>
                    <span class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{{ lang.t('settings.viewers.viewGroup') }}</span>
                    @if (uniqueGroups().length === 0) {
                      <p class="text-[10px] text-zinc-600">No hay grupos de monitores definidos.</p>
                    }
                    <div class="space-y-1 max-h-28 overflow-y-auto pr-1">
                      @for (g of uniqueGroups(); track g) {
                        <label class="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
                          <input type="checkbox" [checked]="isGroupChecked(g)" (change)="toggleGroup(g)"
                            class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                          <span class="text-[11px] text-zinc-300 font-mono">{{ g }}</span>
                        </label>
                      }
                    </div>
                  </div>
                  <div>
                    <span class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{{ lang.t('settings.viewers.viewMonitor') }}</span>
                    @if (monitorService.monitors().length === 0) {
                      <p class="text-[10px] text-zinc-600">No hay monitores creados todavía.</p>
                    }
                    <div class="space-y-1 max-h-28 overflow-y-auto pr-1">
                      @for (m of monitorService.monitors(); track m.id) {
                        <label class="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
                          <input type="checkbox" [checked]="isMonitorChecked(m.id)" (change)="toggleMonitor(m.id)"
                            class="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-0">
                          <span class="text-[11px] text-zinc-300">{{ m.name }}</span>
                        </label>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- Resumen de lo que se guardará -->
              <div class="space-y-1.5 mt-2 max-h-24 overflow-y-auto pr-1 border-t border-zinc-850 pt-2">
                @if (viewerForm.permissions.length === 0) {
                  <p class="text-[10px] text-rose-400">Sin permisos seleccionados — este viewer no verá ningún monitor.</p>
                }
                @for (p of viewerForm.permissions; track $index) {
                  <div class="flex items-center justify-between bg-zinc-950/80 border border-zinc-850 px-3 py-2 rounded-lg text-[10px] animate-fade-in">
                    <div class="flex items-center gap-2">
                      <span class="text-orange-500 uppercase tracking-widest text-[8px] font-black bg-orange-500/10 px-1 py-0.5 rounded">{{ p.type }}</span>
                      <span class="text-zinc-300 font-mono font-semibold">{{ p.type === 'monitor' ? monitorNameById(p.value) : (p.value || 'Todo') }}</span>
                    </div>
                    <button (click)="removeTempPermission($index)" class="text-rose-500 hover:text-rose-400 font-bold">{{ lang.t('settings.alerts.delete') }}</button>
                  </div>
                }
              </div>
            </div>
            }
          </div>
        </div>

        <div class="bg-zinc-950/60 px-6 py-4 border-t border-zinc-850 flex items-center justify-end gap-3">
          @if (isEditingViewer()) {
            <button (click)="resetViewerForm()" class="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">{{ lang.t('settings.viewers.cancel') }}</button>
          }
          <button (click)="onSaveViewer()" class="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold transition-all shadow-md">
            {{ isEditingViewer() ? lang.t('settings.viewers.updateBtn') : (viewerForm.asAdmin ? 'Crear Administrador' : lang.t('settings.viewers.createBtn')) }}
          </button>
        </div>
      </div>

      <!-- Listado de Viewers -->
      <div class="col-span-2 space-y-4">
        <!-- Administradores del sistema (sin aislamiento por tenant) -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Administradores</h3>
            <span class="text-[10px] text-zinc-500 font-mono font-bold">{{ userService.admins().length }} activos</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (a of userService.admins(); track a.id) {
              <div class="bg-zinc-900/20 border rounded-xl p-4 flex flex-col gap-3 transition-all"
                [class.border-zinc-850]="!a.isBlocked" [class.border-rose-900/50]="a.isBlocked">
                <div class="flex justify-between items-center gap-2">
                  <span class="text-xs font-black text-zinc-200 truncate" [title]="a.email">{{ a.email }}</span>
                  @if (a.isBlocked) {
                    <span class="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0">Bloqueado</span>
                  } @else {
                    <span class="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0">Admin</span>
                  }
                </div>
                <div class="flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px] font-bold">
                  <span class="text-zinc-600 font-mono text-[9px]">{{ a.id === authService.currentUser()?.userId ? 'Tu cuenta' : '' }}</span>
                  <div class="flex items-center space-x-3">
                    <button (click)="onEditAdmin(a)" class="text-zinc-400 hover:text-zinc-200 transition-colors">{{ lang.t('common.edit') }}</button>
                    <button (click)="onPromptResetAdminPassword(a)" class="text-orange-500 hover:text-orange-400 transition-colors">{{ lang.t('settings.viewers.key') }}</button>
                    @if (a.id !== authService.currentUser()?.userId) {
                      <button (click)="onToggleAdminBlocked(a)" class="text-amber-500 hover:text-amber-400 transition-colors">{{ a.isBlocked ? 'Desbloquear' : 'Bloquear' }}</button>
                      <button (click)="onDeleteAdmin(a)" class="text-rose-500 hover:text-rose-400 transition-colors">{{ lang.t('common.delete') }}</button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">{{ lang.t('settings.viewers.list') }}</h3>
          <span class="text-[10px] text-zinc-500 font-mono font-bold">{{ userService.viewers().length }} {{ lang.t('settings.viewers.active') }}</span>
        </div>

        @if (userService.viewers().length === 0) {
          <div class="text-center py-16 bg-zinc-900/10 border border-zinc-800/80 rounded-xl space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-zinc-600 mx-auto">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20.8c-2.113 0-4.047-.57-5.7-1.56v-.109A5.404 5.404 0 0 1 10 14.25c1.25 0 2.39.422 3.292 1.13M6.625 19.5a9.338 9.338 0 0 1-2.625-.372 5.405 5.405 0 0 1-4.017-5.105c0-1.518.81-2.885 2.13-3.645A3.001 3.001 0 0 1 7 7.5a3 3 0 0 1 2.875 2.128M15 11.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8.25 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
            <p class="text-zinc-500 text-xs font-medium">{{ lang.t('settings.viewers.noViewers') }}</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (v of userService.viewers(); track v.id) {
              <div class="bg-zinc-900/20 border border-zinc-850 hover:border-zinc-800 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all">
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-black text-zinc-200 truncate pr-2 w-36" [title]="v.email || v.username">{{ v.email || v.username }}</span>
                    <span class="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-mono uppercase font-bold">{{ v.role }}</span>
                  </div>

                  <div class="space-y-1">
                    <span class="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{{ lang.t('settings.viewers.permsLabel') }}</span>
                    <div class="flex flex-wrap gap-1 max-h-12 overflow-y-auto pr-1">
                      @if (v.permissions.length === 0) {
                        <span class="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-mono font-medium">
                          Sin permisos — no verá ningún monitor
                        </span>
                      }
                      @for (p of v.permissions; track $index) {
                        <span class="text-[9px] bg-zinc-950 border border-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-medium">
                          {{ p.type === 'all' ? lang.t('settings.viewers.viewAllShort') : (p.type + ': ' + p.value) }}
                        </span>
                      }
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px] font-bold">
                  <span class="text-zinc-500 font-mono text-[9px] flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full" [class.bg-emerald-500]="v.isTvSessionEnabled" [class.bg-zinc-700]="!v.isTvSessionEnabled"></span>
                    TV: {{ v.isTvSessionEnabled ? 'ON' : 'OFF' }}
                  </span>
                  <div class="flex items-center space-x-3">
                    <button (click)="onEditViewer(v)" class="text-zinc-400 hover:text-zinc-200 transition-colors">{{ lang.t('common.edit') }}</button>
                    <button (click)="onPromptChangeViewerPassword(v)" class="text-orange-500 hover:text-orange-400 transition-colors">{{ lang.t('settings.viewers.key') }}</button>
                    <button (click)="onDeleteViewer(v.id)" class="text-rose-500 hover:text-rose-400 transition-colors">{{ lang.t('common.delete') }}</button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Modal Editar Email de Administrador -->
    @if (showEditAdminModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="showEditAdminModal.set(false)"></div>
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 animate-fade-in space-y-4">
          <div>
            <h4 class="text-sm font-bold text-white font-black">Editar Administrador</h4>
            <p class="text-[10px] text-zinc-500">{{ adminEditTarget?.email }}</p>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Correo electrónico</label>
            <input type="email" [(ngModel)]="adminEditEmail" placeholder="admin@ejemplo.com"
              class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
          </div>
          <div class="flex gap-3 pt-2">
            <button (click)="showEditAdminModal.set(false)" class="flex-1 py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all text-zinc-300">{{ lang.t('common.cancel') }}</button>
            <button (click)="onConfirmEditAdmin()" class="flex-1 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold transition-all shadow-md">{{ lang.t('common.save') }}</button>
          </div>
        </div>
      </div>
    }

    <app-change-password-modal
      [open]="showAdminPasswordModal()"
      title="Restablecer contraseña"
      [subtitle]="adminPasswordTarget?.email ?? ''"
      [password]="adminNewPassword"
      (passwordChange)="adminNewPassword = $event"
      (cancel)="showAdminPasswordModal.set(false)"
      (save)="onConfirmResetAdminPassword()" />

    <app-change-password-modal
      [open]="showViewerPasswordModal()"
      [title]="lang.t('settings.viewers.changePass')"
      [subtitle]="viewerPasswordTarget?.email || viewerPasswordTarget?.username || ''"
      [password]="viewerNewPassword"
      (passwordChange)="viewerNewPassword = $event"
      (cancel)="showViewerPasswordModal.set(false)"
      (save)="onConfirmViewerPassword()" />
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
  `]
})
export class ViewersPanelComponent {
  private readonly http = inject(HttpClient);
  readonly userService = inject(UserService);
  readonly monitorService = inject(MonitorService);
  readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly isEditingViewer = signal(false);
  editingViewerId: string | null = null;
  viewerForm = this.getEmptyViewerForm();

  readonly showViewerPasswordModal = signal(false);
  viewerPasswordTarget: IViewer | null = null;
  viewerNewPassword = '';

  readonly showEditAdminModal = signal(false);
  adminEditTarget: IAdmin | null = null;
  adminEditEmail = '';

  readonly showAdminPasswordModal = signal(false);
  adminPasswordTarget: IAdmin | null = null;
  adminNewPassword = '';

  readonly uniqueGroups = computed(() => {
    const groups = this.monitorService.monitors()
      .map(m => m.group)
      .filter((g): g is string => !!g && g.trim().length > 0);
    return [...new Set(groups)];
  });

  constructor() {
    this.userService.loadViewers().subscribe();
    this.userService.loadAdmins().subscribe();
  }

  private showToastFeedback(msg: string): void {
    this.toast.show(msg);
  }

  private getEmptyViewerForm() {
    return {
      username: '',
      email: '',
      password: '',
      permissions: [] as IViewerPermission[],
      isTvSessionEnabled: false,
      asAdmin: false
    };
  }

  isAllSelected(): boolean {
    return this.viewerForm.permissions.some(p => p.type === 'all');
  }

  setAllSelected(checked: boolean): void {
    this.viewerForm.permissions = checked ? [{ type: 'all' }] : [];
  }

  isGroupChecked(group: string): boolean {
    return this.viewerForm.permissions.some(p => p.type === 'group' && p.value === group);
  }

  toggleGroup(group: string): void {
    if (this.isGroupChecked(group)) {
      this.viewerForm.permissions = this.viewerForm.permissions.filter(p => !(p.type === 'group' && p.value === group));
    } else {
      this.viewerForm.permissions = [...this.viewerForm.permissions, { type: 'group', value: group }];
    }
  }

  isMonitorChecked(monitorId: string): boolean {
    return this.viewerForm.permissions.some(p => p.type === 'monitor' && p.value === monitorId);
  }

  toggleMonitor(monitorId: string): void {
    if (this.isMonitorChecked(monitorId)) {
      this.viewerForm.permissions = this.viewerForm.permissions.filter(p => !(p.type === 'monitor' && p.value === monitorId));
    } else {
      this.viewerForm.permissions = [...this.viewerForm.permissions, { type: 'monitor', value: monitorId }];
    }
  }

  monitorNameById(id?: string): string {
    if (!id) return 'Todo';
    return this.monitorService.monitors().find(m => m.id === id)?.name ?? id;
  }

  resetViewerForm(): void {
    this.isEditingViewer.set(false);
    this.editingViewerId = null;
    this.viewerForm = this.getEmptyViewerForm();
  }

  onPromptChangeViewerPassword(viewer: IViewer): void {
    this.viewerPasswordTarget = viewer;
    this.viewerNewPassword = '';
    this.showViewerPasswordModal.set(true);
  }

  onConfirmViewerPassword(): void {
    if (!this.viewerPasswordTarget || this.viewerNewPassword.length < 8) {
      this.showToastFeedback('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    const id = this.viewerPasswordTarget.id;
    this.http.put(`/api/v1/users/${id}/password`, { newPassword: this.viewerNewPassword }).subscribe({
      next: () => {
        this.showViewerPasswordModal.set(false);
        this.viewerPasswordTarget = null;
        this.viewerNewPassword = '';
        this.showToastFeedback('Contraseña del Viewer actualizada exitosamente.');
      },
      error: (err) => {
        this.showToastFeedback(extractApiErrorMessage(err, 'Error al cambiar contraseña.'));
      }
    });
  }

  removeTempPermission(idx: number): void {
    this.viewerForm.permissions.splice(idx, 1);
  }

  onEditViewer(viewer: IViewer): void {
    this.isEditingViewer.set(true);
    this.editingViewerId = viewer.id;
    this.viewerForm = {
      username: (viewer as any).username || '',
      email: viewer.email || '',
      password: '',
      permissions: [...viewer.permissions],
      isTvSessionEnabled: viewer.isTvSessionEnabled,
      asAdmin: false
    };
  }

  onSaveViewer(): void {
    // Aviso de seguridad: guardar un viewer sin ningún permiso lo deja sin poder ver nada.
    if (!this.viewerForm.asAdmin && this.viewerForm.permissions.length === 0) {
      this.confirm.ask(
        'Guardar sin permisos',
        'No seleccionaste ningún permiso (ni "Ver todo", ni grupos, ni monitores). Este usuario no podrá ver ningún monitor. ¿Guardar de todas formas?',
        () => this.proceedSaveViewer()
      );
      return;
    }
    this.proceedSaveViewer();
  }

  private proceedSaveViewer(): void {
    if (this.isEditingViewer() && this.editingViewerId) {
      this.userService.updatePermissions(this.editingViewerId, {
        permissions: this.viewerForm.permissions,
        isTvSessionEnabled: this.viewerForm.isTvSessionEnabled
      }).subscribe({
        next: () => {
          this.resetViewerForm();
          this.showToastFeedback('Permisos del Viewer actualizados.');
        },
        error: (err) => {
          this.showToastFeedback(extractApiErrorMessage(err, 'Error al actualizar los permisos del Viewer.'));
        }
      });
    } else if (this.viewerForm.asAdmin) {
      if (!this.viewerForm.email.trim() || !this.viewerForm.password.trim()) {
        this.showToastFeedback('El correo y la contraseña son obligatorios para crear un administrador.');
        return;
      }

      this.userService.createAdmin({
        email: this.viewerForm.email,
        password: this.viewerForm.password
      }).subscribe({
        next: () => {
          this.userService.loadAdmins().subscribe();
          this.resetViewerForm();
          this.showToastFeedback('Administrador creado exitosamente.');
        },
        error: (err) => {
          this.showToastFeedback(extractApiErrorMessage(err, 'Error al crear el administrador.'));
        }
      });
    } else {
      if (!this.viewerForm.username.trim() || !this.viewerForm.password.trim()) {
        this.showToastFeedback('El nombre de usuario y la contraseña son obligatorios.');
        return;
      }

      this.userService.createViewer({
        username: this.viewerForm.username,
        email: this.viewerForm.email || undefined,
        password: this.viewerForm.password,
        permissions: this.viewerForm.permissions,
        isTvSessionEnabled: this.viewerForm.isTvSessionEnabled
      } as any).subscribe({
        next: () => {
          this.resetViewerForm();
          this.showToastFeedback('Usuario Viewer creado exitosamente.');
        },
        error: (err) => {
          this.showToastFeedback(extractApiErrorMessage(err, 'Error al crear el Viewer.'));
        }
      });
    }
  }

  onDeleteViewer(id: string): void {
    this.confirm.ask(
      '¿Eliminar Viewer?',
      '¿Estás seguro de eliminar este usuario de solo lectura? Perderá acceso inmediato a la plataforma.',
      () => {
        this.userService.deleteViewer(id).subscribe({
          next: () => this.showToastFeedback('Viewer eliminado.')
        });
      }
    );
  }

  // ================= ACCIONES DE OTROS ADMINISTRADORES =================
  onEditAdmin(admin: IAdmin): void {
    this.adminEditTarget = admin;
    this.adminEditEmail = admin.email;
    this.showEditAdminModal.set(true);
  }

  onConfirmEditAdmin(): void {
    if (!this.adminEditTarget || !this.adminEditEmail.trim()) {
      this.showToastFeedback('El correo no puede estar vacío.');
      return;
    }
    this.userService.updateAdminEmail(this.adminEditTarget.id, this.adminEditEmail.trim()).subscribe({
      next: () => {
        this.showEditAdminModal.set(false);
        this.adminEditTarget = null;
        this.showToastFeedback('Correo del administrador actualizado.');
      },
      error: (err) => {
        this.showToastFeedback(extractApiErrorMessage(err, 'Error al actualizar el correo.'));
      }
    });
  }

  onPromptResetAdminPassword(admin: IAdmin): void {
    this.adminPasswordTarget = admin;
    this.adminNewPassword = '';
    this.showAdminPasswordModal.set(true);
  }

  onConfirmResetAdminPassword(): void {
    if (!this.adminPasswordTarget || this.adminNewPassword.length < 8) {
      this.showToastFeedback('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    this.userService.resetAdminPassword(this.adminPasswordTarget.id, this.adminNewPassword).subscribe({
      next: () => {
        this.showAdminPasswordModal.set(false);
        this.adminPasswordTarget = null;
        this.adminNewPassword = '';
        this.showToastFeedback('Contraseña del administrador actualizada.');
      },
      error: (err) => {
        this.showToastFeedback(extractApiErrorMessage(err, 'Error al cambiar contraseña.'));
      }
    });
  }

  onToggleAdminBlocked(admin: IAdmin): void {
    const nextState = !admin.isBlocked;
    this.confirm.ask(
      nextState ? '¿Bloquear administrador?' : '¿Desbloquear administrador?',
      nextState
        ? `${admin.email} no podrá iniciar sesión mientras esté bloqueado.`
        : `${admin.email} podrá volver a iniciar sesión normalmente.`,
      () => {
        this.userService.toggleAdminBlocked(admin.id, nextState).subscribe({
          next: () => this.showToastFeedback(nextState ? 'Administrador bloqueado.' : 'Administrador desbloqueado.'),
          error: (err) => {
            this.showToastFeedback(extractApiErrorMessage(err, 'Error al cambiar el estado de bloqueo.'));
          }
        });
      }
    );
  }

  onDeleteAdmin(admin: IAdmin): void {
    this.confirm.ask(
      '¿Eliminar Administrador?',
      `¿Estás seguro de eliminar la cuenta de ${admin.email}? Esta acción no se puede deshacer.`,
      () => {
        this.userService.deleteAdmin(admin.id).subscribe({
          next: () => this.showToastFeedback('Administrador eliminado.'),
          error: (err) => {
            this.showToastFeedback(extractApiErrorMessage(err, 'Error al eliminar el administrador.'));
          }
        });
      }
    );
  }
}
