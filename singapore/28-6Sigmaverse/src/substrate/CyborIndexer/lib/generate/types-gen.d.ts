import { Program } from '../parser/program.js';
import { Output } from './output.js';
import { BaseGenerator } from './base.js';
export declare class TypesGenerator extends BaseGenerator {
    private _program;
    constructor(out: Output, _program: Program);
    generate(): void;
    private generateStruct;
    private generateEnum;
    private getEnumFieldString;
}
