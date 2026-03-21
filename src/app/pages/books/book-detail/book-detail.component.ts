import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent {

  book: any;
  hasAccess: boolean = false;
  apiUrl = environment.apiUrl;

  books = [
    {
      id: 1,
      title: "Complete Fat Loss Guide",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 399,
      reviews: 19,
      image: "assets/images/fatloss-book.jpeg",
      description: "Welcome to the Complete Fitness & Nutrition program..."
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.book = this.books.find(b => b.id == id);

    const user = this.auth.getUser();

    // 🔐 CHECK PURCHASE
    if (user && user._id) {
      this.http.get(`${this.apiUrl}/check/${user._id}/${this.book.id}`)
        .subscribe((res: any) => {
          this.hasAccess = res.access;
        });
    }
  }

  // 💳 PAYMENT
  buyBook() {

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.auth.getUser();

    this.http.post(`${this.apiUrl}/create-order`, {
      amount: this.book.price
    }).subscribe((order: any) => {

      const options: any = {
        key: "rzp_test_STqAGoxV34Jsne",
        amount: order.amount,
        currency: "INR",
        name: "SS Builds",
        description: this.book.title,
        order_id: order.id,

        handler: (response: any) => {

          this.http.post(`${this.apiUrl}/verify-payment`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId: user._id,
            bookId: this.book.id.toString()
          }).subscribe(() => {

            alert('Payment Successful 🎉');

            this.hasAccess = true;
            this.router.navigate(['/read', this.book.id]);

          });
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    });
  }

  // 📖 READ BOOK
  readBook() {
    this.router.navigate(['/read', this.book.id]);
  }
}