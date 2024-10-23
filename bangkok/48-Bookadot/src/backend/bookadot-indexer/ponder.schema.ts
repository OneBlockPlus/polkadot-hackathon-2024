import { createBookadotFactorySchema } from './src/bookadot-factory/bookadot-factory.schema';
import { createSchema } from "@ponder/core";

const ponderSchema = (p: P) => Object.assign({},
  // createWeth9Schema(p),
  createBookadotFactorySchema(p),
);
// @ts-ignore
export default createSchema(ponderSchema);
