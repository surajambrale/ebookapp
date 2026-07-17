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

  ngOnInit() {

    this.filteredBooks = [...this.books];

    this.loadDynamicBooks();

  }

  loadDynamicBooks() {

    this.http.get<any[]>(`${this.api}/books/all`)
      .subscribe({

        next: (res) => {

          this.dynamicBooks = res;

          const formattedBooks = res.map(book => ({

            id: book._id,

            title: book.title,

            image: book.coverImage,

            author: book.author,

            price: book.price,

            originalPrice: book.originalPrice,

            dynamic: true

          }));

          this.books = [

            ...this.books,

            ...formattedBooks

          ];

          this.filteredBooks = [...this.books];

        },

        error: err => {

          console.log(err);

        }

      });

  }

  books = [

    {
      id: 1,
      title: 'Complete Fat Loss Guide',
      image: 'assets/images/fatloss-book.jpeg'
    },

    {
      id: 2,
      title: '1500-Calorie Diet Plan',
      image: 'assets/images/1500-cal-diet.jpg'
    },

    {
      id: 3,
      title: 'Habits That Change Your Life',
      image: 'assets/images/habits.jpg'
    },

    {
      id: 4,
      title: 'PCOD / PCOS Guide',
      image: 'assets/images/pcod.jpg'
    },

    {
      id: 5,
      title: 'Diabetes Control',
      image: 'assets/images/diabetes-control.jpg'
    }

  ];

  filteredBooks = [...this.books];

  searchBooks() {

    this.filteredBooks = this.books.filter(book =>

      book.title.toLowerCase().includes(

        this.searchText.toLowerCase()

      )

    );

    this.showNotFound = this.filteredBooks.length == 0;

  }

  // 🔥 OPEN BOOK PAGE
  openBook(book: any) {

    this.router.navigate(['/book', book.id]);

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