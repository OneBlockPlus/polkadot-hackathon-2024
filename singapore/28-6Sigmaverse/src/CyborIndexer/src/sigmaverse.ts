import { ActorId, TransactionBuilder, getServiceNamePrefix, getFnNamePrefix, ZERO_ADDRESS } from 'sails-js';
import { GearApi, decodeAddress } from '@gear-js/api';
import { TypeRegistry } from '@polkadot/types';

export type CyborRace = "rodriguez" | "nguyen";

export interface CyborTemplate {
  race_name: string;
  price: number | string | bigint;
  basic_damage: number;
  basic_hp: number;
  basic_move_speed: number;
  basic_knockdown_hit: number;
  score_per_block: number | string | bigint;
}

export interface CyborMetadata {
  race: CyborRace;
  cybor_template: CyborTemplate;
  is_have_finishing_skill: boolean;
  mint_at: number;
  image: string;
}

export interface CyborStream {
  race_name: string;
  basic_damage: number;
  basic_hp: number;
  basic_move_speed: number;
  basic_knockdown_hit: number;
  score_per_block: number | string | bigint;
  is_have_finishing_skill: boolean;
  mint_at: number;
  image: string;
  level: number;
  grade: number;
  lucky: number;
  is_freeze: boolean;
}

export interface DebugInfo {
  source: ActorId;
  value: number | string | bigint;
  temp: CyborTemplate;
  minted_count: number | string | bigint;
  owner_by_id: Array<[number | string | bigint, ActorId]>;
  token_group_by_owner_len: number | string | bigint;
  my_tokens1: Array<number | string | bigint>;
  my_tokens2: Array<number | string | bigint>;
  next_token_id: number | string | bigint;
}

export type ReferenceCount = [number];

export class Sigmaverse {
  public readonly registry: TypeRegistry;
  public readonly cyborNft: CyborNft;
  public readonly enemy: Enemy;
  public readonly pingPong: PingPong;
  public readonly references: References;

  constructor(public api: GearApi, public programId?: `0x${string}`) {
    const types: Record<string, any> = {
      CyborRace: {"_enum":["Rodriguez","Nguyen"]},
      CyborTemplate: {"race_name":"String","price":"u128","basic_damage":"u32","basic_hp":"u32","basic_move_speed":"u8","basic_knockdown_hit":"u8","score_per_block":"u64"},
      CyborMetadata: {"race":"CyborRace","cybor_template":"CyborTemplate","is_have_finishing_skill":"bool","mint_at":"u32","image":"String"},
      CyborStream: {"race_name":"String","basic_damage":"u32","basic_hp":"u32","basic_move_speed":"u8","basic_knockdown_hit":"u8","score_per_block":"u64","is_have_finishing_skill":"bool","mint_at":"u32","image":"String","level":"u16","grade":"u16","lucky":"u32","is_freeze":"bool"},
      DebugInfo: {"source":"[u8;32]","value":"u128","temp":"CyborTemplate","minted_count":"u128","owner_by_id":"Vec<(U256, [u8;32])>","token_group_by_owner_len":"u128","my_tokens1":"Vec<U256>","my_tokens2":"Vec<U256>","next_token_id":"U256"},
      ReferenceCount: "(u32)",
    }

    this.registry = new TypeRegistry();
    this.registry.setKnownTypes({ types });
    this.registry.register(types);

    this.cyborNft = new CyborNft(this);
    this.enemy = new Enemy(this);
    this.pingPong = new PingPong(this);
    this.references = new References(this);
  }

  defaultCtorFromCode(code: Uint8Array | Buffer): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'upload_program',
      'Default',
      'String',
      'String',
      code,
    );

    this.programId = builder.programId;
    return builder;
  }

  defaultCtorFromCodeId(codeId: `0x${string}`) {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'create_program',
      'Default',
      'String',
      'String',
      codeId,
    );

    this.programId = builder.programId;
    return builder;
  }
}

export class CyborNft {
  constructor(private _program: Sigmaverse) {}

