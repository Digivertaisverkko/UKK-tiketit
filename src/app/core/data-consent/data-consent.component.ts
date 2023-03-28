import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


@Component({
  templateUrl: './data-consent.component.html',
  styleUrls: ['./data-consent.component.scss']
})
export class DataConsentComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute) {
    }

  ngOnInit(): void {
    true
  }

}