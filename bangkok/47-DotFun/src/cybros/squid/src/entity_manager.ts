import {type FindOptionsRelations, FindOptionsWhere} from 'typeorm';
import {EntityClass, FindOneOptions} from '@subsquid/typeorm-store';
import {type Context} from './processor';
import {splitIntoBatches} from './utils';

interface EntityWithId {
  id: string;
}

export class EntitiesManager<Entity extends EntityWithId> {
  context: Context | null = null;

  entityClass: EntityClass<Entity>;

  newEntityFunc: (id: string) => Entity;

  prefetchItemIdsList: string[] = [];

  entitiesMap: Map<string, Entity> = new Map();

  constructor({entityClass, newEntityFunc}: {
    entityClass: EntityClass<Entity>,
    newEntityFunc: (id: string) => Entity
  }) {
    this.entityClass = entityClass;
    this.newEntityFunc = newEntityFunc;
  }

  init(ctx: Context) {
    this.context = ctx;
    return this;
  }

  add(entity: Entity): void {
    this.entitiesMap.set(entity.id, entity);
  }

  /**
   * Add entity ID to the list for prefetch process.
   */
  addPrefetchItemId(itemIdOrList: string | string[]): void {
    if (Array.isArray(itemIdOrList)) {
      this.prefetchItemIdsList.push(...itemIdOrList);
    } else {
      this.prefetchItemIdsList.push(itemIdOrList);
    }
  }

  /**
   * Clear collected list of entity IDs for prefetch process.
   */
  resetPrefetchItemIdsList(): void {
    this.prefetchItemIdsList = [];
  }

  /**
   * Prefetch entities which are collected in the beginning of the batch
   * data processing flow.
   *
   * @param relations
   */
  async prefetchEntities(
    relations?: FindOptionsRelations<Entity>
  ): Promise<void> {
    if (!this.context) throw new Error('context is not defined');
    if (
      !this.prefetchItemIdsList ||
      this.prefetchItemIdsList.length === 0
    )
      return;

    for (const chunk of splitIntoBatches(this.prefetchItemIdsList, 1000)) {
      const chunkRes = await this.context.store.find(this.entityClass, {
        where: chunk.map((id): FindOptionsWhere<Entity> => {
          return {id} as FindOptionsWhere<Entity>;
        }),
        ...(!!relations && {relations})
      });

      for (const chunkResItem of chunkRes) {
        this.add(chunkResItem);
      }
    }

    this.resetPrefetchItemIdsList();
  }

  /**
   * Get entity by ID from local cache.
   *
   * @param id
   */
  getFromLocalCache(
    id: string
  ): Entity | null {
    return this.entitiesMap.get(id) || null;
  }

  /**
   * Get entity by ID either from local cache or DB, if it's not existing in
   * local cache ("entitiesMap").
   *
   * @param id
   * @param relations
   */
  async get(
    id: string,
    relations?: FindOptionsRelations<Entity>
  ): Promise<Entity | null> {
    if (!this.context) throw new Error('context is not defined');
    let entity = this.getFromLocalCache(id);

    if (!entity) {
      const requestParams = {
        where: {id}
      } as FindOneOptions<Entity>;

      if (relations) requestParams.relations = relations;

      entity = (await this.context.store.get(this.entityClass, requestParams)) || null;
      if (entity) {
        this.add(entity);
      }
    }

    return entity;
  }

  async getOrCreate(
    id: string,
    setAttributesFunc?: (entity: Entity) => Promise<void>
  ): Promise<Entity> {
    let entity = await this.get(id);

    if (!entity) {
      entity = this.newEntityFunc(id);
      if (setAttributesFunc) {
        await setAttributesFunc(entity);
      }

      this.add(entity);
    }

    return entity;
  }

  async create(
    id: string,
    setAttributesFunc?: (entity: Entity) => Promise<void>
  ): Promise<Entity> {
    const entity = this.newEntityFunc(id);
    if (setAttributesFunc) {
      await setAttributesFunc(entity);
    }

    this.add(entity);

    return entity
  }

  async upsert(
    id: string,
    setAttributesFunc: (entity: Entity) => Promise<void>
  ): Promise<Entity> {
    let entity = await this.get(id);

    if (entity) {
      await setAttributesFunc(entity);
    } else {
      entity = this.newEntityFunc(id);
      await setAttributesFunc(entity);

      this.add(entity);
    }

    return entity;
  }

  /**
   * Save all entities from local cache at once.
   * This action should be evoked in the end of batch data processing flow.
   */
  async saveAll(): Promise<void> {
    if (!this.context) throw new Error('context is not defined');
    await this.context.store.save([...this.entitiesMap.values()]);
    this.entitiesMap.clear();
  }

  async remove(id: string): Promise<void> {
    if (!this.context) throw new Error('context is not defined');
    let entity = await this.get(id);
    if (!entity) {
      return
    }

    await this.context.store.remove(entity);
    this.entitiesMap.delete(id);
  }
}
