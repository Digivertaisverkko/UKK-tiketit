import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from "@angular/router/testing";
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { StoreService } from '@core/services/store.service';
import { UsermenuComponent } from '@core/usermenu/usermenu.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fakeStoreService: jasmine.SpyObj<StoreService>;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    fakeStoreService = jasmine.createSpyObj('StoreService', {
      sendMessage: undefined,
      trackUserInfo: of('')
    });

    await TestBed.configureTestingModule({
      declarations: [
        HeaderComponent,
        MockComponent(UsermenuComponent)
      ],
      imports: [
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        RouterTestingModule
      ],
      providers: [
        { provide: StoreService, useValue: fakeStoreService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
