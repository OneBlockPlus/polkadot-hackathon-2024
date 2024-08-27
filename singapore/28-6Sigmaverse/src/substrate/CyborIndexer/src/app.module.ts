import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { CyborNftModule } from './cyborNft/tag.module';

import { SigmaverseModule } from './sigmaverse.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(
      {
        type: 'postgres',
        host: 'localhost',
        port: 11101,
        username: 'cybor',
        password: '123456',
        database: 'cybor',
        entities: [
          "src/**/**.entity{.ts,.js}"
        ],
        synchronize: true,
      }
    ),
    UserModule,
    CyborNftModule,

    SigmaverseModule
  ],
  controllers: [
    AppController
  ],
  providers: []
})
export class ApplicationModule {
  constructor(private readonly connection: Connection) {}
}
