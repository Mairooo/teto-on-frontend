import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../../shared/services/projet.service';
import { Projects } from '../../shared/interfaces/project.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  isLoggedIn = !!localStorage.getItem('token');
  projets: Projects[] = [];
  loading = true;
  error: string | null = null;

  totalProjects = 0;
  totalLikes = 0;
  totalPlays = 0;
  totalCreators = 0;

  constructor(
    private router: Router,
    private projectService: ProjectsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.projectService.getprojects().subscribe({
      next: (response) => {
        // Filtrer uniquement les projets publiés
        this.projets = response.data.filter(p => Number(p.status) === 1);

        // Stats
        this.totalProjects = this.projets.length;
        this.totalLikes = this.projets.reduce((acc, p) => acc + (p.likes ?? 0), 0);
        this.totalPlays = this.projets.reduce((acc, p) => acc + (p.plays ?? 0), 0);

        // Créateurs distincts
        const creators = new Set<string>();
        this.projets.forEach(p => {
          if (p.user_created && typeof p.user_created === 'object') {
            const name = `${p.user_created.first_name ?? ''} ${p.user_created.last_name ?? ''}`.trim();
            if (name) creators.add(name);
          }
        });
        this.totalCreators = creators.size;

        this.loading = false;
        this.cd.detectChanges(); // ⚡ Force l'affichage
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des projets';
        this.loading = false;
      },
    });
  }

  onLogout() {
    localStorage.removeItem('directus_access_token');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  goToCreateProjects() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth']);
      return;
    }
    this.router.navigate(['/project']);
  }

  goToProject(title: string) {
    this.router.navigate(['/project-view', title]);
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
