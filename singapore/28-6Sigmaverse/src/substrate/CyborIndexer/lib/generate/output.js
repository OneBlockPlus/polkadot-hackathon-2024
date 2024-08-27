import { writeFileSync } from 'fs';

class Output {
    _rows = [];
    _firstRows = [];
    _indent = '';
    _imports;
    constructor() {
        this._rows = [];
        this._firstRows = [];
        this._imports = new Map();
    }
    import(module_, import_) {
        if (this._imports.has(module_)) {
            this._imports.get(module_).add(import_);
        }
        else {
            this._imports.set(module_, new Set([import_]));
        }
        return this;
    }
    firstLine(data) {
        if (Array.isArray(data)) {
            data = data.map((line) => {
                if (!line.endsWith(';'))
                    return line + ';';
                return line;
            });
            this._firstRows.push(...data);
        }
        else {
            if (!data.endsWith(';'))
                data += ';';
            this._firstRows.push(data);
        }
        return this;
    }
    line(data, semicolon = true) {
        if (data && semicolon && !data.endsWith(';'))
            data += ';';
        data = data ? `${this._indent}${data}` : '';
        this._rows.push(data);
        return this;
    }
    block(beginning, content, bracket = '{') {
        const openBracket = bracket;
        const closeBracket = openBracket === '{' ? '}' : openBracket === '[' ? '];' : ');';
        this._rows.push(`${this._indent}${beginning} ${openBracket}${!content ? ' ' + closeBracket : ''}`);
        if (content) {
            this.increaseIndent();
            content();
            this.reduceIndent();
            this._rows.push(`${this._indent}${closeBracket}`);
        }
        return this;
    }
    increaseIndent() {
        this._indent += '  ';
        return this;
    }
    reduceIndent() {
        this._indent = this._indent.substring(2);
        return this;
    }
    save(path) {
        const result = [];
        const imports = Array.from(this._imports).map(([module_, imports_]) => `import { ${Array.from(imports_).join(', ')} } from '${module_}';`);
        if (imports.length > 0)
            result.push(imports.join('\n'));
        if (this._firstRows.length > 0)
            result.push(this._firstRows.join('\n'));
        if (this._rows.length > 0)
            result.push(this._rows.join('\n'));
        writeFileSync(path, result.join('\n\n'));
    }
}

export { Output };
