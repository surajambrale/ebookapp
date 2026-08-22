import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-books.component.html',
  styleUrls: ['./my-books.component.scss']
})
export class MyBooksComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  purchasedBooks: any[] = [];
  purchasedFolders: any[] = [];
  subscriptionActive = false;
  api = environment.apiUrl;

  user: any;

  ngOnInit(): void {

    const storedUser = localStorage.getItem('user');

    // 🔥 CHECK LOGIN
    if (storedUser) {

      this.user = JSON.parse(storedUser);

      console.log("Logged User:", this.user);

      this.loadBooks();
      this.loadFolders();

    } else {

      console.log("No user found");

    }

  }

  // 🔥 LOAD PURCHASED BOOKS
  loadBooks() {

    this.http.get<any[]>(
      `${this.api}/my-books/${this.user._id}`
    )
      .subscribe({

        next: (res) => {

          console.log("Purchased Books:", res);

          // 🔥 ADD READING PROGRESS
          this.purchasedBooks = res.map((book: any) => {

            const bookId = book._id || book.id;

            const progress = localStorage.getItem(
              `progress_${this.user._id}_${bookId}`
            );

            return {
              ...book,
              progress: progress ? Number(progress) : 0
            };

          });

        },

        error: (err) => {

          console.log("Books Error:", err);

        }

      });

  }



  loadFolders() {
    this.http.get<any>(
      `${this.api}/api/folder-access/my`
    ).subscribe({
      next: (res) => {
        this.purchasedFolders = Array.isArray(res?.accesses)
          ? res.accesses.map((access: any) => ({
              ...access,
              folder: access.folder || null
            })).filter((access: any) => !!access.folder)
          : [];
        this.subscriptionActive = !!res?.subscriptionActive;
        console.log('Purchased Folders:', this.purchasedFolders);
      },
      error: (err) => {
        console.log('Folders Error:', err);
        this.purchasedFolders = [];
      }
    });
  }

  openFolder(access: any) {
    const folderId = access?.folder?._id;
    if (!folderId) return;
    this.router.navigate(['/library/folder', folderId]);
  }

  // 🔥 READ BOOK
 // 🔥 READ BOOK
readBook(book: any) {

  const id = book._id || book.id;

  localStorage.setItem(
    `lastBook_${this.user._id}`,
    id
  );

  this.router.navigate(['/read', id]);

}

}