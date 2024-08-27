export declare class Output {
    private _rows;
    private _firstRows;
    private _indent;
    private _imports;
    constructor();
    import(module_: string, import_: string): this;
    firstLine(data: string | string[]): this;
    line(data?: string, semicolon?: boolean): this;
    block(beginning: string, content?: () => void, bracket?: '{' | '[' | '('): this;
    increaseIndent(): this;
    reduceIndent(): this;
    save(path: string): void;
}
