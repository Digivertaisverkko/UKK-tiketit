import { Component, OnInit } from '@angular/core';
import { HttpTestingService } from './http-testing.service';
import { TicketServiceService } from 'src/app/ticket-list/ticket.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Question {
  id: string;
  title: string;
  date: string;
  state: number;
  excercise: string;
}

@Component({
  selector: 'app-testing-henri',
  templateUrl: './testing-henri.component.html',
  styleUrls: ['../login/login.component.scss', 'testing-henri.component.scss'],
})
export class TestingHenriComponent {
  response: string;

  public ticketMessage: string = '';
  public ticketMessageSubscription: Subscription;

  constructor(
    private httpTest: HttpTestingService,
    private ticket: TicketServiceService
  ) {
    this.response = '';
    this.ticketMessageSubscription = this.ticket.onMessages().subscribe(message => {
      this.ticketMessage = message;
    });
  }

  public async getCourseName(courseID: string) {
    this.ticket.getCourseName(courseID).then(response => {
      console.log(typeof response);
      console.log(response);
      console.log('Kurssin nimi: ' + response);
    });
  }

  public async getCourses() {
    this.ticket.getCourses().then(response => {
      console.log(typeof response);
      console.log(response);
      console.log('toisen kurssin nimi: ' + response[1].nimi);
    });
  }

  public async getQuestions() {
    this.ticket.getQuestions('1').then(response => {
      console.log(response);
      console.log(typeof response);
      console.log('otsikko: ' + response[0].otsikko);
    });
  }

  public async getTicketInfo(ticketID: string) {
    this.ticket.getTicketInfo(ticketID).then(response => {
      console.dir(response);
      console.log(typeof response);
    });
  }

  public async makeTest() {
    let response: any;
    this.httpTest
      .getStringResponse(environment.apiBaseUrl + '/api/kurssi/1/omat')
      .subscribe((data) => {
        console.log(data);
        console.log(typeof data);
      });
  }

}
