import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectsService } from '../../shared/services/project.service';
import { Projects } from '../../shared/interfaces/project.interface';
import { environment } from '../../../environments/environment';
import { LikeButtonComponent } from '../../shared/components/like-button/like-button.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LikeButtonComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent implements OnInit {
  project: Projects | null = null;
  isLoading = true;
  error = '';
  private readonly DIRECTUS_URL = environment.directusUrl;

  // Lecteur audio
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  private audio: HTMLAudioElement | null = null;

  get currentTimeRounded(): number {
    return Math.floor(this.currentTime);
  }

  get durationRounded(): number {
    return Math.floor(this.duration);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const projectTitle = params['title'];
      if (projectTitle) {
        this.loadProject(projectTitle);
      }
    });
  }

  ngOnDestroy(): void {
    // Nettoyer le lecteur audio
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  private loadProject(title: string): void {
    this.isLoading = true;
    this.error = '';
    
    this.projectService.getProjectsByName(title).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          this.project = response.data[0];
          this.initAudioPlayer();
          this.isLoading = false;
          this.cd.detectChanges();
        } else {
          this.error = 'Projet introuvable';
          this.isLoading = false;
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du projet:', error);
        this.error = 'Projet introuvable';
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  private initAudioPlayer(): void {
    if (!this.project?.rendered_audio) return;

    const audioUrl = this.getAudioUrl();
    if (!audioUrl) return;

    this.audio = new Audio(audioUrl);

    this.audio.addEventListener('loadedmetadata', () => {
      this.duration = this.audio!.duration;
      this.cd.detectChanges();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio!.currentTime;
      this.cd.detectChanges();
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.currentTime = 0;
      this.cd.detectChanges();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Erreur de lecture audio:', e);
    });
  }

  getAudioUrl(): string | null {
    if (!this.project?.rendered_audio) return null;
    return `${this.DIRECTUS_URL}/assets/${this.project.rendered_audio}`;
  }

  downloadAudio(): void {
    if (!this.project?.rendered_audio) return;

    const url = `${this.DIRECTUS_URL}/assets/${this.project.rendered_audio}?download`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.project.title}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  togglePlayPause(): void {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  seek(event: Event): void {
    if (!this.audio) return;
    const input = event.target as HTMLInputElement;
    const time = parseFloat(input.value);
    this.audio.currentTime = time;
    this.currentTime = time;
  }

  getProgress(): number {
    if (this.duration === 0) return 0;
    return (this.currentTime / this.duration) * 100;
  }

  getCoverImageUrl(): string | null {
    if (!this.project || !this.project.cover_image) return null;
    const coverId = typeof this.project.cover_image === 'string'
      ? this.project.cover_image
      : (this.project.cover_image as any).id;
    return `${this.DIRECTUS_URL}/assets/${coverId}?width=1200&height=630&fit=cover&quality=90`;
  }

  getCreatorName(): string {
    if (!this.project || !this.project.user_created) return 'Anonyme';
    
    if (typeof this.project.user_created === 'object') {
      const user = this.project.user_created as any;
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      if (fullName) return fullName;
      if (user.email) return user.email.split('@')[0];
    }
    
    return 'Anonyme';
  }

  getVoicebankName(): string {
    if (!this.project) return 'N/A';
    
    const project = this.project as any;
    if (!project.primary_voicebank) return 'N/A';
    
    if (typeof project.primary_voicebank === 'object') {
      return project.primary_voicebank.name || 'N/A';
    }
    
    return 'N/A';
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getRelativeTime(date: string): string {
    if (!date) return '';
    
    const now = new Date();
    const projectDate = new Date(date);
    
    // Vérifier si la date est valide
    if (isNaN(projectDate.getTime())) return '';
    
    const diffInSeconds = Math.floor((now.getTime() - projectDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minute(s)`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heure(s)`;
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} jour(s)`;

    return projectDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  shareUrl(): void {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.project?.title || 'Projet UTAU',
        text: `Découvrez ce projet UTAU : ${this.project?.title}`,
        url: url
      }).catch(err => console.log('Erreur partage:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Lien copié dans le presse-papier !');
      });
    }
  }

  downloadUSTFile(): void {
    if (!this.project) return;

    // Récupérer les données de composition depuis le projet
    const projectData = this.project as any;
    const compositionData = projectData.composition_data;

    if (!compositionData) {
      alert('Aucune donnée de composition disponible');
      return;
    }

    // Convertir les données en format JSON
    let notes;
    if (typeof compositionData === 'string') {
      try {
        notes = JSON.parse(compositionData);
      } catch (e) {
        console.error('Erreur lors du parsing de la composition:', e);
        alert('Erreur lors de la lecture des données de composition');
        return;
      }
    } else {
      notes = compositionData;
    }

    // Créer un objet avec toutes les données nécessaires pour réimporter
    const utauData = {
      title: this.project.title,
      description: this.project.description || '',
      tempo: this.project.tempo || 120,
      notes: notes,
      voicebank: projectData.primary_voicebank?.name || '',
      voicebankId: projectData.primary_voicebank?.id || ''
    };

    // Créer le fichier .utau (format JSON)
    const blob = new Blob([JSON.stringify(utauData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement et le déclencher
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.project.title}.utau`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
