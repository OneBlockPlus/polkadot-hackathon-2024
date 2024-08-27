import { fileURLToPath } from 'url';
import path from 'path';
import { ServiceGenerator } from './service-gen.js';
import { TypesGenerator } from './types-gen.js';
import { Output } from './output.js';

fileURLToPath(import.meta.url);
function generate(sails, outDir, outFile = 'lib.ts', className = 'Program') {
    const out = new Output();
    const typesGen = new TypesGenerator(out, sails.program);
    typesGen.generate();
    const serviceGen = new ServiceGenerator(out, sails.program, sails.scaleCodecTypes);
    serviceGen.generate(className);
    out.save(path.join(outDir, outFile));
}

export { generate };
