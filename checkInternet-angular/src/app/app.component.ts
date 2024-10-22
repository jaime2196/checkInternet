import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { InternetService } from './services/internet.service';
import { InternetData } from './model/internet-data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit {
  internetData : InternetData[] = [];
  fechaHoy: string = '';
  minutos:number[]=[];

  constructor(private internetService: InternetService){}
  ngOnInit(): void {
    this.initMinutos();
    this.initFechaHoy();
  }

  initFechaHoy(){
    const today = new Date();
    const dayOfMonth = today.getDate();
    const month = today.getMonth()+1;
    const year = today.getFullYear(); 
    this.fechaHoy=`${dayOfMonth}/${month}/${year}`;
    this.internetService.getInternetDate(dayOfMonth, month, year).subscribe(res=>{
      console.log(res);
      this.internetData = res;
    });
  }

  initFecha(dayOfMonth: number, month:number, year:number){
    this.fechaHoy=`${dayOfMonth}/${month}/${year}`;
    this.internetService.getInternetDate(dayOfMonth, month, year).subscribe(res=>{
      console.log(res);
      this.internetData = res;
    });
  }
  
  initMinutos(){
    for(let i = 0;i!=60;i++){
      if(i%5==0){
        this.minutos.push(i);
      }
    }
  }

  search(hora:number, minuto:number){
    for(let i =0;this.internetData.length!=i;i++){
      let data = this.internetData[i];
      if(data.hora == hora && data.minuto == minuto){
        return data.internet=='SI'?'✔':'❌';
      }
    }
    return '❔';
  }

  nuevaFecha(event:any){
    let e:any = document.getElementById('fecha');
    let fechaStr=e.value;
    if(fechaStr!=''){
      let ar=fechaStr.split('-');
      console.log(ar);
      this.initFecha(ar[2],ar[1],ar[0]);
    }else{
      this.initFechaHoy();
    }
  }


}
