import {Injectable} from '@angular/core';

import {catchError, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { of } from 'rxjs';
import {IMovie, Movie, WatchStatus} from '../models/movie'; // interface, class
import {MessageService} from '../message.service'; // data
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import * as https from "https"; // interface, class

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root',
})
export class MovieService {

  constructor(private messageService: MessageService, private http: HttpClient) {
  }
  /** GET: get all movies from database */
  getMovies(): Observable<IMovie[]> {
    // // TODO: send the message _after_ fetching the movies
    this.messageService.add('MovieService: fetched movies');
    return this.http.get<IMovie[]>('http://localhost:3000/api/movies');
  }

    /** GET: get all movies from database */
  getAllMovies(): Observable<IMovie[]> {
    // // TODO: send the message _after_ fetching the movies
    this.messageService.add('MovieService: fetched movies');
    return this.http.get<IMovie[]>('http://localhost:3000/api/movies/getall', httpOptions);
  }

  /** GET: add a movie by ID from database */
  getMovie(id: number | string) {
    this.messageService.add('MovieService: fetched movies');
    return this.http.get<IMovie[]>('http://localhost:3000/api/movies/item/'+id).pipe(
      // (+) before `id` turns the string into a number
      map((movies: IMovie[]) => movies.find(movie => movie.movie_id === +id)!)
    );
    // return this.getAllMovies().pipe(
    //   // (+) before `id` turns the string into a number
    //   map((movies: IMovie[]) => movies.find(movie => movie.movie_id === +id)!)
    // );
  }

  /** GET: add a movie by ID from database */
  getWatchStatus(id: number) {
    this.messageService.add('MovieService: getWatchStatue');
    return this.http.get('http://localhost:3000/api/movies/haswatched/'+id)
      .pipe(
        map(res => {return true}),
        catchError(err => {
            return of(false);
        })
      );
  }

  /** POST: add a new movie to the database */
  addMovie(movie: Movie): Observable<any> {
    this.messageService.add('MovieService: add movie');
    const body = JSON.stringify(movie);
    console.log(body)
    return this.http.post<IMovie>('http://localhost:3000/api/movies/add', body, httpOptions)
      .pipe(
        catchError(err => {
          return ("ADD MOVIE ERROR: " + err);
        })
      );
  }
  
  updateMovie(movie: Movie): Observable<any> {
    this.messageService.add('ShowService: update show');
    const body = JSON.stringify(movie);
    console.log(body);
    return this.http.put<Movie>('http://localhost:3000/api/movies/update/'+movie.movie_id, body, httpOptions)
      .pipe(
        catchError(async () => console.log("UPDATE SHOW ERROR"))
      );
  }

  /** DELETE: delete a selected movie by ID from database */
  deleteMovie(id: number): Observable<any> {
    this.messageService.add('MovieService: delete movie');
    const body = JSON.stringify(id);
    console.log(body)
    return this.http.delete<Movie>('http://localhost:3000/api/movies/' + id)
      .pipe(
        catchError(err => {
          return ("DELETE MOVIE ERROR: " + err);
        })
      );
  }

  // handleError(error: Error | HttpErrorResponse) {
  //   console.log('GlobalErrorHandlerService' + error)
  //   // throw new Error(error, error);
  // }
}
