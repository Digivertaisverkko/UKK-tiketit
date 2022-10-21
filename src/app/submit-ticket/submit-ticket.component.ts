import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpTestingService } from '../user-management/testing-henri/http-testing.service';

@Component({
  selector: 'app-submit-ticket',
  templateUrl: './submit-ticket.component.html',
  styleUrls: ['./submit-ticket.component.scss']
})
export class SubmitTicketComponent implements OnInit{

  baseUrl: string;
  response: string;

  tehtava = '';
  ongelma = '';
  display: FormControl = new FormControl("", Validators.required);

  constructor(private httpTest: HttpTestingService) {
    this.baseUrl='http://localhost:3000';
    this.response = '';
    
  }

  ngOnInit(): void {
  }

  makeTest() {
    console.log('Button pressed.');
    let response: string;
    this.httpTest.getStringResponse(this.baseUrl + '/api').subscribe(
      (data: string) => 
        this.response = data
    );
  }

}
