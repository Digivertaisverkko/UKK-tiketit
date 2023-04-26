import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { Constants, getIsInIframe } from '../../shared/utils';
import { TicketService } from 'src/app/ticket/ticket.service';
import { Title } from '@angular/platform-browser';
import { UserManagementService } from 'src/app/user-management/user-management.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private courseId: string | null;
  public courseName: string = '';
  public errorMessage: string = '';
  public isLoaded: boolean = false;
  public isInIframe: boolean = getIsInIframe();
  public isRemovePressed: boolean = false;
  public userEmail: string = '';
  public userName: string = '';

  constructor(private authService: AuthService,
              private renderer: Renderer2,
              private route: ActivatedRoute,
              private ticketService: TicketService,
              private titleServ: Title,
              private userManagementService: UserManagementService) {
    this.courseId = this.route.snapshot.paramMap.get('courseid');
  }

  ngOnInit(): void {
    this.startLoading();
    this.titleServ.setTitle(Constants.baseTitle + $localize `:@@Profiili:Profiili`);
    if (this.courseId !== null) {
      this.ticketService.getCourseName(this.courseId).then(response => {
        this.courseName = response;
      });
    } else {
      throw new Error('Kurssi ID puuttuu URL:sta.');
    }
    this.userManagementService.getPersonalInfo().then(response => {
      this.userName = response.nimi;
      this.userEmail = response.sposti;
    });
    this.stopLoading();
  }

  public changeRemoveButton(): void {
    setTimeout(() => this.isRemovePressed = true, 300);
  }

  public downloadPersonalData(): void {
    this.userManagementService.getGdprData().then(response => {
      let gdprData = JSON.stringify(response, null, 2);
      const link = this.renderer.createElement('a');
      link.setAttribute('target', '_blank');
      link.setAttribute(
          'href',
          "data:text/json;charset=UTF-8," + encodeURIComponent(gdprData));
      link.setAttribute('download', 'datadump.json');
      link.click();
      link.remove();
    }).catch(error => {
      this.errorMessage = $localize `:@@Tiedoston lataaminen epäonnistui:Tiedoston lataaminen epäonnistui` + '.';
    });
  }

  public removeProfile(): void {
    this.userManagementService.removeUser().then(response => {
      if (response) {
        this.authService.handleNotLoggedIn();
      } else {
        throw new Error;
      }
    }).catch(error => {
      this.errorMessage = $localize `:@@Profiilin poistaminen epäonnistui:Profiilin poistaminen epäonnistui` + '.';
    });
  }

  private startLoading() {
    this.isLoaded = false;
    this.store.startLoading();
  }

  private stopLoading() {
    this.isLoaded = true;
    this.store.stopLoading();
  }

}
