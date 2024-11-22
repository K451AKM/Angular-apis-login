import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
}

@Component({
  selector: 'app-character-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="character" (click)="onOverlayClick($event)">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ character.name }}</h2>
          <button class="close-btn" (click)="close()">×</button>
        </div>
        <div class="modal-body">
          <div class="character-main-info">
            <div class="character-image">
              <img [src]="character.image" [alt]="character.name">
            </div>
            <div class="character-details">
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">{{ character.status }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Species:</span>
                <span class="info-value">{{ character.species }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">{{ character.type || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Gender:</span>
                <span class="info-value">{{ character.gender }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Origin:</span>
                <span class="info-value">{{ character.origin.name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">{{ character.location.name }}</span>
              </div>
            </div>
          </div>
          <div class="character-episodes">
            <h3>Episodes:</h3>
            <div class="episodes-list">
              <div class="episode-item" *ngFor="let episode of episodes">
                <span class="episode-code">{{ episode.episode }}</span>
                <span class="episode-name">{{ episode.name }}</span>
                <span class="episode-date">{{ episode.air_date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #64748b;
      padding: 0.5rem;
      line-height: 1;
    }

    .close-btn:hover {
      color: #475569;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .character-main-info {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .character-image {
      flex-shrink: 0;
    }

    .character-image img {
      width: 200px;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .character-details {
      flex-grow: 1;
    }

    .info-row {
      display: flex;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .info-label {
      flex: 0 0 100px;
      font-weight: 600;
      color: #64748b;
    }

    .info-value {
      color: #1e293b;
    }

    .character-episodes {
      border-top: 1px solid #e2e8f0;
      padding-top: 1.5rem;
    }

    .character-episodes h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .episodes-list {
      display: grid;
      gap: 0.75rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .episode-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: center;
      padding: 0.75rem;
      background-color: #f8fafc;
      border-radius: 6px;
    }

    .episode-code {
      font-family: monospace;
      color: #3b82f6;
      font-weight: 600;
    }

    .episode-name {
      color: #1e293b;
    }

    .episode-date {
      color: #64748b;
      font-size: 0.875rem;
    }

    @media (max-width: 640px) {
      .character-main-info {
        flex-direction: column;
      }

      .character-image img {
        width: 100%;
        height: auto;
      }

      .episode-item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
    }
  `]
})
export class CharacterViewerComponent {
  @Input() character: Character | null = null;
  @Output() closeViewer = new EventEmitter<void>();

  episodes: Episode[] = [];

  constructor(private http: HttpClient) {}

  ngOnChanges() {
    if (this.character) {
      this.loadEpisodes();
    }
  }

  loadEpisodes() {
    this.episodes = [];
    this.character?.episode.forEach(episodeUrl => {
      this.http.get<Episode>(episodeUrl).subscribe(
        episode => this.episodes.push(episode),
        error => console.error('Error fetching episode:', error)
      );
    });
  }

  close() {
    this.closeViewer.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
}