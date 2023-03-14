import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getIsInIframe } from 'src/app/ticket/functions/isInIframe';
import { TicketService } from 'src/app/ticket/ticket.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private courseId: string | null;
  public courseName: string = '';
  public isLoaded: boolean = false;
  public isInIframe: boolean = getIsInIframe();
  public isRemovePressed: boolean = false;
  public userEmail: string = '';
  public userName: string = '';

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService
  ) {
    this.courseId = this.route.snapshot.paramMap.get('courseid');
  }

  ngOnInit(): void {
    if (this.courseId !== null) {
      this.ticketService.getCourseName(this.courseId).then(response => {
        this.courseName = response;
      });
    } else {
      throw new Error('Kurssi ID puuttuu URL:sta.');
    }
    this.isLoaded = true;
  }

  public changeRemoveButton(): void {
    setTimeout(() => this.isRemovePressed = true, 300);
  }

  public downloadPersonalData(): void {
    console.log("Datan lataaminen pyydetty");
  }

  public removeProfile(): void {
    console.log("Profiilin poistoa pyydetty");
  }

}
