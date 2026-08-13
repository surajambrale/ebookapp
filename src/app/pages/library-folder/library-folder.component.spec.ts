import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryFolderComponent } from './library-folder.component';

describe('LibraryFolderComponent', () => {
  let component: LibraryFolderComponent;
  let fixture: ComponentFixture<LibraryFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryFolderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibraryFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