  public burn(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Burn', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public freeze(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Freeze', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public getTemplate(race: CyborRace): TransactionBuilder<CyborTemplate> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<CyborTemplate>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'GetTemplate', race],
      '(String, String, CyborRace)',
      'CyborTemplate',
      this._program.programId
    );
  }

  public mint(race: CyborRace): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Mint', race],
      '(String, String, CyborRace)',
      'Null',
      this._program.programId
    );
  }

  public unfreeze(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Unfreeze', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public approve(approved: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Approve', approved, token_id],
      '(String, String, [u8;32], U256)',
      'Null',
      this._program.programId
    );
  }

  public transfer(to: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Transfer', to, token_id],
      '(String, String, [u8;32], U256)',
      'Null',
      this._program.programId
    );
  }

  public transferFrom(from: ActorId, to: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'TransferFrom', from, to, token_id],
      '(String, String, [u8;32], [u8;32], U256)',
      'Null',
      this._program.programId
    );
  }

  public async allCybors(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<[number | string | bigint, CyborMetadata]>> {
    const payload = this._program.registry.createType('(String, String)', ['CyborNft', 'AllCybors']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Vec<(U256, CyborMetadata)>)', reply.payload);
    return result[2].toJSON() as unknown as Array<[number | string | bigint, CyborMetadata]>;
  }

  public async allMyCybors(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<[number | string | bigint, CyborStream]>> {
    const payload = this._program.registry.createType('(String, String)', ['CyborNft', 'AllMyCybors']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Vec<(U256, CyborStream)>)', reply.payload);
    return result[2].toJSON() as unknown as Array<[number | string | bigint, CyborStream]>;
  }

  public async cyborInfo(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<CyborStream> {
    const payload = this._program.registry.createType('(String, String, U256)', ['CyborNft', 'CyborInfo', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, CyborStream)', reply.payload);
    return result[2].toJSON() as unknown as CyborStream;
  }

  public async cyborMetadata(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<CyborMetadata> {
    const payload = this._program.registry.createType('(String, String, U256)', ['CyborNft', 'CyborMetadata', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, CyborMetadata)', reply.payload);
    return result[2].toJSON() as unknown as CyborMetadata;
  }

  public async debugInfo(race: CyborRace, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<DebugInfo> {
    const payload = this._program.registry.createType('(String, String, CyborRace)', ['CyborNft', 'DebugInfo', race]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, DebugInfo)', reply.payload);
    return result[2].toJSON() as unknown as DebugInfo;
  }

  public async balanceOf(owner: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['CyborNft', 'BalanceOf', owner]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, U256)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getApproved(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<ActorId> {
    const payload = this._program.registry.createType('(String, String, U256)', ['CyborNft', 'GetApproved', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, [u8;32])', reply.payload);
    return result[2].toJSON() as unknown as ActorId;
  }

  public async name(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['CyborNft', 'Name']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString() as unknown as string;
  }

  public async ownerOf(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<ActorId> {
    const payload = this._program.registry.createType('(String, String, U256)', ['CyborNft', 'OwnerOf', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, [u8;32])', reply.payload);
    return result[2].toJSON() as unknown as ActorId;
  }

  public async symbol(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['CyborNft', 'Symbol']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString() as unknown as string;
  }

  public subscribeToMintedEvent(callback: (data: { to: ActorId; value: number | string | bigint; next_id: number | string | bigint; len_by_minted: number; len_by_group_user: number }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Minted') {
        callback(this._program.registry.createType('(String, String, {"to":"[u8;32]","value":"U256","next_id":"U256","len_by_minted":"u32","len_by_group_user":"u32"})', message.payload)[2].toJSON() as unknown as { to: ActorId; value: number | string | bigint; next_id: number | string | bigint; len_by_minted: number; len_by_group_user: number });
      }
    });
  }

  public subscribeToBurnedEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Burned') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToFreezeEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Freeze') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToUnFreezeEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'UnFreeze') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToUplevelEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Uplevel') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToDEBUGEvent(callback: (data: { value: DebugInfo }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'DEBUG') {
        callback(this._program.registry.createType('(String, String, {"value":"DebugInfo"})', message.payload)[2].toJSON() as unknown as { value: DebugInfo });
      }
    });
  }

  public subscribeToTransferEvent(callback: (data: { from: ActorId; to: ActorId; token_id: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Transfer') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","to":"[u8;32]","token_id":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; to: ActorId; token_id: number | string | bigint });
      }
    });
  }

  public subscribeToApprovalEvent(callback: (data: { owner: ActorId; approved: ActorId; token_id: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Approval') {
        callback(this._program.registry.createType('(String, String, {"owner":"[u8;32]","approved":"[u8;32]","token_id":"U256"})', message.payload)[2].toJSON() as unknown as { owner: ActorId; approved: ActorId; token_id: number | string | bigint });
      }
    });
  }
}

