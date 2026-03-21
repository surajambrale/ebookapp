import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

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

  books = [
    {
      id: 1,
      title: "Complete Fat Loss Guide",
      author: "Suraj Ambrale -Nutritionist | Fitness Trainer",
      price: 399,
      reviews: 19,
      image: "assets/images/fatloss-book.jpeg",
      description: "Welcome to the Complete Fitness & Nutrition program. This program is specially designed for beginners and normal individuals who want to improve overall health, loose excess body fat, increase strength, and build a sustainable fitness lifestyle. The purpose of this kit is to simplify fitness and nutrition. No extreme workouts, no crash diets, and no complicated rules. This program focuses on consistency, balance, and long-term results."
    },
    // {
    //   id: 2,
    //   title: "Law Maker",
    //   author: "Susie Tate",
    //   price: 299,
    //   reviews: 6505,
    //   image: "assets/images/fatloss-book.jpeg",
    //   description: "Legal drama and romance..."
    // }
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
      this.http.get(`http://localhost:5000/check/${user._id}/${this.book.id}`)
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

    this.http.post('http://localhost:5000/create-order', {
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

          this.http.post('http://localhost:5000/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId: user._id,
            bookId: this.book.id.toString()
          }).subscribe(() => {

            alert('Payment Successful 🎉');

            this.hasAccess = true; // 🔥 update UI instantly
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