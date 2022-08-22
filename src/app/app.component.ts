import { Component, ElementRef, ViewChild } from '@angular/core';
// import { shareTextToWhatsApp } from 'share-text-to-whatsapp';
// import { shareTextViaNativeSharing } from 'share-text-to-whatsapp';

import {
  HttpClient,
  HttpHeaders,
  HttpClientModule,
  HttpParams,
} from '@angular/common/http';
import { interval } from 'rxjs';
import { Subscription, from } from 'rxjs';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DatePipe],
})
export class AppComponent {
  title = 'Covid Vaccine Notifier';
  centerData: any;
  pincodes: string = '';
  sessions: any;
  filterArray: any[] = [];
  record_present: boolean = false;
  subs: Subscription;
  myDate: any;

  message = 'Hello world';
  @ViewChild('audioPlayerRef') audioPlayerRef: ElementRef;
  @ViewChild('playBtn') playBtn: ElementRef;
  constructor(public http: HttpClient, private datePipe: DatePipe) {
    this.myDate = new Date();
    this.myDate = this.datePipe.transform(this.myDate, 'dd-MM-yyyy');

    console.log('Date===>', this.myDate);
    this.startInterval();
    //   this.getCowinData();
    //  this.refresh();
  }

  ngAfterViewInit() {
    console.log(
      'Btn Not Clicked',
      this.playBtn,
      document.getElementById('audio')
    );
    if (this.playBtn != undefined) {
      this.playBtn.nativeElement.click();
      //this.audioPlayerRef.nativeElement.play();
    }
  }

  share() {
    //https://api.whatsapp.com/send?phone=0123456789&text=I'm%20interested%20in%20your%20services
    //shareTextToWhatsApp(this.message); // This will open up WhatsApp and you will be shown a list of contacts you can send your message to.
    window.open(`https://wa.me/${8237553725}?text=` + this.message, '_blank');
  }

  //  TODO: State API - https://cdn-api.co-vin.in/api/v2/admin/location/states
  //  TODO: District API - https://cdn-api.co-vin.in/api/v2/admin/location/districts/2
  // TODO: Get all Data of Districthttps://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=512&date=31-03-2021
  // TODO: Pin API - https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=411011&date=16-06-2022

  getCowinData(pin) {
    //https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=411028&date=21-05-2021
    console.log('Received Data', pin);

    this.http
      .get(
        'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=363&date=' +
          this.myDate
      )
      .subscribe((res) => {
        console.log('Cowin Data', res);
        this.centerData = res['centers'];

        // console.log(this.centerData);

        this.centerData.filter((item) => {
          item.sessions.filter((data) => {
            if (item.vaccine_fees != undefined) {
              item.vaccine_fees.filter((fee) => {
                // console.log('Fees', fee.fee);
              });
            }
            // debugger;
            if (
              /*               (item.pincode == 411028 ||
                item.pincode == 411011 ||
                item.pincode == 411013 ||
                item.pincode == 411042 ||
                item.pincode == 412307 ||
                item.pincode == 411006 ||
                item.pincode == 412308) && */
              pin.indexOf(item.pincode.toString()) != -1 &&
              item.fee_type == 'Free' &&
              data.available_capacity > 0
              //   data.min_age_limit <= 18 &&
              //              data.available_capacity_dose1 > 0 &&
              //            data.available_capacity_dose2 > 0
            ) {
              //console.log(item.fee_type,item.name,item.pincode , data.available_capacity, data.date, data.vaccine);
              let count: any = this.filterArray.filter(
                (x) => x.center_id == item.center_id
              );
              if (count == 0) {
                this.filterArray.push(item);
              }
            }
          });
        });

        console.log(
          'Filter Data====>',
          this.filterArray,
          this.filterArray.length
        );

        if (this.filterArray.length != 0) this.play();
        return;
        // this.share();
      });
  }

  play() {
    // console.log('In Play');
    this.audioPlayerRef.nativeElement.play();
  }
  getData() {
    var pinArray = [];
    this.filterArray = [];
    if (this.pincodes != null && this.pincodes != undefined) {
      pinArray = this.pincodes.split(',');
      console.log('Before Split', pinArray);

      pinArray = pinArray.filter((item) => item.trim());

      console.log('After trim Pincodes', pinArray);
      pinArray = [...new Set(pinArray)];
      console.log(`New  Array ${pinArray}`);

      this.getCowinData(pinArray);
    }
  }
  startInterval() {
    this.subs = interval(15000).subscribe((val) => {
      this.getData();
    });
  }
}
