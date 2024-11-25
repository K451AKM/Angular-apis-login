import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterViewerComponent } from '../character-viewer/character-viewer.component';
import { CharacterEditorComponent } from '../character-editor/character-editor.component';
import Swal from 'sweetalert2';

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
  isDeleted?: boolean;
  originalData?: Character;
}

@Component({
  selector: 'app-tabla-rick-and-morty',
  standalone: true,
  imports: [CommonModule, FormsModule, CharacterViewerComponent, CharacterEditorComponent],
  templateUrl: './tabla-rick-and-morty.component.html',
  styleUrls: ['./tabla-rick-and-morty.component.css']
})
export class TablaRickAndMortyComponent implements OnInit {
  allCharacters: Character[] = [];
  displayedCharacters: Character[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalCharacters = 0;
  hasNextPage = true;
  searchTerm = '';
  sortColumn: 'id' | 'name' = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedCharacter: Character | null = null;
  editingCharacter: Character | null = null;
  totalPages = 0;
  visiblePages: number[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAllCharacters();
  }

  loadAllCharacters() {
    this.http.get<any>('https://rickandmortyapi.com/api/character').subscribe({
      next: (data) => {
        this.totalCharacters = data.info.count;
        this.totalPages = data.info.pages;
        this.loadCharactersRecursively(1, []);
      },
      error: (error) => {
        console.error('Error fetching characters:', error);
      }
    });
  }

  loadCharactersRecursively(page: number, accumulatedCharacters: Character[]) {
    const url = `https://rickandmortyapi.com/api/character/?page=${page}`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        accumulatedCharacters.push(...data.results);
        if (data.info.next) {
          this.loadCharactersRecursively(page + 1, accumulatedCharacters);
        } else {
          this.allCharacters = accumulatedCharacters;
          this.updateDisplayedCharacters();
        }
      },
      error: (error) => {
        console.error('Error fetching characters:', error);
      }
    });
  }

  updateDisplayedCharacters() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedCharacters = this.allCharacters
      .filter(char => !char.isDeleted && char.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .slice(startIndex, startIndex + this.itemsPerPage);
    this.hasNextPage = startIndex + this.itemsPerPage < this.allCharacters.length;
    this.updateVisiblePages();
    this.sortCharacters();
  }

  updateVisiblePages() {
    const totalVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(totalVisible / 2));
    let end = Math.min(this.totalPages, start + totalVisible - 1);

    if (end - start + 1 < totalVisible) {
      start = Math.max(1, end - totalVisible + 1);
    }

    this.visiblePages = Array.from({length: end - start + 1}, (_, i) => start + i);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updateDisplayedCharacters();
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.updateDisplayedCharacters();
  }

  changePage(delta: number) {
    this.goToPage(this.currentPage + delta);
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
    this.displayedCharacters.sort((a, b) => {
      let aValue: string | number = this.sortColumn === 'id' ? a.id : a.name;
      let bValue: string | number = this.sortColumn === 'id' ? b.id : b.name;

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

  editCharacter(character: Character) {
    if (!character.originalData) {
      character.originalData = { ...character };
    }
    this.editingCharacter = character;
  }

  closeEditor() {
    this.editingCharacter = null;
  }

  saveCharacter(updatedCharacter: Character) {
    const index = this.allCharacters.findIndex(char => char.id === updatedCharacter.id);
    if (index !== -1) {
      this.allCharacters[index] = { ...updatedCharacter, originalData: this.allCharacters[index].originalData };
      this.updateDisplayedCharacters();
      Swal.fire({
        title: '¡Guardado!',
        text: `Los cambios en ${updatedCharacter.name} han sido guardados.`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
      this.closeEditor();
    }
  }

  deleteCharacter(character: Character) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar a ${character.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const index = this.allCharacters.findIndex(char => char.id === character.id);
        if (index !== -1) {
          this.allCharacters[index].isDeleted = true;
          this.updateDisplayedCharacters();
          Swal.fire(
            '¡Eliminado!',
            `${character.name} ha sido eliminado de la tabla.`,
            'success'
          );
        }
      }
    });
  }

  resetChanges() {
    this.allCharacters = this.allCharacters.map(char => char.originalData ? { ...char.originalData } : char);
    this.updateDisplayedCharacters();
    Swal.fire(
      '¡Cambios reseteados!',
      'Todos los cambios han sido deshechos.',
      'info'
    );
  }

  getMaxDisplayedIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.allCharacters.length);
  }
}

