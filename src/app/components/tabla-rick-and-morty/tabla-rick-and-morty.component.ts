import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterViewerComponent } from '../character-viewer/character-viewer.component';

interface Character {
  id: number;
  name: string;
  image: string;
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
  episode: string[];
  url: string;
  created: string;
}

@Component({
  selector: 'app-tabla-rick-and-morty',
  standalone: true,
  imports: [CommonModule, FormsModule, CharacterViewerComponent],
  templateUrl: './tabla-rick-and-morty.component.html',
  styleUrls: ['./tabla-rick-and-morty.component.css']
})
export class TablaRickAndMortyComponent implements OnInit {
  characters: Character[] = [];
  currentPage = 1;
  totalCharacters = 0;
  hasNextPage = true;
  searchTerm = '';
  sortColumn: 'id' | 'name' = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedCharacter: Character | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCharacters();
  }

  loadCharacters() {
    const url = `https://rickandmortyapi.com/api/character/?page=${this.currentPage}&name=${this.searchTerm}`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.characters = data.results;
        this.totalCharacters = data.info.count;
        this.hasNextPage = !!data.info.next;
        this.sortCharacters();
      },
      error: (error) => {
        console.error('Error fetching characters:', error);
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadCharacters();
  }

  changePage(delta: number) {
    this.currentPage += delta;
    this.loadCharacters();
  }

  sort(column: 'id' | 'name') {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortCharacters();
  }

  sortCharacters() {
    this.characters.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (this.sortColumn === 'id') {
        aValue = a.id;
        bValue = b.id;
      } else if (this.sortColumn === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else {
        return 0;
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  viewCharacter(character: Character) {
    this.selectedCharacter = character;
  }

  closeViewer() {
    this.selectedCharacter = null;
  }
}