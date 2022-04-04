import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TheGraphDemoModule } from './5-the-graph/the-graph-demo.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DappInjectorModule } from './dapp-injector/dapp-injector.module';
import { StoreModule } from '@ngrx/store';
import { we3ReducerFunction } from 'angular-web3';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    TheGraphDemoModule,
    BrowserAnimationsModule,
    HttpClientModule,
    DappInjectorModule.forRoot({wallet:'burner', defaultNetwork:'localhost'}),
    StoreModule.forRoot({web3: we3ReducerFunction}),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
