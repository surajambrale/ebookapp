import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule,RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  @Input() isOpen = false;

  @Input() closeSidebar!: () => void;

  API = environment.apiUrl;

  appSetting: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {

    this.loadAppSetting();

  }

  getSetting(label: string): string {

  const item = this.appSetting?.settings?.find(
    (x: any) => x.label === label
  );

  return item ? item.value : '';

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

}
