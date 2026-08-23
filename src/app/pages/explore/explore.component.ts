import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  api = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient) { }

  searchText = '';

  showNotFound = false;

  dynamicBooks: any[] = [];

  books: any[] = [];
  folders: any[] = [];
  filteredFolders: any[] = [];
  folderLoading = false;

  ngOnInit() {

    this.loadDynamicBooks();
    this.loadFolders();

  }

  loadDynamicBooks() {

    this.http.get<any>(`${this.api}/books/all?page=1&limit=1000`)
      .subscribe({

        next: (res) => {

          console.log("Explore Books:", res);

          this.books = (res.books || []).map((book: any) => ({

            id: book._id,

            _id: book._id,

            title: book.title,

            image: book.coverImage,

            coverImage: book.coverImage,

            author: book.author,

            price: book.price,

            originalPrice: book.originalPrice,

            previewImages: book.previewImages,

            description: book.description

          }));

          this.filteredBooks = [...this.books];

          console.log("Mapped Books:", this.filteredBooks);

        },

        error: (err) => {

          console.log(err);

        }

      });

  }




  loadFolders() {
    this.folderLoading = true;
    this.http.get<any[]>(`${this.api}/folders`).subscribe({
      next: (res) => {
        this.folders = Array.isArray(res) ? res : [];
        this.filteredFolders = [...this.folders];
        this.folderLoading = false;
      },
      error: (err) => {
        console.log('Explore folders error:', err);
        this.folders = [];
        this.folderLoading = false;
      }
    });
  }

  openFolder(folder: any) {
    const id = folder?._id;
    if (id) this.router.navigate(['/library/folder', id]);
  }

  filteredBooks: any[] = [];

  searchBooks() {
    const query = this.searchText.trim().toLowerCase();

    if (!query) {
      this.filteredBooks = [...this.books];
      this.filteredFolders = [...this.folders];
      this.showNotFound = false;
      return;
    }

    this.filteredBooks = this.books.filter(book =>
      String(book.title || '').toLowerCase().includes(query)
    );
    this.filteredFolders = this.folders.filter(folder =>
      `${folder.name || ''} ${folder.description || ''}`.toLowerCase().includes(query)
    );
    this.showNotFound = this.filteredBooks.length === 0 && this.filteredFolders.length === 0;

  }

  // 🔥 OPEN BOOK PAGE
  openBook(book: any) {

    this.router.navigate(['/book', book._id || book.id]);

  }

  // 🔥 WHATSAPP REQUEST
  sendRequest() {

    const message =
      `Hello Admin, Please add this book in app: ${this.searchText}`;

    const url =
      `https://wa.me/919372336433?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');

  }

}