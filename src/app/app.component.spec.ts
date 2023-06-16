import { TestBed } from '@angular/core/testing';
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

describe('AppComponent', () => {
  let fakeAuthService: jasmine.SpyObj<AuthService>;

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
        { provide: AuthService, useValue: fakeAuthService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
