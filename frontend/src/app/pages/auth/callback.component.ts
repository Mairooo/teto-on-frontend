import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div class="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div class="flex justify-center mb-4">
            <svg class="animate-spin h-12 w-12 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Authentification en cours...</h2>
          <p class="text-gray-600">Veuillez patienter pendant que nous vous connectons</p>
          
          <div *ngIf="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600 mb-3">{{ error }}</p>
            <button 
              (click)="redirectToLogin()"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CallbackComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  error = '';

  async ngOnInit(): Promise<void> {
    try {
      await this.auth.handleOAuthCallback();
      // Redirection vers la page d'accueil après succès
      await this.router.navigate(['/']);
    } catch (e: any) {
      this.error = e?.message ?? 'Erreur lors de l\'authentification OAuth';
      console.error('Erreur OAuth callback:', e);
    }
  }

  async redirectToLogin(): Promise<void> {
    await this.router.navigate(['/login']);
  }
}
