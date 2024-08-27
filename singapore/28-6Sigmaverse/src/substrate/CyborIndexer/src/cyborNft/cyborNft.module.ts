import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { CyborNftService } from './cyborNft.service';
import { CyborNFTEntity } from './cyborNft.entity';
import { CyborNftController } from './cyborNft.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CyborNFTEntity]), UserModule],
  providers: [CyborNftService],
  controllers: [
    CyborNftController
  ],
  exports: []
})
export class CyborNftModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
  }
}
