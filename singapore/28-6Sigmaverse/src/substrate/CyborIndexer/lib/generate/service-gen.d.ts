import { Program } from '../parser/program.js';
import { Output } from './output.js';
import { BaseGenerator } from './base.js';
export declare class ServiceGenerator extends BaseGenerator {
    private _program;
    private scaleTypes;
    constructor(out: Output, _program: Program, scaleTypes: Record<string, any>);
    generate(className?: string): void;
    private generateProgramConstructor;
    private generateServices;
    private generateMethods;
    private generateSubscriptions;
    private getArgs;
    private getFuncSignature;
}
