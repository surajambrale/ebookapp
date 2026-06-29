import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent {

  constructor(private router: Router) {}

  searchText = '';

  showNotFound = false;

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

    this.showNotFound =
      this.filteredBooks.length === 0;

  }

  // 🔥 OPEN BOOK PAGE
  openBook(id: number) {

    this.router.navigate(['/book', id]);

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