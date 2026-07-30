import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isSidebarOpen = signal(false);
  isScrolled = signal(false);
  isMobile = signal(window.innerWidth <= 768);
  API = environment.apiUrl;

  appSetting: any = {};
  

  constructor(private http: HttpClient) {}

  ngOnInit() {

  this.loadAppSetting();

}



loadAppSetting() {

  this.http.get<any>(`${this.API}/app-setting`)
    .subscribe({

      next: (res) => {

        this.appSetting = res;

      },

      error: (err) => {

        console.log(err);

      }

    });

}

  // toggleSidebar() {
  //   if (this.isMobile()) {
  //     this.isSidebarOpen.update(value => !value);
  //   }
  // }

  toggleSidebar() {

  this.isSidebarOpen.update(value => !value);

}

  closeSidebar = () => {
    this.isSidebarOpen.set(false);
  };

  @HostListener('window:resize', [])
  onResize() {
    this.isMobile.set(window.innerWidth <= 768);
    if (!this.isMobile()) {
      this.isSidebarOpen.set(false); // auto-close if switched to desktop
    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.isScrolled.set(scrollY > 10);
  }

}


