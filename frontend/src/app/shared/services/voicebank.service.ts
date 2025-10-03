import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Voicebank {
  id: string;
  name: string;
  description?: string;
  language?: string;
  author?: string;
}

export interface VoicebankFile {
  name: string;
  path: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class VoicebankService {
  private readonly apiUrl = 'http://localhost:8055';
  private audioCache = new Map<string, HTMLAudioElement>();
  
  readonly selectedVoicebank = signal<Voicebank | null>(null);
  readonly availableFiles = signal<VoicebankFile[]>([]);

  constructor(private http: HttpClient) {}

  getVoicebanks(): Observable<Voicebank[]> {
    return this.http.get<any>(`${this.apiUrl}/items/voicebanks`).pipe(
      map(response => response.data || [])
    );
  }

  selectVoicebank(voicebank: Voicebank): void {
    this.selectedVoicebank.set(voicebank);
    this.loadVoicebankFiles(voicebank.name);
  }

  private loadVoicebankFiles(voicebankName: string): void {
    this.http.get<any>(`${this.apiUrl}/voicebank-api/${encodeURIComponent(voicebankName)}`)
      .subscribe({
        next: (response) => {
          this.availableFiles.set(response.files || []);
        },
        error: (err) => {
          console.error('Error loading voicebank files:', err);
          this.availableFiles.set([]);
        }
      });
  }

  getAudioUrl(voicebankName: string, filename: string): string {
    return `${this.apiUrl}/voicebank-api/${encodeURIComponent(voicebankName)}/${encodeURIComponent(filename)}`;
  }

  async playAudio(voicebankName: string, filename: string): Promise<void> {
    const cacheKey = `${voicebankName}:${filename}`;
    
    let audio = this.audioCache.get(cacheKey);
    
    if (!audio) {
      const url = this.getAudioUrl(voicebankName, filename);
      console.log('Creating new audio element for:', url);
      audio = new Audio(url);
      this.audioCache.set(cacheKey, audio);
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error for', filename, ':', e);
      });
      
      audio.addEventListener('loadeddata', () => {
        console.log('Audio loaded:', filename);
      });
    }

    try {
      audio.currentTime = 0;
      console.log('Playing audio:', filename);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', filename, error);
    }
  }

  stopAllAudio(): void {
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  clearCache(): void {
    this.stopAllAudio();
    this.audioCache.clear();
  }
}
