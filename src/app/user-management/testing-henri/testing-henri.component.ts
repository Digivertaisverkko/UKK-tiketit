import { Component, OnInit } from '@angular/core';
import { HttpTestingService } from './http-testing.service';

@Component({
  selector: 'app-testing-henri',
  templateUrl: './testing-henri.component.html',
  styleUrls: ['../login/login.component.scss', 'testing-henri.component.scss']
})
export class TestingHenriComponent implements OnInit {

  baseUrl: string;

  constructor(private httpTest: HttpTestingService) {
    this.baseUrl='http://localhost:3000';
  }

  ngOnInit(): void {
  }

  makeTest() {
    console.log('Button pressed.');
    console.log(this.httpTest.getResponse(this.baseUrl + '/api').subscribe());
  }

}
