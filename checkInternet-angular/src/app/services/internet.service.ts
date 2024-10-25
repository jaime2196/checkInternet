import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InternetData } from '../model/internet-data';
import { environment } from '../../environments/environment';
import { VelocidadData } from '../model/velocidad-data';
import { VelocidadAvg } from '../model/velocidad-avg';

@Injectable({
  providedIn: 'root'
})
export class InternetService {

  constructor(private  http : HttpClient) { }

  getInternetDate(day:number, month:number, year:number){
    let server='http://localhost:3000/';
    if(environment.prod){
      server = window.location.href;
    }
    return this.http.get<InternetData[]>(`${server}internet?dia=${day}&mes=${month}&ano=${year}`);
  }

  getVelocidadDate(day:number, month:number, year:number){
    let server='http://localhost:3000/';
    if(environment.prod){
      server = window.location.href;
    }
    return this.http.get<VelocidadData[]>(`${server}velocidad?dia=${day}&mes=${month}&ano=${year}`);
  }

  calcAvg(velocidadData: VelocidadData[]): VelocidadAvg{
    debugger;
    let sumSubida=0;
    let sumBajada =0;
    let cont =0;
    for(let i=0;i!=velocidadData.length;i++){
      let tem = velocidadData[i];
      if(!isNaN(Number(tem.bajada))){
        sumSubida = sumSubida + +tem.subida;
        sumBajada = sumBajada + +tem.bajada;
        cont++;
      }
    }
    if(cont == 0){
      return {
        numeroElementos: cont,
        subida: 0,
        bajada: 0
      }
    }
    let res: VelocidadAvg={
      numeroElementos: cont,
      subida: sumSubida/cont,
      bajada: sumBajada/cont
    }
    return res;
  }
}
