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

  if (storedUser) {

    this.user = JSON.parse(storedUser);

    this.loadBooks();

  }

}

  loadBooks() {

    this.http.get<any[]>(`https://ebookapp.onrender.com/my-books/${this.user._id}`)
      .subscribe({

        next: (res) => {

          this.purchasedBooks = res;

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  readBook(bookId: string) {

    window.open(
      `https://ebookapp.onrender.com/book/${this.user._id}/${bookId}`,
      '_blank'
    );

  }

}