import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
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
    CommonModule
  ],

  templateUrl:
    './library-folder.component.html',

  styleUrls: [
    './library-folder.component.scss'
  ]
})
export class LibraryFolderComponent
  implements OnInit {


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

  ) {}


  ngOnInit(): void {

    this.folderId =
      this.route.snapshot.paramMap
        .get('id') || '';

    this.loadFolder();

  }


  loadFolder(): void {

    this.loading = true;


    this.http.get<any>(
      `/api/folders/${this.folderId}`
    )
    .subscribe({

      next: (res) => {

        this.folder =
          res.folder;

        this.subFolders =
          res.subFolders || [];

        this.contents =
          res.contents || [];

        this.hasAccess =
          res.hasAccess;

        this.loading = false;

      },

      error: (error) => {

        console.error(
          'FOLDER LOAD ERROR:',
          error
        );

        this.loading = false;

      }

    });

  }


  openSubFolder(
    folder: any
  ): void {

    this.router.navigate([
      '/library/folder',
      folder._id
    ]);

  }


  openContent(
    content: any
  ): void {

    if (!this.hasAccess) {

      this.buyFolder();

      return;

    }

    // Existing content opening logic
    // yahan apna existing method/service use karo.

  }


  buyFolder(): void {

    /*
      Existing Razorpay purchase flow
      yahan connect karenge.
    */

    console.log(
      'BUY FOLDER:',
      this.folderId
    );

  }


  goBack(): void {

    this.router.navigate([
      '/library'
    ]);

  }


  goToLibrary(): void {

    this.router.navigate([
      '/library'
    ]);

  }

}