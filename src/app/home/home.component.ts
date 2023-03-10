import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";

import {AuthService} from '../login/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
isLogIn:boolean;

  constructor(private authService: AuthService) {
    authService.loggedInObservable.subscribe((newIsLoggedIn) => {
      this.isLogIn = newIsLoggedIn;
    });
  }

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }
  get isLoggedIn() {
    return this.isLogIn;
  }
}
