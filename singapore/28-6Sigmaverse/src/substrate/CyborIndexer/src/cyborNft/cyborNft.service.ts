import { Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { CyborNFTEntity } from './cyborNft.entity';
import { CreateCyborNftDto, StartFightCyborNftDto } from './dto';


@Injectable()
export class CyborNftService {
  constructor(
    @InjectRepository(CyborNFTEntity)
    private readonly cyborNftRepository: Repository<CyborNFTEntity>
  ) {}

  async findAll(): Promise<CyborNFTEntity[]> {
    return await this.cyborNftRepository.find();
  }

  async startFight(id: number, dto: StartFightCyborNftDto): Promise<CyborNFTEntity> {
    return await this.cyborNftRepository.manager.transaction(async transactionalEntityManager => {
      let toUpdate = await transactionalEntityManager.findOne(CyborNFTEntity, id);
      if (!toUpdate) {
        throw new Error('CyborNFT not found');
      }
      let updated = Object.assign(toUpdate, dto);
      return await transactionalEntityManager.save(CyborNFTEntity, updated);
    });
  }

  async update(id: number, dto: CreateCyborNftDto): Promise<CyborNFTEntity> {
    let toUpdate = await this.cyborNftRepository.findOne(id);
    let updated = Object.assign(toUpdate, dto);

    return await this.cyborNftRepository.save(updated);
  }


  async findOne(cyborNFTID: string, chain: string): Promise<CyborNFTEntity> {
    const qb = await getRepository(CyborNFTEntity)
      .createQueryBuilder('cybor_nft')
      .where('cybor_nft.cybor_nft_id = :cyborNFTID AND cybor_nft.chain = :chain', { cyborNFTID: cyborNFTID, chain: chain });

    return await qb.getOne();
  }

  async create(dto: CreateCyborNftDto): Promise<CyborNFTEntity> {
    const qb = await getRepository(CyborNFTEntity)
      .createQueryBuilder('cybor_nft')
      .where('cybor_nft.cybor_nft_id = :cyborNFTID AND cybor_nft.chain = :chain', { cyborNFTID: dto.cyborNFTID, chain: dto.chain });

    const _nft = await qb.getOne();
    if (_nft) {
      var _nft_updated = await this.update(_nft.id, dto);
      return _nft_updated;
    }

    const {cyborNFTID, chain, state, enemiesDefeated, highestDefense, highestSurvival} = dto;

    let cyborNft = new CyborNFTEntity();
    cyborNft.cyborNFTID = cyborNFTID;
    cyborNft.chain = chain;
    cyborNft.state = state;
    cyborNft.enemiesDefeated = enemiesDefeated;
    cyborNft.highestDefense = highestDefense;
    cyborNft.highestSurvival = highestSurvival;
    
    const savedCyborNft = await this.cyborNftRepository.create(cyborNft);
    return savedCyborNft;
  }

}
