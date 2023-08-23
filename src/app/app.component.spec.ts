import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';

import { AppComponent } from './app.component';
import { FooterComponent } from '@core/footer/footer.component';
import { AuthService } from '@core/services/auth.service';
import { UsermenuComponent } from '@core/usermenu/usermenu.component';
import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { initializeLanguage } from './app.initializers';

fdescribe('AppComponent', () => {
  let component: AppComponent;
  let fakeAuthService: jasmine.SpyObj<AuthService>;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    fakeAuthService = jasmine.createSpyObj('CourseService', {
      initialize: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockComponent(FooterComponent),
        MockComponent(UsermenuComponent)
      ],
      imports: [
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        MatTooltipModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        {
          provide: APP_INITIALIZER,
          useFactory: () => initializeLanguage,
          multi: true
        },
        { provide: LOCALE_ID, useValue: 'fi' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    localStorage.clear();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  // Ei toimi vielä. Huomaa upotuksen ja asettaa silloin kielen enkuksi.
  /*
  it('should use default language if localStorage language is not set', () => {
    expect(component.language).toEqual('fi-FI');
  });
  */

});