export class Enemy {
  constructor(private _program: Sigmaverse) {}

  public makeHit(): TransactionBuilder<string> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<string>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Enemy', 'MakeHit'],
      '(String, String)',
      'String',
      this._program.programId
    );
  }

  public walk(dx: number, dy: number): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Enemy', 'Walk', dx, dy],
      '(String, String, i32, i32)',
      'Null',
      this._program.programId
    );
  }

  public async position(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<[number, number]> {
    const payload = this._program.registry.createType('(String, String)', ['Enemy', 'Position']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, (i32, i32))', reply.payload);
    return result[2].toJSON() as unknown as [number, number];
  }

  public subscribeToAttackEvent(callback: (data: null) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Enemy' && getFnNamePrefix(payload) === 'Attack') {
        callback(null);
      }
    });
  }

  public subscribeToTakeHitEvent(callback: (data: { from: [number, number]; to: [number, number] }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Enemy' && getFnNamePrefix(payload) === 'TakeHit') {
        callback(this._program.registry.createType('(String, String, {"from":"(i32, i32)","to":"(i32, i32)"})', message.payload)[2].toJSON() as unknown as { from: [number, number]; to: [number, number] });
      }
    });
  }
}

export class PingPong {
  constructor(private _program: Sigmaverse) {}

  public ping(input: string): TransactionBuilder<{ ok: string } | { err: string }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: string } | { err: string }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['PingPong', 'Ping', input],
      '(String, String, String)',
      'Result<String, String>',
      this._program.programId
    );
  }
}

export class References {
  constructor(private _program: Sigmaverse) {}

  public add(v: number): TransactionBuilder<number> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<number>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['References', 'Add', v],
      '(String, String, u32)',
      'u32',
      this._program.programId
    );
  }

  public addByte(byte: number): TransactionBuilder<`0x${string}`> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<`0x${string}`>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['References', 'AddByte', byte],
      '(String, String, u8)',
      'Vec<u8>',
      this._program.programId
    );
  }

  public guessNum(number: number): TransactionBuilder<{ ok: string } | { err: string }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: string } | { err: string }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['References', 'GuessNum', number],
      '(String, String, u8)',
      'Result<String, String>',
      this._program.programId
    );
  }

  public incr(): TransactionBuilder<ReferenceCount> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<ReferenceCount>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['References', 'Incr'],
      '(String, String)',
      'ReferenceCount',
      this._program.programId
    );
  }

  public setNum(number: number): TransactionBuilder<{ ok: null } | { err: string }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: null } | { err: string }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['References', 'SetNum', number],
      '(String, String, u8)',
      'Result<Null, String>',
      this._program.programId
    );
  }

  public async baked(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['References', 'Baked']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString() as unknown as string;
  }

  public async lastByte(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<number | null> {
    const payload = this._program.registry.createType('(String, String)', ['References', 'LastByte']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Option<u8>)', reply.payload);
    return result[2].toJSON() as unknown as number | null;
  }

  public async message(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<string | null> {
    const payload = this._program.registry.createType('(String, String)', ['References', 'Message']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Option<String>)', reply.payload);
    return result[2].toJSON() as unknown as string | null;
  }
}