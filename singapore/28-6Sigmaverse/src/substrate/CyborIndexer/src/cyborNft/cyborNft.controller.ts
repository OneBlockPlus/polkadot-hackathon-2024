import { Get, Post, Controller, Inject, Req, Body } from '@nestjs/common';

import { CyborNFTEntity } from './cyborNft.entity';
import { CyborNftService } from './cyborNft.service';

import { Sigmaverse } from '../sigmaverse';
import { Request } from 'express';

import {
  ApiBearerAuth, ApiTags,
} from '@nestjs/swagger';
import { StartFightCyborNftDto } from './dto';



@ApiBearerAuth()
@ApiTags('cybor_nft')
@Controller('cybor_nft')
export class CyborNftController {

  private static cachedResultCybors: Map<string, object> | null = null;
  private static lastUpdateTime: number = 0;

  constructor(private readonly cyborNftService: CyborNftService,
    @Inject('SigmaverseProgram') private readonly sigmaverseProgram: Sigmaverse
  ) {}

  @Get()
  async all(): Promise<Map<string, object>> {
    // 添加全局缓存和上次更新时间

    const currentTime = Date.now();
    const oneMinute = 60 * 1000; // 1分钟的毫秒数

    if (!CyborNftController.cachedResultCybors || currentTime - CyborNftController.lastUpdateTime > oneMinute) {
      const resultCybors = new Map<string, object>();

      // varanetwork cybor NFTs
      const vara_CyborNFTs = await this.sigmaverseProgram.cyborNft.allCybors();
      for (const vara_cybor of vara_CyborNFTs) {
        resultCybors.set("varanetwork_" + vara_cybor[0].toString(), {"nft": vara_cybor[1]});
      }

      const allCyborDB = await this.cyborNftService.findAll();
      for (const cybor of allCyborDB) {
        const _k = cybor.chain + "_" + cybor.cyborNFTID;
        const _result = resultCybors.get(_k);
        if (_result) {
          _result["db"] = cybor;
        } else {
          resultCybors.set(_k, {"db": cybor});
        }
      }

      CyborNftController.cachedResultCybors = resultCybors;
      CyborNftController.lastUpdateTime = currentTime;
    }

    return CyborNftController.cachedResultCybors;
  }

  @Get('all_my_cybors')
  async allMyCybors(@Req() request: Request): Promise<Map<string, object>> {
    const resultCybors = new Map<string, object>();
    const vara_CyborNFTs = await this.sigmaverseProgram.cyborNft.allMyCybors(request.user.address);
    for (const vara_cybor of vara_CyborNFTs) {
      const _k = "varanetwork_" + vara_cybor[0].toString();
      resultCybors.set(_k, {"nft": vara_cybor[1]});

      let dbCybor = await this.cyborNftService.findOne(vara_cybor[0].toString(), "varanetwork");

      if (!!dbCybor) {
        dbCybor = await this.cyborNftService.create(
          {
            cyborNFTID: vara_cybor[0].toString(),
            chain: "varanetwork",
            state: 1,
            enemiesDefeated: 0,
            highestDefense: 0,
            highestSurvival: 0,
          }
        );
      }
      resultCybors[_k]["db"] = dbCybor;
    }
    return resultCybors;
  }


  @Post('startFight')
  async startFight(@Body('startFightCyborNftDto') startFightCyborNftDto: StartFightCyborNftDto): Promise<CyborNFTEntity> {
    const cybor = await this.cyborNftService.findOne(startFightCyborNftDto.cyborNFTID, startFightCyborNftDto.chain);
    if (!cybor) {
      throw new Error('CyborNFT not found');
    }
    if (cybor.state == 3) {
      throw new Error('CyborNFT already in fight');
    }

    if (startFightCyborNftDto.mode == "story") {
      const story = await this.sigmaverseProgram.story.getStory(startFightCyborNftDto.storyId);
      if (!story) {
        throw new Error('Story not found');
      }
    }

    return await this.cyborNftService.startFight(cybor.id, startFightCyborNftDto);
  }


}