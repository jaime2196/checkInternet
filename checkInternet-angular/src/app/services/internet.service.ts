import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InternetData } from '../model/internet-data';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InternetService {

  constructor(private  http : HttpClient) { }

  getInternetDate(day:number, month:number, year:number){
    debugger;
    let server='http://localhost:3000/';
    if(environment.prod){
      server = window.location.href;
    }
    return this.http.get<InternetData[]>(`${server}internet?dia=${day}&mes=${month}&ano=${year}`);
  }
}
