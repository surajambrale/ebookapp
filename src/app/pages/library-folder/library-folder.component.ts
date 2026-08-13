import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLinkActive,
  RouterLink,
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';

@Component({
  selector: 'app-library-folder',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './library-folder.component.html',

  styleUrls: [
    './library-folder.component.scss'
  ]
})
export class LibraryFolderComponent implements OnInit {

  folderId = '';

  folder: any = null;

  subFolders: any[] = [];

  contents: any[] = [];

  hasAccess = false;

  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    this.folderId =
      this.route.snapshot.paramMap.get('id') || '';

    if (!this.folderId) {
      this.goToLibrary();
      return;
    }

    this.loadFolder();
  }

  // =====================================
  // LOAD FOLDER
  // =====================================

  loadFolder(): void {

    this.loading = true;

    this.http.get<any>(
      `/api/folders/detail/${this.folderId}`
    )
      .subscribe({

        next: (res) => {

          console.log(
            'FOLDER DETAIL:',
            res
          );

          this.folder =
            res.folder || null;

          this.subFolders =
            res.subFolders || [];

          this.contents =
            res.contents || [];

          this.hasAccess =
            res.hasAccess === true;

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'FOLDER LOAD ERROR:',
            error
          );

          this.loading = false;

          alert(
            'Unable to load folder'
          );

          this.goToLibrary();
        }

      });
  }

  // =====================================
  // OPEN SUB FOLDER
  // =====================================

  openSubFolder(folder: any): void {

    if (!folder?._id) {
      return;
    }

    this.router.navigate([
      '/library/folder',
      folder._id
    ]);
  }

  // =====================================
  // OPEN CONTENT
  // =====================================

  openContent(content: any): void {

    if (!this.hasAccess) {

      this.buyFolder();

      return;
    }

    console.log(
      'OPEN CONTENT:',
      content
    );

    /*
      Yaha tumhara existing PDF/video/note
      opening logic rahega.

      Old content code ko abhi remove mat karo.
    */
  }

  // =====================================
  // BUY FOLDER
  // =====================================

  buyFolder(): void {

    if (!this.folderId) {
      return;
    }

    console.log(
      'BUY FOLDER:',
      this.folderId
    );

    /*
      Yaha folder Razorpay purchase API connect hogi.

      Example:

      this.http.post(
        '/api/folder-purchase/create-order',
        {
          folderId: this.folderId
        }
      ).subscribe(...)

      Existing book Razorpay flow ko directly
      overwrite mat karna.
    */

  }

  // =====================================
  // BACK
  // =====================================

  goBack(): void {

    if (window.history.length > 1) {

      window.history.back();

      return;
    }

    this.goToLibrary();
  }

  // =====================================
  // LIBRARY
  // =====================================

  goToLibrary(): void {

    this.router.navigate([
      '/library'
    ]);
  }

}