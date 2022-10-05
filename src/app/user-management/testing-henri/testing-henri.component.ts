import { Component, OnInit } from '@angular/core';
import { HttpTestingService } from './http-testing.service';

@Component({
  selector: 'app-testing-henri',
  templateUrl: './testing-henri.component.html',
  styleUrls: ['../login/login.component.scss', 'testing-henri.component.scss']
})
export class TestingHenriComponent implements OnInit {

  baseUrl: string;
  response: string;

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
