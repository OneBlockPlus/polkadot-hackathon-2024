import { Global, Module } from '@nestjs/common';
import { GearApi } from '@gear-js/api';
import { Sigmaverse } from './sigmaverse';
import { VARA_NODE_ADDRESS, VARA_PROGRAM_ID } from './config';

@Global()
@Module({
  providers: [
    {
      provide: 'SigmaverseProgram',
      useFactory: async () => {
        const api = await GearApi.create({
          providerAddress: VARA_NODE_ADDRESS,
        });
        return new Sigmaverse(api, VARA_PROGRAM_ID);
      },
    },
  ],
  exports: ['SigmaverseProgram'],
})
export class SigmaverseModule {}