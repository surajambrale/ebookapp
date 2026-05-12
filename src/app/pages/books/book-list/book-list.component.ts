import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent {

  constructor(private router: Router) {}

  books = [
    {
    id: 1,
    title: "Complete Fat Loss Guide",
    author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
    price: 99,              // 🔥 offer price
    originalPrice: 399,      // 🔥 cut price
    reviews: 24,
    image: "assets/images/fatloss-book.jpeg",
    description: "Welcome to the Complete Fitness & Nutrition program..."
  },
    {
      id: 2,
      title: "1500-Calorie Diet Plan",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 99,
      originalPrice: 299,
      reviews: 19,
      image: "assets/images/1500-cal-diet.jpg",
      description: "Healthy Diet Plan for Regular People Who Want to Stay Fit"
    },
     {
      id: 3,
      title: "Habits That Change Your Life",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 99,
      originalPrice: 199, 
      reviews: 30,
      image: "assets/images/habits.jpg",
      description: "Small habits. Big changes. Build discipline, grow daily, and transform your life."
    },
    {
      id: 4,
      title: "Begginer Guide",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 99,
      originalPrice: 399, 
      reviews: 21,
      image: "assets/images/beginner-guide.jpg",
      description: "Complete beginner Guide..."
    },
    {
      id: 5,
      title: "Diabetes Control",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 99,
      originalPrice: 499, 
      reviews: 34,
      image: "assets/images/diabetes-control.jpg",
      description: "Control your diabetes..."
    },
    {
      id: 6,
      title: "PCOD / PCOS Guide",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 99,
      originalPrice: 499, 
      reviews: 35,
      image: "assets/images/pcod.jpg",
      description: "A Complete Guide for Women to Balance Hormones Naturally."
    },
     {
      id: 7,
      title: "Admin Testing Book",
      author: "Admin",
      price: 1,
      originalPrice: 0, 
      reviews: 0,
      image: "assets/images/admin-testing-book.jpg",
      description: "A Complete Guide for Women to Balance Hormones Naturally."
    }
   
  ];

  openBook(id: number) {
    this.router.navigate(['/book', id]);
  }



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
}

