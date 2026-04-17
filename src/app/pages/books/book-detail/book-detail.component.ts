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

  isLoading: boolean = false; // 🔥 single loader use
  apiUrl = environment.apiUrl;

  books = [
    {
      id: 1,
      title: "Complete Fat Loss Guide",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 1,
      reviews: 19,
      image: "assets/images/fatloss-book.jpeg",
      description: "Welcome to the Complete Fitness & Nutrition program. This program is specially designed for beginners and normal individuals who want to improve overall health, loose excess body fat, increase strength, and build a sustainable fitness lifestyle. The purpose of this kit is to simplify fitness and nutrition. No extreme workouts, no crash diets, and no complicated rules. This program focuses on consistency, balance, and long-term results."
    },
    {
      id: 2,
      title: "1500-Calorie Diet Plan",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 1,
      reviews: 19,
      image: "assets/images/1500-cal-diet.jpg",
      description: "Healthy Diet Plan for Regular People Who Want to Stay Fit. Struggling to stay fit because of a busy lifestyle, irregular meals, or confusion about what to eat? This ebook is designed especially for you. This is not a complicated or extreme diet plan. It’s a simple, practical, and realistic guide that helps you stay fit using everyday foods. Whether you are a working professional, student, or someone who just wants to feel better and look healthier—this plan is easy to follow and sustainable. Inside this ebook, you will discover: A clear understanding of what a healthy diet actually means. Simple explanation of Low GI & Low GL foods. A ready-to-follow 1500 calorie diet plan using Indian foods. Benefits like fat loss, stable energy, and better digestion. Easy tips for long-term results without stress. This ebook focuses on consistency, not perfection. No fancy foods, no strict rules—just real results with real food. If you follow this plan regularly, you will feel lighter, more energetic, and more in control of your health.  "
    },
     {
      id: 3,
      title: "Habits That Change Your Life",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 1,
      reviews: 19,
      image: "assets/images/habits.jpg",
      description: "Habits That Change Your Life is a practical and easy-to-follow guide designed to help you improve your daily routine and transform your life step by step. This ebook focuses on simple habits that anyone can follow-no complicated systems, no unrealistic advice. From building a powerful morning routine to improving your physical health, mental strength, productivity, and discipline, this book covers everything you need to become a better version of yourself. Written by Suraj Ambrale, Certified Nutritionist and Fitness Coach, this guide is based on real-life experience and practical strategies that actually work. Whether your goal is to stay fit, become more productive, or develop a strong mindset, this ebook gives you clear direction. If you are someone who wants to improve your life but doesn’t know where to start, this book will help you take the first step—and stay consistent. This is not just a book, it’s a daily action plan for a better life.  "
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

    if (!this.book) {
      alert('Book not found ❌');
      this.router.navigate(['/']);
      return;
    }

    const user = this.auth.getUser();

    // 🔐 CHECK ACCESS
    if (user && user._id) {
      this.http.get(`${this.apiUrl}/check/${user._id}/${this.book.id}`)
        .subscribe({
          next: (res: any) => {
            this.hasAccess = res.access;
          },
          error: () => console.log('Access check failed')
        });
    }
  }

  // 💳 BUY BOOK
  buyBook() {

    // 🔴 NOT LOGGED IN → LOGIN PAGE
    if (!this.auth.isLoggedIn()) {

      // 🔥 redirect after login
      localStorage.setItem('redirectAfterLogin', `/book/${this.book.id}`);

      this.router.navigate(['/login']);
      return;
    }

    const user = this.auth.getUser();

    if (!user || !user._id) {
      alert('Please login again ❌');
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;

    // 🧾 CREATE ORDER
    this.http.post(`${this.apiUrl}/create-order`, {
      amount: this.book.price
    }).subscribe({

      next: (order: any) => {

        const options: any = {
          // key: "rzp_test_STqAGoxV34Jsne", // 🔴 testing key
          key: "rzp_live_SWeBwjvwGx2bSP",  //live keyy
          amount: order.amount,
          currency: "INR",
          name: "SS Builds",
          description: this.book.title,
          order_id: order.id,

          handler: (response: any) => {

            // 🔐 VERIFY PAYMENT
            this.http.post(`${this.apiUrl}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              bookId: this.book.id.toString()
            }).subscribe({

              next: () => {

                this.isLoading = false;

                alert('Payment Successful 🎉');

                this.hasAccess = true;

                this.router.navigate(['/read', this.book.id]);
              },

              error: () => {
                this.isLoading = false;
                alert('Payment verification failed ❌');
              }
            });
          },

          modal: {
            ondismiss: () => {
              this.isLoading = false;
              console.log('Payment closed');
            }
          },

          prefill: {
            name: user.name,
            contact: user.phone
          },

          theme: {
            color: "#0f172a"
          }
        };

        const rzp = new (window as any).Razorpay(options);
        this.isLoading = false;
        rzp.open();
      },

      error: () => {
        this.isLoading = false;
        alert('Order creation failed ❌');
      }
    });
  }

  // 📖 READ BOOK
  readBook() {

    if (!this.hasAccess) {
      alert('Please purchase the book first ❌');
      return;
    }

    this.router.navigate(['/read', this.book.id]);
  }
}