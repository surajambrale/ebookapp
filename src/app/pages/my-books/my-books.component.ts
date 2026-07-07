import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

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
  ) {}

  purchasedBooks: any[] = [];

  user: any;

  ngOnInit(): void {

    const storedUser = localStorage.getItem('user');

    // 🔥 CHECK LOGIN
    if (storedUser) {

      this.user = JSON.parse(storedUser);

      console.log("Logged User:", this.user);

      this.loadBooks();

    } else {

      console.log("No user found");

    }

  }

  // 🔥 LOAD PURCHASED BOOKS
  loadBooks() {

    this.http.get<any[]>(
      `https://ebookapp.onrender.com/my-books/${this.user._id}`
    )
    .subscribe({

      next: (res) => {

        console.log("Purchased Books:", res);

        // 🔥 ADD READING PROGRESS
        this.purchasedBooks = res.map((book: any) => {

          const progress =
            localStorage.getItem(
              `progress_${this.user._id}_${book.id}`
            );

          return {

            ...book,

            progress: progress
              ? Number(progress)
              : 0

          };

        });

      },

      error: (err) => {

        console.log("Books Error:", err);

      }

    });

  }

  // 🔥 READ BOOK
  readBook(bookId: any) {

    // 🔥 SAVE LAST OPEN BOOK
    localStorage.setItem(
      `lastBook_${this.user._id}`,
      bookId
    );

    this.router.navigate(['/read', bookId]);

  }

}