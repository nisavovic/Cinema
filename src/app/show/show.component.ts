import { Component, Input, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Observable, switchMap} from "rxjs";
import {Router} from "@angular/router";
import {AuthService} from "../login/auth.service";
import {MovieService} from "../database/movie.service"; // data
import {IMovie, WatchStatus} from '../models/movie'; // interface, class
import {IRating, NewRating} from "../models/rating";
import {IShow} from "../models/show";
import {ShowService} from "../database/show.service";
import {RatingService} from "../database/rating.service";

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.css']
})
export class ShowComponent implements OnInit {
  movie$!: Observable<IMovie>;
  movies$!: Observable<IMovie[]>;
  ratings$!: Observable<IRating[]>;
  shows$!: Observable<IShow[]>;
  // rating$!: Observable<IRating>;
  @Input() rating: IRating;
  @Input() show: IShow;
  selectedID = 0;
  isLoggedIn:boolean;

  //dates
  today = new Date();
  tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
  secondDate = new Date(new Date().setDate(new Date().getDate() + 2));
  thirdDate= new Date(new Date().setDate(new Date().getDate() + 3));
  fourthDate= new Date(new Date().setDate(new Date().getDate() + 4));
  fifthDate= new Date(new Date().setDate(new Date().getDate() + 5));
  sixDate = new Date(new Date().setDate(new Date().getDate() + 6));
  star: number;
  review: string;


  constructor(private authService: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private movieService: MovieService,
              private showService: ShowService,
              private ratingService: RatingService
  ) {
    authService.loggedInObservable.subscribe((newIsLoggedIn) => {
      this.isLoggedIn = newIsLoggedIn;
    });
  }

  ngOnInit(): void {
    this.movies$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.selectedID = parseInt(params.get('id')!, 10);
        return this.movieService.getMovies();
      })
    );

    this.movie$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.movieService.getMovie(params.get('id')!))
    );

    this.ratings$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.ratingService.getRatingsByMovieID(params.get('id')!))
    );

    this.shows$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.showService.getShowsByMovieID(params.get('id')!))
    );

    console.log(this.shows$);
    console.log(this.ratings$);
  }

  get isAuth(){
    return this.isLoggedIn;
  }

  hasWatched(id:number){
    return this.movieService.getWatchStatus(id);
  }

  addMovieRating(id: number){
    let r = new NewRating();
    r.movie_id = id;
    r.review = this.review;
    r.star = this.star;
    this.ratingService.addRating(r).subscribe(() => {
      this.ratings$ = this.route.paramMap.pipe(
        switchMap((params: ParamMap) =>
          this.ratingService.getRatingsByMovieID(params.get('id')!))
      );
    });
  }

  // gotoMovies(movie: IMovie) {
  //   const movieId = movie ? movie.id : null;
  //   // Pass along the hero id if available
  //   // so that the HeroList component can select that hero.
  //   // Include a junk 'foo' property for fun.
  //   this.router.navigate(['/movies', { id: movieId, foo: 'foo' }]);
  // }
}
