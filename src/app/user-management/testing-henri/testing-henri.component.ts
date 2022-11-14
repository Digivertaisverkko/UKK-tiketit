import { Component, OnInit } from '@angular/core';
import { HttpTestingService } from './http-testing.service';
import { Ticket, TicketService, Tila } from 'src/app/ticket/ticket.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TitleCasePipe } from '@angular/common';

export interface Question {
  id: string;
  title: string;
  date: string;
  state: number;
  excercise: string;
}

export interface NewTicket {
  otsikko: string;
  viesti: string;
  kentat?: Array<Field>;
}

export interface Field {
  id: number;
  arvo: string;
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
  public ticketID: string = '1';

  constructor(
    private httpTest: HttpTestingService,
    private ticket: TicketService
  ) {
    this.response = '';
    this.ticketMessageSubscription = this.ticket.onMessages().subscribe(message => {
      this.ticketMessage = message;
    });

  }

  public async getFieldInfo() {
    // 1-kurssista haetaan.
    this.ticket.getTicketFieldInfo('1').then(response => {
      console.log(response);
    });
  }

  public async addTicket() {
    // TODO: oikeat id-arvot.
    const newTicket: NewTicket = {
      otsikko: 'Saan testejä ajaessa virheviestin, joka valittaa "Cannot run program: Permission denied"',
      viesti: 'Testiviesti',
      kentat: [
        { id: 1, arvo: 'Tehtävän numero'},
        { id: 2, arvo: 'Ongelmatyypin kuvaus'}
      ]
    }
    this.ticket.addTicket('1', newTicket);
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
    // 1-kurssista haetaan.
    this.ticket.getQuestions(1).then(response => {
      console.log(response);
    });
  }

  public async getTicketInfo() {
    this.ticket.getTicketInfo(this.ticketID).then(response => {
      console.dir(response);
      console.log('Tiketin tila: ' + Tila[response.tila]);
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
