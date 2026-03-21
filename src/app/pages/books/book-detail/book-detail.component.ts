import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent {

  book: any;

  books = [
    {
      id: 1,
      title: "Complete Fat Loss Guide",
      author: "Maya Alden",
      price: 449,
      reviews: 19,
      image: "assets/images/fatloss-book.jpeg",
      description: "Romantic emotional story..."
    },
    {
      id: 2,
      title: "Law Maker",
      author: "Susie Tate",
      price: 299,
      reviews: 6505,
      image: "assets/images/fatloss-book.jpeg",
      description: "Legal drama and romance..."
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.book = this.books.find(b => b.id == id);
  }

  buyBook() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      alert('Payment Page (Razorpay next)');
    }
  }
}




