import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InternetData } from '../model/internet-data';

@Injectable({
  providedIn: 'root'
})
export class InternetService {

  constructor(private  http : HttpClient) { }

  getInternetDate(day:number, month:number, year:number){
    return this.http.get<InternetData[]>(`${window.location.href}internet?dia=${day}&mes=${month}&ano=${year}`);
  }
}
