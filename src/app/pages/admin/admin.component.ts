import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminComponent {


  selectedUser: string = '';
  selectedBook: string = '';
  selectedFolder: string = '';


  password = '';
  isLoggedIn = false;
  token = '';

  users: any[] = [];
  purchases: any[] = [];
  books: any[] = [];
  subscriptions: any[] = [];

  


  libraryFolders: any[] = [];
  grantAccessType: 'book' | 'folder' = 'book';
  grantDuration: number = 30;

  // 🔥 DROPDOWN
  selectedView = 'users';

  newSetting = {

    label: '',

    value: ''

  };

  // 🔥 SEARCH
  searchPhone = '';
  searchedPurchases: any[] = [];

  //testimonial code start
  testimonials: any[] = [];
  dynamicBooks: any[] = [];

  selectedPreviewImages: File[] = [];
  selectedLogo: File | null = null;


  currentPassword = '';

  newPassword = '';

  confirmPassword = '';

  isEditMode = false;

  editingBookId = '';

  searchBook = '';

  currentPage = 1;

  itemsPerPage = 10;



  //folder code start
  // =====================================
  // 📚 FOLDER MANAGEMENT
  // =====================================

  folders: any[] = [];

  currentFolderId: string | null = null;

  folderPath: any[] = [];

  // newFolderName = '';
  // newFolderDescription = '';
  newFolderName: string = '';
  newFolderDescription: string = '';

  newFolderSellingPrice: number = 0;
  newFolderOfferPrice: number = 0;


  showFolderForm = false;

  loadingFolders = false;

  // =====================================
  // 📚 CONTENT MANAGEMENT
  // =====================================

  contents: any[] = [];

  showContentForm = false;

  contentTitle = '';

  contentType = 'pdf';

  selectedContentFile: File | null = null;

  selectedThumbnailFile: File | null = null;

  uploadingContent = false;

  noteContent = '';


  //folder code end




  subscriptionSetting = {

    planName: '',

    price: 0,

    duration: 30,

    active: true

  };

  // appSetting: any = {

  //   appName: '',

  //   phone: '',

  //   whatsapp: '',

  //   email: '',

  //   instagram: '',

  //   facebook: '',

  //   youtube: '',

  //   website: '',

  //   version: ''

  // };

  appSetting: any = {
    settings: []
  };

  notificationSettings = {

    welcomeEmail: true,

    purchaseEmail: true,

    subscriptionReminder: true,

    expiryReminder: true,

    dailyMotivation: false,

    weeklyNewsletter: false,

    reminderTime: "09:00"

  };

  testEmail = "";

  coupon = {
    code: '',
    discountType: 'flat',
    discountValue: 0,
    minimumOrder: 0,
    expiryDate: '',
    usageLimit: 100,
    active: true
  };

  coupons: any[] = [];

  isCouponEdit = false;

  editingCouponId = '';

  // book upload code start

  // =============================
  // DYNAMIC BOOK UPLOAD
  // =============================

  newBook = {

    title: '',

    author: '',

    category: '',

    description: '',

    price: 0,

    originalPrice: 0

  };

  selectedCover!: File;

  selectedPdf!: File;

  // =============================
  // logo code start
  // =============================

  onLogoSelected(event: any) {

    if (event.target.files.length > 0) {

      this.selectedLogo = event.target.files[0];

    }

  }

  uploadLogo() {

    if (!this.selectedLogo) {

      alert("Please Select Logo");

      return;

    }

    const formData = new FormData();

    formData.append("image", this.selectedLogo);

    this.http.post<any>(

      `${this.api}/admin/upload-image`,

      formData

    ).subscribe({

      next: (res) => {

        this.appSetting.logo = res.image;

        alert("Logo Uploaded Successfully ✅");

      },

      error: (err) => {

        console.log(err);

      }

    });

  }



  // =============================
  // COVER IMAGE SELECT
  // =============================

  onCoverSelected(event: any) {

    this.selectedCover = event.target.files[0];

  }


  onPreviewSelected(event: any) {

    this.selectedPreviewImages =
      Array.from(event.target.files);

  }


  // =============================
  // PDF SELECT
  // =============================

  onPdfSelected(event: any) {

    this.selectedPdf = event.target.files[0];

  }

  // =============================
  // UPLOAD BOOK
  // =============================

  uploadBook() {

    const formData = new FormData();

    formData.append('title', this.newBook.title);

    formData.append('author', this.newBook.author);

    formData.append('category', this.newBook.category);

    formData.append('description', this.newBook.description);

    formData.append('price', this.newBook.price.toString());

    formData.append('originalPrice', this.newBook.originalPrice.toString());

    formData.append('cover', this.selectedCover);

    formData.append('pdf', this.selectedPdf);

    this.selectedPreviewImages.forEach(image => {

      formData.append('preview', image);

    });

    const headers = new HttpHeaders({

      Authorization: this.token

    });

    this.http.post(

      `${this.api}/admin/books/upload`,

      formData,

      { headers }

    ).subscribe({

      next: () => {

        alert('Book Uploaded Successfully ✅');

        this.loadData();

        this.newBook = {

          title: '',

          author: '',

          category: '',

          description: '',

          price: 0,

          originalPrice: 0

        };

      },

      error: (err) => {

        console.log(err);

        alert('Upload Failed ❌');

      }

    });

  }

  // book upload code end

  cancelEdit() {

    this.isEditMode = false;

    this.editingBookId = '';

    this.newBook = {

      title: '',

      author: '',

      category: '',

      description: '',

      price: 0,

      originalPrice: 0

    };

    this.selectedCover = undefined as any;

    this.selectedPdf = undefined as any;

    this.selectedPreviewImages = [];

  }


  //edit book code start 

  editBook(book: any) {

    this.isEditMode = true;

    this.editingBookId = book._id;

    this.newBook = {

      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      price: book.price,
      originalPrice: book.originalPrice

    };

  }

  //edit book code end 

  //load folder code start 

  // =====================================
  // LOAD FOLDERS
  // =====================================

  loadFolders(parentId: string | null = null) {

    this.loadingFolders = true;

    const url = parentId
      ? `${this.api}/folders/${parentId}`
      : `${this.api}/folders`;

    this.http.get<any[]>(url)
      .subscribe({

        next: (res) => {

          this.folders = res;

          this.currentFolderId = parentId;

          this.loadingFolders = false;

        },

        error: (err) => {

          console.log('Folder Load Error:', err);

          this.loadingFolders = false;

        }

      });

  }

  // =====================================
  // CREATE FOLDER
  // =====================================

 createFolder() {

  if (!this.newFolderName.trim()) {

    alert('Please enter folder name');

    return;

  }


  const data = {

    name: this.newFolderName.trim(),

    description: this.newFolderDescription,

    parentId: this.currentFolderId,

    // 💰 FOLDER PRICING
    sellingPrice: Number(this.newFolderSellingPrice) || 0,

    offerPrice: Number(this.newFolderOfferPrice) || 0

  };


  // ❌ Offer price selling price se zyada nahi hona chahiye

  if (
    data.offerPrice > 0 &&
    data.sellingPrice > 0 &&
    data.offerPrice > data.sellingPrice
  ) {

    alert(
      'Offer price cannot be greater than selling price ❌'
    );

    return;

  }


  this.http.post<any>(

    `${this.api}/folders`,

    data

  ).subscribe({

    next: (res) => {

      alert(
        'Folder Created Successfully ✅'
      );


      this.newFolderName = '';

      this.newFolderDescription = '';

      this.newFolderSellingPrice = 0;

      this.newFolderOfferPrice = 0;

      this.showFolderForm = false;


      this.loadFolders(
        this.currentFolderId
      );

    },

    error: (err) => {

      console.log(
        'Create Folder Error:',
        err
      );


      alert(

        err.error?.message ||

        'Folder creation failed ❌'

      );

    }

  });

}

  // =====================================
  // OPEN FOLDER
  // =====================================

  openFolder(folder: any) {

    this.folderPath.push({

      _id: folder._id,

      name: folder.name

    });


    this.loadFolders(folder._id);


    // 🔥 Load files inside folder

    this.loadContents(folder._id);


    this.showContentForm = false;

  }

  // =====================================
  // GO BACK
  // =====================================

  goBackFolder() {

    if (this.folderPath.length === 0) {

      this.loadFolders(null);

      return;

    }


    this.folderPath.pop();


    if (this.folderPath.length === 0) {

      this.loadFolders(null);

    } else {

      const parent =
        this.folderPath[
        this.folderPath.length - 1
        ];

      this.loadFolders(parent._id);

    }

  }

  // =====================================
  // DELETE FOLDER
  // =====================================

  deleteFolder(folder: any) {

    const confirmDelete = confirm(

      `Delete "${folder.name}" folder?`

    );


    if (!confirmDelete) {

      return;

    }


    this.http.delete<any>(

      `${this.api}/folders/${folder._id}`

    ).subscribe({

      next: (res) => {

        alert('Folder Deleted ✅');

        this.loadFolders(this.currentFolderId);

      },

      error: (err) => {

        console.log('Delete Folder Error:', err);

        alert(

          err.error?.message ||

          'Unable to delete folder ❌'

        );

      }

    });

  }


  onViewChange() {
    if (this.selectedView === 'library') {
      this.folderPath = [];
      this.currentFolderId = null;
      this.loadFolders(null);
    }
  }

  // =====================================
  // 📄 SELECT CONTENT FILE
  // =====================================

  onContentFileSelected(event: any) {

    const file = event.target.files?.[0];

    if (!file) {

      this.selectedContentFile = null;

      return;

    }


    this.selectedContentFile = file;

  }

  // =====================================
  // 🖼 SELECT THUMBNAIL
  // =====================================

  onThumbnailSelected(event: any) {

    const file = event.target.files?.[0];

    if (!file) {

      this.selectedThumbnailFile = null;

      return;

    }


    this.selectedThumbnailFile = file;

  }

  // =====================================
  // 📤 UPLOAD CONTENT
  // =====================================

  uploadContent() {

    if (!this.currentFolderId) {

      alert('Please open a folder first');

      return;

    }


    if (!this.contentTitle.trim()) {

      alert('Please enter content title');

      return;

    }


    // =====================================
    // NOTE
    // =====================================

    if (this.contentType === 'note') {

      if (!this.noteContent.trim()) {

        alert('Please enter note content');

        return;

      }


      const data = {

        title: this.contentTitle,

        folderId: this.currentFolderId,

        noteContent: this.noteContent

      };


      this.uploadingContent = true;


      this.http.post<any>(

        `${this.api}/content/note`,

        data

      ).subscribe({

        next: () => {

          alert('Note added successfully ✅');

          this.resetContentForm();

          this.loadContents(this.currentFolderId!);

        },

        error: (err) => {

          console.log(err);

          alert(

            err.error?.message ||

            'Note creation failed ❌'

          );

          this.uploadingContent = false;

        }

      });


      return;

    }


    // =====================================
    // PDF / VIDEO
    // =====================================

    if (!this.selectedContentFile) {

      alert('Please select a file');

      return;

    }


    const formData = new FormData();


    formData.append(

      'title',

      this.contentTitle

    );


    formData.append(

      'folderId',

      this.currentFolderId

    );


    formData.append(

      'type',

      this.contentType

    );


    formData.append(

      'file',

      this.selectedContentFile

    );


    if (this.selectedThumbnailFile) {

      formData.append(

        'thumbnail',

        this.selectedThumbnailFile

      );

    }


    this.uploadingContent = true;


    this.http.post<any>(

      `${this.api}/content/upload`,

      formData

    ).subscribe({

      next: (res) => {

        alert(

          res.message ||
          'Content uploaded successfully ✅'

        );


        this.resetContentForm();

        this.loadContents(

          this.currentFolderId!

        );

      },

      error: (err) => {

        console.log('Upload Error:', err);

        alert(

          err.error?.message ||

          'Upload failed ❌'

        );

        this.uploadingContent = false;

      }

    });

  }

  // =====================================
  // LOAD CONTENTS
  // =====================================

  loadContents(folderId: string) {

    this.http.get<any>(

      `${this.api}/content/folder/${folderId}`

    ).subscribe({

      next: (res) => {

        this.contents =
          res.contents || [];

      },

      error: (err) => {

        console.log(

          'Content Load Error:',

          err

        );

        this.contents = [];

      }

    });

  }

  // =====================================
  // 🗑 DELETE CONTENT
  // =====================================

  deleteContent(content: any) {

    const confirmDelete = confirm(

      `Delete "${content.title}"?`

    );


    if (!confirmDelete) {

      return;

    }


    this.http.delete<any>(

      `${this.api}/content/${content._id}`

    ).subscribe({

      next: () => {

        alert('Content deleted ✅');


        if (this.currentFolderId) {

          this.loadContents(

            this.currentFolderId

          );

        }

      },

      error: (err) => {

        console.log(err);

        alert(

          err.error?.message ||

          'Unable to delete content ❌'

        );

      }

    });

  }

  // =====================================
  // RESET CONTENT FORM
  // =====================================

  resetContentForm() {

    this.contentTitle = '';

    this.contentType = 'pdf';

    this.selectedContentFile = null;

    this.selectedThumbnailFile = null;

    this.noteContent = '';

    this.showContentForm = false;

    this.uploadingContent = false;

  }

  openContent(content: any) {

    if (!content) {
      return;
    }

    // PDF
    if (content.type === 'pdf') {

      window.open(
        content.url,
        '_blank'
      );

      return;
    }

    // Video
    if (content.type === 'video') {

      window.open(
        content.url,
        '_blank'
      );

      return;
    }

    // Note
    if (content.type === 'note') {

      alert(
        content.noteContent ||
        'No note content available'
      );

      return;
    }

  }





  //load folder code end 

  //sidebar setting code start

  getSetting(label: string): string {

    const item = this.appSetting.settings.find(
      (x: any) => x.label === label
    );

    return item ? item.value : '';

  }

  //sidebar setting code end

  //load coupon code start

  loadCoupons() {

    this.http.get<any[]>(`${environment.apiUrl}/coupon/all`)
      .subscribe({

        next: (res) => {

          this.coupons = res;

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  //load coupon code end

  //email sender code start

  loadNotificationSettings() {

    this.http.get<any>(`${this.api}/notification/settings`)
      .subscribe({

        next: (res) => {

          this.notificationSettings = res;

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  saveNotificationSettings() {

    this.http.post(

      `${this.api}/notification/settings`,

      this.notificationSettings

    )

      .subscribe({

        next: () => {

          alert("Notification Settings Saved ✅");

        },

        error: (err) => {

          console.log(err);

          alert("Save Failed ❌");

        }

      });

  }

  sendTestEmail() {

    if (!this.testEmail) {

      alert("Enter Email");

      return;

    }

    this.http.post(

      `${this.api}/notification/test-email`,

      {

        email: this.testEmail

      }

    )

      .subscribe({

        next: () => {

          alert("Test Email Sent ✅");

        },

        error: (err) => {

          console.log(err);

          alert("Email Failed ❌");

        }

      });

  }

  //email sender code end

  searchBooks() {

    if (!this.searchBook.trim()) {

      this.loadDynamicBooks();

      return;

    }

    this.http.get<any[]>(

      `${this.api}/admin/books/search?query=${this.searchBook}`

    ).subscribe({

      next: (res) => {

        this.dynamicBooks = res;

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  //update book code start

  updateBook() {

    const formData = new FormData();

    formData.append('title', this.newBook.title);

    formData.append('author', this.newBook.author);

    formData.append('category', this.newBook.category);

    formData.append('description', this.newBook.description);

    formData.append('price', this.newBook.price.toString());

    formData.append('originalPrice', this.newBook.originalPrice.toString());

    if (this.selectedCover) {

      formData.append('cover', this.selectedCover);

    }

    if (this.selectedPdf) {

      formData.append('pdf', this.selectedPdf);

    }

    this.selectedPreviewImages.forEach(image => {

      formData.append('preview', image);

    });

    const headers = new HttpHeaders({

      Authorization: this.token

    });

    this.http.put(

      `${this.api}/admin/books/update/${this.editingBookId}`,

      formData,

      { headers }

    ).subscribe({

      next: () => {

        alert('Book Updated Successfully ✅');

        this.isEditMode = false;

        this.editingBookId = '';

        this.loadData();

      },

      error: (err) => {

        console.log(err);

        alert('Update Failed ❌');

      }

    });

  }

  //update book code end


  //pagination code start

  get paginatedBooks() {

    const start = (this.currentPage - 1) * this.itemsPerPage;

    const end = start + this.itemsPerPage;

    return this.dynamicBooks.slice(start, end);

  }

  get totalPages() {

    return Math.ceil(

      this.dynamicBooks.length /

      this.itemsPerPage

    );

  }

  nextPage() {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

    }

  }

  previousPage() {

    if (this.currentPage > 1) {

      this.currentPage--;

    }

  }

  //pagination code end

  //create coupon code start

  createCoupon() {

    this.http.post(

      `${environment.apiUrl}/coupon/create`,

      this.coupon

    ).subscribe({

      next: (res: any) => {

        alert("Coupon Created Successfully ✅");

        this.loadCoupons();

        this.coupon = {

          code: '',

          discountType: 'flat',

          discountValue: 0,

          minimumOrder: 0,

          expiryDate: '',

          usageLimit: 100,

          active: true

        };

      },

      error: (err) => {

        console.log(err);

        alert(err.error.message);

      }

    });

  }

  editCoupon(coupon: any) {

    this.isCouponEdit = true;

    this.editingCouponId = coupon._id;

    this.coupon = {

      code: coupon.code,

      discountType: coupon.discountType,

      discountValue: coupon.discountValue,

      minimumOrder: coupon.minimumOrder,

      expiryDate: coupon.expiryDate.split('T')[0],

      usageLimit: coupon.usageLimit,

      active: coupon.active

    };

  }

  updateCoupon() {

    this.http.put(

      `${environment.apiUrl}/coupon/update/${this.editingCouponId}`,

      this.coupon

    ).subscribe({

      next: (res: any) => {

        alert("Coupon Updated Successfully ✅");

        this.loadCoupons();

        this.cancelCouponEdit();

      },

      error: (err) => {

        console.log(err);

        alert(err.error.message);

      }

    });

  }

  cancelCouponEdit() {

    this.isCouponEdit = false;

    this.editingCouponId = '';

    this.coupon = {

      code: '',

      discountType: 'flat',

      discountValue: 0,

      minimumOrder: 0,

      expiryDate: '',

      usageLimit: 100,

      active: true

    };

  }

  deleteCoupon(id: string) {

    if (!confirm("Delete this coupon?")) {

      return;

    }

    this.http.delete(

      `${environment.apiUrl}/coupon/delete/${id}`

    ).subscribe({

      next: () => {

        alert("Coupon Deleted ✅");

        this.loadCoupons();

      },

      error: (err) => {

        console.log(err);

        alert("Delete Failed");

      }

    });

  }

  //create coupon code end

  // admin password change code start

  changePassword() {

    const headers = new HttpHeaders({

      Authorization: this.token

    });

    this.http.put(

      `${this.api}/admin/change-password`,

      {

        currentPassword: this.currentPassword,

        newPassword: this.newPassword,

        confirmPassword: this.confirmPassword

      },

      { headers }

    )

      .subscribe({

        next: (res: any) => {

          alert(res.message);

          this.currentPassword = '';

          this.newPassword = '';

          this.confirmPassword = '';

        },

        error: (err) => {

          alert(err.error.message);

        }

      });

  }

  // admin password change code end


  // 🔥 LOAD TESTIMONIALS
  loadTestimonials() {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.get(`${this.api}/admin/testimonials`, { headers })

      .subscribe({

        next: (res: any) => {

          this.testimonials = res;

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  // 🔥 DELETE TESTIMONIAL
  deleteTestimonial(id: string) {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.delete(`${this.api}/admin/testimonial/${id}`, { headers })

      .subscribe({

        next: () => {

          alert('Testimonial Deleted ✅');

          this.loadTestimonials();

        },

        error: () => {

          alert('Delete Failed ❌');

        }

      });

  }

  // 🔥 EXPORT TESTIMONIAL CSV
  exportTestimonialsCSV() {

    let csvRows = [];

    csvRows.push([
      'Name',
      'Message',
      'Rating',
      'Date'
    ]);

    this.testimonials.forEach((t: any) => {

      csvRows.push([

        t.name || '',

        t.message || '',

        t.rating || '',

        new Date(t.createdAt).toLocaleDateString()

      ]);

    });

    const csvContent = csvRows
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'testimonials.csv';

    a.click();

  }
  //testimonial code end

  //app setting code start

  addSetting() {

    if (!this.newSetting.label || !this.newSetting.value) {

      alert("Please fill both fields");

      return;

    }

    this.appSetting.settings.push({

      label: this.newSetting.label,

      value: this.newSetting.value

    });

    this.newSetting = {

      label: '',

      value: ''

    };

  }

  removeSetting(index: number) {

    this.appSetting.settings.splice(index, 1);

  }

  //app setting code end

  // 🔥 ANALYTICS
  totalRevenue = 0;
  todayRevenue = 0;
  weeklyRevenue = 0;
  monthlyRevenue = 0;

  topSellingBook = '';
  topSellingCount = 0;

  api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // 🔐 LOGIN
  login() {

    const cleanPassword = this.password.trim();

    this.http.post(`${this.api}/admin-login`, {
      password: cleanPassword
    })

      .subscribe({

        next: (res: any) => {

          this.token = res.token;

          this.isLoggedIn = true;

          this.loadData();

        },

        error: () => {

          alert('Wrong password ❌');

        }

      });

  }

  // 🔥 LOAD DATA
  loadData() {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    // 🔥 LIBRARY FOLDERS
    this.http.get<any[]>(`${this.api}/folders`, { headers })
      .subscribe({

        next: (res) => {

          this.libraryFolders = res || [];

          console.log(
            '📂 Library Folders Loaded:',
            this.libraryFolders
          );

        },

        error: (error) => {

          console.error(
            '❌ Failed to load library folders:',
            error
          );

          this.libraryFolders = [];

        }

      });

    // 🔥 USERS
    this.http.get(`${this.api}/admin/users`, { headers })

      .subscribe((res: any) => {

        this.users = res;

      });

    // 🔥 LIBRARY FOLDERS
    this.http.get<any>(`${this.api}/folders`, { headers })
      .subscribe({
        next: (res) => {

          this.libraryFolders = Array.isArray(res)
            ? res
            : (res.folders || res.data || []);

          console.log('📂 Library Folders:', this.libraryFolders);

        },

        error: (error) => {

          console.error(
            '❌ Failed to load library folders:',
            error
          );

          this.libraryFolders = [];

        }
      });

    // 🔥 BOOKS FIRST
    this.http.get(`${this.api}/admin/books`, { headers })

      .subscribe((booksRes: any) => {

        this.books = booksRes;

        // 🔥 PURCHASES AFTER BOOKS
        this.http.get(`${this.api}/admin/purchases`, { headers })

          .subscribe((purchaseRes: any) => {

            this.purchases = purchaseRes;

            // Testimonials
            this.loadTestimonials();

            // Subscription
            this.loadSubscriptions();

            // Dynamic Books
            this.http.get<any>(`${this.api}/books/all`)
              .subscribe(res => {

                this.dynamicBooks = res.books || [];

                this.books = [
                  ...this.books,
                  ...this.dynamicBooks
                ];

                // ✅ Ab analytics chalao
                this.calculateAnalytics();

                //subscription setting code
                this.loadSubscriptionSetting();

                this.loadAppSetting();

                this.loadNotificationSettings();

                this.loadCoupons();

              });





          });





      });



  }

  // 🔥 ANALYTICS
  // 🔥 ANALYTICS
  calculateAnalytics() {

    this.totalRevenue = 0;
    this.todayRevenue = 0;
    this.weeklyRevenue = 0;
    this.monthlyRevenue = 0;

    const today = new Date();

    const topBooks: any = {};

    this.purchases.forEach((p: any) => {

      // 🔥 BOOK PRICE
      const amount = this.getBookAmount(p.bookId);

      // 🔥 TOTAL REVENUE
      this.totalRevenue += amount;

      // 🔥 PURCHASE DATE
      const purchaseDate = new Date(p.createdAt);

      // 🔥 INVALID DATE CHECK
      if (isNaN(purchaseDate.getTime())) {
        return;
      }

      // 🔥 TODAY REVENUE
      const isToday =
        purchaseDate.getDate() === today.getDate() &&
        purchaseDate.getMonth() === today.getMonth() &&
        purchaseDate.getFullYear() === today.getFullYear();

      if (isToday) {
        this.todayRevenue += amount;
      }

      // 🔥 WEEKLY REVENUE
      const diffTime =
        today.getTime() - purchaseDate.getTime();

      const diffDays =
        diffTime / (1000 * 60 * 60 * 24);

      if (diffDays >= 0 && diffDays <= 7) {
        this.weeklyRevenue += amount;
      }

      // 🔥 MONTHLY REVENUE
      const isCurrentMonth =
        purchaseDate.getMonth() === today.getMonth() &&
        purchaseDate.getFullYear() === today.getFullYear();

      if (isCurrentMonth) {
        this.monthlyRevenue += amount;
      }

      // 🔥 TOP SELLING
      topBooks[p.bookId] =
        (topBooks[p.bookId] || 0) + 1;

    });

    // 🔥 FIND TOP BOOK
    let max = 0;
    let topId: any = null;

    for (const id in topBooks) {

      if (topBooks[id] > max) {

        max = topBooks[id];
        topId = id;

      }

    }

    // 🔥 FIND BOOK
    // 🔥 NO SALES
    if (!topId || max === 0) {

      this.topSellingBook = 'No Data';

      this.topSellingCount = 0;

    } else {

      const book = this.books.find(

        (b: any) =>

          (b.id?.toString() === topId.toString()) ||

          (b._id?.toString() === topId.toString())

      );

      this.topSellingBook =
        book?.title ||
        book?.name ||
        'No Data';

      this.topSellingCount = max;

    }

    // 🔥 DEBUG LOGS
    console.log('TODAY:', this.todayRevenue);
    console.log('WEEKLY:', this.weeklyRevenue);
    console.log('MONTHLY:', this.monthlyRevenue);

  }

  // 🔥 GET BOOK NAME
  getBookName(id: string) {

    const book = this.books.find(

      (b: any) =>

        (b.id?.toString() === id.toString()) ||

        (b._id?.toString() === id.toString())

    );

    return book?.title || book?.name || "Unknown";

  }

  // 🔥 GET BOOK AMOUNT
  getBookAmount(id: string) {

    const book = this.books.find(

      (b: any) =>

        (b.id?.toString() === id.toString()) ||

        (b._id?.toString() === id.toString())

    );

    return Number(book?.price || 0);

  }

  // 🔥 SEARCH USER
  searchUser() {

    if (!this.searchPhone) {

      this.searchedPurchases = [];

      return;

    }

    this.searchedPurchases =

      this.purchases.filter((p: any) =>

        p.userPhone?.includes(this.searchPhone)

      );

  }

  // 🔥 EXPORT CSV
  exportCSV() {

    let csvRows = [];

    // 🔥 HEADERS
    csvRows.push([

      'Name',
      'Phone',
      'Book ID',
      'Book Name',
      'Amount',
      'Payment ID'

    ]);

    // 🔥 DATA
    this.purchases.forEach((p: any) => {

      let amount = Number(p.amount || 0);

      if (!amount || amount === 0) {

        amount = this.getBookAmount(p.bookId);

      }

      csvRows.push([

        p.userName || '',

        p.userPhone || '',

        p.bookId || '',

        this.getBookName(p.bookId),

        amount,

        p.paymentId || ''

      ]);

    });

    // 🔥 CSV
    const csvContent = csvRows

      .map(e => e.join(','))

      .join('\n');

    // 🔥 DOWNLOAD
    const blob = new Blob([csvContent], {

      type: 'text/csv;charset=utf-8;'

    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'purchases.csv';

    a.click();

  }

  deleteBook(id: string) {

    if (!confirm("Delete this book?")) {

      return;

    }

    this.http.delete(`${this.api}/admin/books/delete/${id}`)

      .subscribe({

        next: () => {

          alert("Book Deleted Successfully");

          this.loadDynamicBooks();

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  // app setting code start

  loadAppSetting() {

    this.http.get<any>(`${this.api}/app-setting`)
      .subscribe({

        next: (res) => {

          this.appSetting = res;

          this.appSetting.phone = this.getSetting("Phone");
          this.appSetting.email = this.getSetting("Email");
          this.appSetting.whatsapp = this.getSetting("WhatsApp");
          this.appSetting.instagram = this.getSetting("Instagram");
          this.appSetting.facebook = this.getSetting("Facebook");
          this.appSetting.youtube = this.getSetting("Youtube");
          this.appSetting.website = this.getSetting("Website");
          this.appSetting.telegram = this.getSetting("Telegram");
          this.appSetting.linkedin = this.getSetting("LinkedIn");

        },

        error: (err) => {

          console.log(err);

        }



      });

  }



  saveAppSetting() {

    this.http.put(

      `${this.api}/app-setting`,

      this.appSetting

    ).subscribe({

      next: () => {

        alert("App Settings Updated ✅");

      },

      error: (err) => {

        console.log(err);

      }

    });

  }



  //app setting code end

  // 🔥 GRANT ACCESS
  grantAccess(): void {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.post(
      `${this.api}/admin/grant-access`,
      {
        userId: this.selectedUser,
        bookId: this.selectedBook
      },
      { headers }
    ).subscribe({

      next: () => {

        alert('Book Access Granted ✅');

        this.loadData();

      },

      error: (error) => {

        console.error(error);

        alert('Already Granted ❌');

      }

    });

  }

  // 🔥 GRANT FOLDER ACCESS
  grantFolderAccess(): void {

    if (!this.selectedUser || !this.selectedFolder) {

      alert('Please select user and folder');

      return;

    }

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.post(
      `${this.api}/api/folder-access/grant`,
      {
        userId: this.selectedUser,
        folderId: this.selectedFolder,
        durationDays: 30
      },
      { headers }
    )
      .subscribe({

        next: (res: any) => {

          console.log(
            'FOLDER ACCESS GRANTED:',
            res
          );

          alert(
            'Folder access granted successfully ✅'
          );

          this.selectedFolder = '';

          this.loadData();

        },

        error: (error) => {

          console.error(
            'Folder access error:',
            error
          );

          alert(
            error?.error?.message ||
            'Failed to grant folder access ❌'
          );

        }

      });

  }


  loadDynamicBooks() {

    this.http.get<any[]>(`${this.api}/books/all`)
      .subscribe({

        next: (res) => {

          this.dynamicBooks = res;

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  // 🔥 DELETE USER
  deleteUser(id: string) {

    const headers = new HttpHeaders({

      Authorization: this.token

    });

    this.http.delete(`${this.api}/admin/user/${id}`, { headers })

      .subscribe(() => {

        alert('User Deleted ✅');

        this.loadData();

      });

  }

  // 🔥 DELETE PURCHASE
  deletePurchase(id: string) {

    const headers = new HttpHeaders({

      Authorization: this.token

    });

    this.http.delete(`${this.api}/admin/purchase/${id}`, { headers })

      .subscribe(() => {

        alert('Purchase Deleted ✅');

        this.loadData();

      });

  }

  loadSubscriptions() {

    const headers = new HttpHeaders({

      Authorization: this.token

    });

    this.http.get<any[]>(

      `${this.api}/subscription/all`,

      { headers }

    )

      .subscribe({

        next: (res) => {

          this.subscriptions = res;

          console.log("Subscriptions", res);

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  // subscription setting code start

  loadSubscriptionSetting() {

    this.http.get<any>(

      `${this.api}/subscription-setting`

    ).subscribe({

      next: (res) => {

        if (res) {

          this.subscriptionSetting = res;

        }

      },

      error: (err) => {

        console.log(err);

      }

    });

  }


  updateSubscriptionSetting() {

    this.http.put(

      `${this.api}/subscription-setting`,

      this.subscriptionSetting

    ).subscribe({

      next: () => {

        alert('Subscription Settings Updated Successfully ✅');

      },

      error: (err) => {

        console.log(err);

        alert('Update Failed ❌');

      }

    });

  }
  //subscription setting code end

  // 🔓 LOGOUT
  logout() {

    this.isLoggedIn = false;

    this.token = '';

    this.password = '';

  }

  deleteSubscription(id: string) {

    if (!confirm("Delete Subscription?")) return;

    const headers = new HttpHeaders({

      Authorization: this.token

    });

    this.http.delete(

      `${this.api}/subscription/delete/${id}`,

      { headers }

    )

      .subscribe({

        next: () => {

          alert("Subscription Deleted ✅");

          this.loadSubscriptions();

        },

        error: (err) => {

          console.log(err);

          alert("Delete Failed");

        }

      });

  }

}