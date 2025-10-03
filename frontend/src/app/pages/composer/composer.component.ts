import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VoicebankService, Voicebank } from '../../shared/services/voicebank.service';
import { Note, PHONEME_MAP, PITCH_LIST } from '../../shared/models/composer.model';

@Component({
  selector: 'app-composer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './composer.component.html',
  styleUrls: ['./composer.component.css']
})
export class ComposerComponent implements OnInit {
  readonly projectTitle = signal('Nouvelle Composition');
  readonly bpm = signal(120);
  readonly isPlaying = signal(false);
  readonly timePosition = signal(0);
  readonly measures = signal(8);
  readonly notes = signal<Note[]>([]);
  readonly notesCount = computed(() => this.notes().length);
  
  readonly voicebanks = signal<Voicebank[]>([]);
  readonly selectedVoicebank = signal<Voicebank | null>(null);
  readonly selectedPhoneme = signal<string>('a');
  readonly pitchList = PITCH_LIST;
  readonly phonemeList = Object.keys(PHONEME_MAP);

  private playTimer: any = null;
  private playingNotes = new Set<string>();

  constructor(private voicebankService: VoicebankService) {}

  ngOnInit(): void {
    this.loadVoicebanks();
  }

  loadVoicebanks(): void {
    this.voicebankService.getVoicebanks().subscribe({
      next: (banks) => {
        this.voicebanks.set(banks);
        if (banks.length > 0) {
          this.onSelectVoicebank(banks[0]);
        }
      },
      error: (err) => console.error('Error loading voicebanks:', err)
    });
  }

  onSelectVoicebank(voicebank: Voicebank): void {
    this.selectedVoicebank.set(voicebank);
    this.voicebankService.selectVoicebank(voicebank);
  }

  onSelectPhoneme(phoneme: string): void {
    this.selectedPhoneme.set(phoneme);
  }

  onCellClick(pitch: string, measure: number, position: number): void {
    const existingNote = this.notes().find(
      n => n.pitch === pitch && n.measure === measure && n.position === position
    );

    if (existingNote) {
      this.notes.update(notes => notes.filter(n => n.id !== existingNote.id));
    } else {
      const newNote: Note = {
        id: `${Date.now()}-${Math.random()}`,
        pitch,
        phoneme: this.selectedPhoneme(),
        startTime: measure,
        duration: 1,
        measure,
        position
      };
      this.notes.update(notes => [...notes, newNote]);

      if (this.selectedVoicebank()) {
        const filename = PHONEME_MAP[this.selectedPhoneme()];
        if (filename) {
          console.log('Playing preview:', filename);
          this.voicebankService.playAudio(this.selectedVoicebank()!.name, filename);
        }
      }
    }
  }

  getNoteAt(pitch: string, measure: number): Note | undefined {
    return this.notes().find(n => n.pitch === pitch && n.measure === measure);
  }

  onTitleInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input) this.projectTitle.set(input.value);
  }

  onTogglePlay(): void {
    const next = !this.isPlaying();
    this.isPlaying.set(next);
    if (next) {
      this.startTicker();
      this.playNotes();
    } else {
      this.stopTicker();
      this.voicebankService.stopAllAudio();
    }
  }

  onStop(): void {
    this.isPlaying.set(false);
    this.stopTicker();
    this.timePosition.set(0);
    this.voicebankService.stopAllAudio();
    this.playingNotes.clear();
  }

  private playNotes(): void {
    const currentTime = this.timePosition();
    console.log('Current time:', currentTime, 'Notes:', this.notes().length);
    
    const notesToPlay = this.notes().filter(note => {
      const noteKey = note.id;
      const isInTimeRange = Math.floor(note.startTime) === Math.floor(currentTime);
      const notAlreadyPlaying = !this.playingNotes.has(noteKey);
      
      if (isInTimeRange && notAlreadyPlaying) {
        console.log('Should play note:', note.phoneme, 'at measure', note.measure);
      }
      
      return isInTimeRange && notAlreadyPlaying;
    });

    notesToPlay.forEach(note => {
      if (this.selectedVoicebank()) {
        const filename = PHONEME_MAP[note.phoneme];
        if (filename) {
          console.log('Playing:', filename, 'for voicebank:', this.selectedVoicebank()!.name);
          this.voicebankService.playAudio(this.selectedVoicebank()!.name, filename);
          this.playingNotes.add(note.id);
          
          setTimeout(() => {
            this.playingNotes.delete(note.id);
          }, note.duration * 1000);
        }
      }
    });
  }

  onInitPosition(): void {
    this.timePosition.set(0);
  }

  onChangeBpm(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const val = Number(input?.value ?? '');
    if (!Number.isNaN(val)) this.bpm.set(val);
  }

  private startTicker(): void {
    this.stopTicker();
    const beatsPerSecond = this.bpm() / 60;
    const intervalMs = 1000 / beatsPerSecond;
    
    console.log('Starting playback - BPM:', this.bpm(), 'Interval:', intervalMs);
    
    this.playTimer = setInterval(() => {
      this.timePosition.update((t) => {
        const newTime = t + 1;
        console.log('Tick - Time:', newTime);
        
        if (newTime >= this.measures()) {
          console.log('End of composition');
          this.onStop();
          return 0;
        }
        return newTime;
      });
      
      if (this.isPlaying()) {
        this.playNotes();
      }
    }, intervalMs);
  }

  private stopTicker(): void {
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
  }
}


