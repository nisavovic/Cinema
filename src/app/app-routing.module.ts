import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {HomeComponent} from "./home/home.component";
import {OverviewComponent} from "./overview/overview.component";
import {ShowComponent} from "./show/show.component";
import {ContactComponent} from "./contact/contact.component";
import {AdminComponent} from "./admin/admin.component";
import {CustomerDashboardComponent} from "./customer-dashboard/customer-dashboard.component";
import {LoginComponent} from "./login/login.component";
import {ErrorComponent} from "./error/error.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {ShowBookingComponent} from "./show-booking/show-booking.component";
import {RegistrationComponent} from "./registration/registration.component";

// import { authGuard } from './auth/auth.guard';

const routes: Routes = [ // sets up routes constant where you define your routes
  {path:"home", component: HomeComponent},
  {path:"overview", component: OverviewComponent}, // overview of all available movies
  {path:"overview/show/:id", component: ShowComponent}, // single show page access only over link
  {path:"contact", component: ContactComponent}, // contact data program
  {path:"admin", component: AdminComponent}, // admin page access only over link
  {path:"dashboard", component: CustomerDashboardComponent}, // dashboard page access only over link
  {path:"login", component: LoginComponent}, // login page
  {path:"overview/show/:id/show-booking/:bookingId", component: ShowBookingComponent}, // single booking page access only over link
  {path:"registration", component: RegistrationComponent}, // single registration page access only over link

  {path:"**", component: ErrorComponent}, // error page

  {path:"overview/show/:id/show-booking/:id", component: ShowBookingComponent}, // single booking page access only over link
  {path:"overview/show/getbymovie/:id", component: ShowComponent}, // single show by links table access only over link


  {path: '', redirectTo: '/overview', pathMatch: 'full' },
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
