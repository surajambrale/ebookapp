import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-read-book',
  standalone: true,
  templateUrl: './read-book.component.html'
})
export class ReadBookComponent {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const user = this.auth.getUser();
    const bookId = this.route.snapshot.params['id'];

    this.http.get(`http://localhost:5000/check/${user._id}/${bookId}`)
      .subscribe((res: any) => {

        if (!res.access) {
          alert('Access Denied!');
          this.router.navigate(['/']);
        }
      });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}