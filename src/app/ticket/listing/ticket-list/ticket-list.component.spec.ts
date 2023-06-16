import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';

import { TicketListComponent } from './ticket-list.component';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';
import { TicketService } from '@ticket/ticket.service';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';

describe('TicketListComponent', () => {
  let component: TicketListComponent;
  let fakeTicketService: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<TicketListComponent>;

  beforeEach(async () => {
    fakeTicketService = jasmine.createSpyObj('TicketService', {
      getTicketList: undefined
    });

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(SearchBarComponent),
        TicketListComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatSortModule,
        MatTableModule,
        RouterTestingModule
      ],
      providers: [
        { provide: TicketService, useValue: fakeTicketService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
