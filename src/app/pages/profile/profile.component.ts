import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  constructor(private router: Router) {}

  user = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  logout() {

    localStorage.clear();

    this.router.navigate(['/']);
  }

}