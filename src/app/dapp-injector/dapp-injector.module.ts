import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DappInjectorService } from './dapp-injector.service';
import { IDAPP_CONFIG } from './models';
import { GraphQlModule } from './services/graph-ql/graph-ql.module';

export const DappConfigService = new InjectionToken<IDAPP_CONFIG>('DappConfig');

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GraphQlModule.forRoot({uri:"http://localhost:8000/subgraphs/name/angular-web3/gravatar"})
  ],
})
export class DappInjectorModule {
  static forRoot(dappConfig: IDAPP_CONFIG): ModuleWithProviders<DappInjectorModule> {
    return {
      ngModule: DappInjectorModule,
      providers: [DappInjectorService, { provide: DappConfigService, useValue: dappConfig }],
    };
  }
}
