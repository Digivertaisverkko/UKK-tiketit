import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MockComponent } from 'ng-mocks';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Routes } from '@angular/router';

import { BeginningButtonComponent } from './beginning-button.component';
import { TicketListComponent } from '@ticket/listing/ticket-list/ticket-list.component';
import { findEl } from '@shared/spec-helpers/element.spec-helper';
import { StoreService } from '@core/services/store.service';

describe('BeginningButtonComponent', () => {
  let component: BeginningButtonComponent;
  let fixture: ComponentFixture<BeginningButtonComponent>;
  let location: Location;
  let courseid: string;
  let store: StoreService;

  const routes: Routes = [
    { path: 'course/:courseid/list-tickets',
          component: MockComponent(TicketListComponent) },
  ];

  describe('Course 1', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ BeginningButtonComponent ],
        imports: [
          MatIconModule,
          MatIconTestingModule,
          RouterTestingModule.withRoutes(routes)
        ],
        providers: [
          Location,
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: {
                  get: (key: string) => {
                    if (key === 'courseid') {
                      return '1';
                    }
                    return null;
                  }
                }
              }
            }
          },
          StoreService
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(BeginningButtonComponent);
      location = TestBed.inject(Location);
      store = TestBed.inject(StoreService);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('routes to correct listing view when clicked', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      const button = findEl(fixture, 'beginning-button').nativeElement;
      button.click();
      tick();
      expect(location.path()).toBe(`/course/1/list-tickets`);
      flush();
    }));

    it('routes to correct listing view when getting logo clicked message', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      // Headerin logon klikkaus tekee tämän.
      store.sendMessage('go begin');
      tick();
      expect(location.path()).toBe(`/course/1/list-tickets`);
      flush();
    }));

  });

  describe('Course 2', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ BeginningButtonComponent ],
        imports: [
          MatIconModule,
          MatIconTestingModule,
          RouterTestingModule.withRoutes(routes)
        ],
        providers: [
          Location,
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: {
                  get: (key: string) => {
                    if (key === 'courseid') {
                      return '2';
                    }
                    return null;
                  }
                }
              }
            }
          }
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(BeginningButtonComponent);
      location = TestBed.inject(Location);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('routes to correct listing view when clicked', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      const button = findEl(fixture, 'beginning-button').nativeElement;
      button.click();
      tick();
      expect(location.path()).toBe(`/course/2/list-tickets`);
      flush();
    }));
  });


});
