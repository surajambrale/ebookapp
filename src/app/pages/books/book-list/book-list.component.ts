import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent {
  api = environment.apiUrl;

  constructor(private router: Router,
    private http: HttpClient
  ) { }

  subscriptionActive = false;

  subscribeNow() {

    if (this.subscriptionActive) {

      alert("Your Subscription is Active ✅");

      return;

    }

    const token = localStorage.getItem('token');

    if (!token) {

      alert('Please login first.');

      this.router.navigate(['/login']);

      return;

    }

    this.router.navigate(['/subscription']);

  }

  books = [
    {
      id: 1,
      title: "Complete Fat Loss Guide",
      category: "Fat Loss",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 49,              // 🔥 offer price
      originalPrice: 399,      // 🔥 cut price
      reviews: 24,
      image: "assets/images/fatloss-book.jpeg",
      description: "Welcome to the Complete Fitness & Nutrition program..."
    },
    {
      id: 2,
      title: "1500-Calorie Diet Plan",
      category: "Diet",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 49,
      originalPrice: 299,
      reviews: 19,
      image: "assets/images/1500-cal-diet.jpg",
      description: "Healthy Diet Plan for Regular People Who Want to Stay Fit"
    },
    {
      id: 3,
      title: "Habits That Change Your Life",
      category: "Workout",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 49,
      originalPrice: 199,
      reviews: 30,
      image: "assets/images/habits.jpg",
      description: "Small habits. Big changes. Build discipline, grow daily, and transform your life."
    },
    {
      id: 4,
      title: "Begginer Guide",
      category: "Workout",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 49,
      originalPrice: 399,
      reviews: 21,
      image: "assets/images/beginner-guide.jpg",
      description: "Complete beginner Guide..."
    },
    {
      id: 5,
      title: "Diabetes Control",
      category: "Diet",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 49,
      originalPrice: 499,
      reviews: 34,
      image: "assets/images/diabetes-control.jpg",
      description: "Control your diabetes..."
    },
    {
      id: 6,
      title: "PCOD / PCOS Guide",
      category: "Diet",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 49,
      originalPrice: 499,
      reviews: 35,
      image: "assets/images/pcod.jpg",
      description: "A Complete Guide for Women to Balance Hormones Naturally."
    },
    {
      id: 7,
      title: "Admin Testing Book",
      category: "Muscle Gain",
      author: "Admin",
      price: 1,
      originalPrice: 0,
      reviews: 0,
      image: "assets/images/admin-testing-book.jpg",
      description: "A Complete Guide for Women to Balance Hormones Naturally."
    }

  ];

  // openBook(id: number) {
  //   this.router.navigate(['/book', id]);
  // }

  //  dynamic book code start
 loadBooks() {

  // Hardcoded books ka backup
  const staticBooks = [...this.books];

  this.http.get<any[]>(`${this.api}/books/all`)
    .subscribe({

      next: (res) => {

        // Hardcoded + Dynamic books merge
        this.books = [
          ...staticBooks,
          ...res
        ];

        this.filteredBooks = this.books;

      },

      error: (err) => {

        console.log(err);

      }

    });

}

  // dynamic book code end


  // 🔥 FILTERED BOOKS
  filteredBooks: any[] = [];



  // 🔥 ON INIT
  ngOnInit() {
    this.filteredBooks = this.books;

    this.loadBooks();
   


    // 🔥 LOAD TESTIMONIALS
    this.loadTestimonials();


    this.checkSubscription();

  }



  // 🔥 OPEN BOOK
  openBook(id: number) {
    this.router.navigate(['/book', id]);
  }



  // 🔥 CATEGORY FILTER
  filterCategory(category: string) {

    this.filteredBooks = this.books.filter(
      (book: any) => book.category === category
    );

  }



  // 🔥 SHOW ALL BOOKS
  showAllBooks() {
    this.filteredBooks = this.books;
  }

  checkSubscription() {

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) return;

    this.http.get<any>(
      `${this.api}/subscription/status/${user._id}`
    ).subscribe({

      next: (res) => {

        this.subscriptionActive = res.subscribed;

      },

      error: (err) => {

        console.log(err);

      }

    });

  }



  //testimonial code start

  // 🔥 TESTIMONIAL FORM
  testimonialName = '';
  testimonialMessage = '';
  testimonialRating = 5;

  // 🔥 TESTIMONIAL LIST
  testimonials: any[] = [];

  // 🔥 LOAD TESTIMONIALS
  loadTestimonials() {

    this.http.get(`${this.api}/testimonials`)
      .subscribe({

        next: (res: any) => {

          this.testimonials = res;

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  // 🔥 SUBMIT TESTIMONIAL
  submitTestimonial() {

    if (
      !this.testimonialName ||
      !this.testimonialMessage
    ) {

      alert('Please fill all fields ❌');
      return;

    }

    this.http.post(`${this.api}/testimonial`, {

      name: this.testimonialName,

      message: this.testimonialMessage,

      rating: this.testimonialRating

    })

      .subscribe({

        next: () => {

          alert('Feedback Submitted ✅');

          // RESET
          this.testimonialName = '';
          this.testimonialMessage = '';
          this.testimonialRating = 5;

          // RELOAD
          this.loadTestimonials();

        },

        error: () => {

          alert('Error submitting feedback ❌');

        }

      });

  }


  // 🔥 TESTIMONIAL robot code

  scrollToTestimonial() {

    const section =
      document.getElementById(
        'testimonial-section'
      );

    if (section) {

      section.scrollIntoView({

        behavior: 'smooth'

      });

    }

  }

  //testimonial code end

  //Ai bot start


  isBotOpen = false;

  messages: any[] = [
    {
      text: '👋 Welcome to Fitness Assistant',
      type: 'bot'
    },
    {
      text: 'Are you Male or Female?',
      type: 'bot'
    }
  ];

  step = 1;

  userInput = '';

  gender = '';
  age: any;
  weight: any;
  height: any;

  goal = 'fatloss';

  toggleBot() {
    this.isBotOpen = !this.isBotOpen;
  }

  nextStep() {

    // 🔥 USER MESSAGE SHOW
    if (this.userInput) {
      this.messages.push({
        text: this.userInput,
        type: 'user'
      });
    }

    // STEP 1
    if (this.step === 1) {

      this.gender = this.userInput;

      this.messages.push({
        text: 'Enter your age',
        type: 'bot'
      });

      this.userInput = '';
      this.step++;
    }

    // STEP 2
    else if (this.step === 2) {

      this.age = Number(this.userInput);

      this.messages.push({
        text: 'Enter your weight in KG',
        type: 'bot'
      });

      this.userInput = '';
      this.step++;
    }

    // STEP 3
    else if (this.step === 3) {

      this.weight = Number(this.userInput);

      this.messages.push({
        text: 'Enter your height in CM',
        type: 'bot'
      });

      this.userInput = '';
      this.step++;
    }

    // STEP 4
    else if (this.step === 4) {

      this.height = Number(this.userInput);

      this.messages.push({
        text: 'Select your goal below',
        type: 'bot'
      });

      this.userInput = '';
      this.step++;
    }

    // STEP 5
    else if (this.step === 5) {

      let calories = 0;

      // MAINTENANCE CALORIES
      if (this.gender.toLowerCase() === 'male') {

        calories =
          (10 * this.weight) +
          (6.25 * this.height) -
          (5 * this.age) + 5;

      } else {

        calories =
          (10 * this.weight) +
          (6.25 * this.height) -
          (5 * this.age) - 161;
      }

      calories = calories * 1.55;

      let targetCalories = calories;

      if (this.goal === 'fatloss') {
        targetCalories = calories - 400;
      }

      if (this.goal === 'musclegain') {
        targetCalories = calories + 300;
      }

      this.messages.push({
        text: `🔥 Maintenance Calories: ${Math.round(calories)}`,
        type: 'bot'
      });

      this.messages.push({
        text: `🎯 Goal Calories: ${Math.round(targetCalories)}`,
        type: 'bot'
      });

      this.messages.push({
        text: `📞 Need Personal Training?\nContact Coach: 9372336433`,
        type: 'bot'
      });

      this.messages.push({
        text: `✅ Thank You`,
        type: 'bot'
      });

      this.step++;
    }

  }

  //Ai bot end

  // 🔥 BOTTOM NAVIGATION

  goHome() {
    this.router.navigate(['/']);
  }

  goExplore() {
    this.router.navigate(['/explore']);
  }

  goMyBooks() {
    this.router.navigate(['/my-books']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }
}

