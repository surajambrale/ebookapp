import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-books.component.html',
  styleUrls: ['./my-books.component.scss']
})
export class MyBooksComponent implements OnInit {

  constructor(private http: HttpClient) {}

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

        this.purchasedBooks = res;

      },

      error: (err) => {

        console.log("Books Error:", err);

      }

    });

  }

  // bookaccess code start

hasAccess(bookId: any): boolean {

  return this.purchasedBooks.some(
    b => b.bookId == bookId
  );

}

//  bookaccess code end

  // 🔥 OPEN BOOK PDF
  readBook(bookId: any) {

    window.open(
      `https://ebookapp.onrender.com/book/${this.user._id}/${bookId}`,
      '_blank'
    );

  }

}