import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {

  constructor(private http: HttpClient, private router: Router) {}

  canActivate() {

    const token = localStorage.getItem('adminToken');

    if (!token) {
      this.router.navigate(['/admin-login']);
      return false;
    }

    const headers = new HttpHeaders({ Authorization: token });

    return this.http.get(`${environment.apiUrl}/admin-verify`, { headers })
      .pipe(
        map(() => true),
        catchError(() => {
          localStorage.removeItem('adminToken');
          this.router.navigate(['/admin-login']);
          return of(false);
        })
      );
  }
}