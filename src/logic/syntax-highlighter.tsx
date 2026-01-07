import React from 'react';

export interface Token {
    type: string;
    value: string;
}

const keywords = [
    'const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
    'try', 'catch', 'finally', 'throw', 'return', 'break', 'continue', 'class', 'extends', 'import',
    'export', 'from', 'as', 'async', 'await', 'yield', 'new', 'this', 'super', 'static', 'public',
    'private', 'protected', 'abstract', 'interface', 'type', 'enum', 'namespace', 'module', 'declare',
    'implements', 'keyof', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'undefined',
    'null', 'true', 'false', 'boolean', 'string', 'number', 'object', 'any', 'unknown', 'never',
    'def', 'lambda', 'with', 'pass', 'elif', 'and', 'or', 'not', 'is', 'None', 'True', 'False',
    'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'tuple', 'set'
];

const operators = [
    '===', '!==', '==', '!=', '<=', '>=', '=>', '...', '?.', '??', '??=',
    '+=', '-=', '*=', '/=', '%=', '++', '--', '<<', '>>', '>>>',
    '&&', '||', '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':'
];

export function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < code.length) {
        const char = code[i];

        if (/\s/.test(char)) {
            let whitespace = '';
            while (i < code.length && /\s/.test(code[i])) {
                whitespace += code[i];
                i++;
            }
            tokens.push({ type: 'whitespace', value: whitespace });
            continue;
        }

        if (char === '/' && i + 1 < code.length) {
            if (code[i + 1] === '/') {
                let comment = '';
                while (i < code.length && code[i] !== '\n') {
                    comment += code[i];
                    i++;
                }
                tokens.push({ type: 'comment', value: comment });
                continue;
            } else if (code[i + 1] === '*') {
                let comment = '';
                comment += code[i++];
                comment += code[i++];
                while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) {
                    comment += code[i];
                    i++;
                }
                if (i < code.length - 1) {
                    comment += code[i++];
                    comment += code[i++];
                }
                tokens.push({ type: 'comment', value: comment });
                continue;
            }
        }

        if (char === '#') {
            let comment = '';
            while (i < code.length && code[i] !== '\n') {
                comment += code[i];
                i++;
            }
            tokens.push({ type: 'comment', value: comment });
            continue;
        }

        if (char === '"' || char === "'" || char === '`') {
            const quote = char;
            let string = char;
            i++;

            while (i < code.length) {
                if (code[i] === quote) {
                    string += code[i];
                    i++;
                    break;
                } else if (code[i] === '\\' && i + 1 < code.length) {
                    string += code[i++];
                    string += code[i++];
                } else {
                    string += code[i];
                    i++;
                }
            }
            tokens.push({ type: quote === '`' ? 'template-literal' : 'string', value: string });
            continue;
        }

        if (/\d/.test(char) || (char === '.' && i + 1 < code.length && /\d/.test(code[i + 1]))) {
            let number = '';
            while (i < code.length && (/[\d._]/.test(code[i]) ||
                (code[i].toLowerCase() === 'e' && i + 1 < code.length && (/[+-\d]/.test(code[i + 1]))))) {
                number += code[i];
                i++;
            }
            tokens.push({ type: 'number', value: number });
            continue;
        }

        let foundOperator = false;
        for (const op of operators) {
            if (code.substr(i, op.length) === op) {
                tokens.push({ type: 'operator', value: op });
                i += op.length;
                foundOperator = true;
                break;
            }
        }
        if (foundOperator) continue;

        if (/[a-zA-Z_$]/.test(char)) {
            let identifier = '';
            while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
                identifier += code[i];
                i++;
            }

            let j = i;
            while (j < code.length && /\s/.test(code[j])) j++;
            const isFunction = j < code.length && code[j] === '(';

            if (keywords.includes(identifier)) {
                tokens.push({ type: 'keyword', value: identifier });
            } else if (isFunction) {
                tokens.push({ type: 'function', value: identifier });
            } else {
                tokens.push({ type: 'identifier', value: identifier });
            }
            continue;
        }

        tokens.push({ type: 'other', value: char });
        i++;
    }

    return tokens;
}

interface HighlightedCodeProps {
    code: string;
    theme?: string;
}

export const HighlightedCode: React.FC<HighlightedCodeProps> = ({ code, theme = 'amoled' }) => {
    const tokens = tokenize(code);

    return (
        <React.Fragment>
            {tokens.map((token, index) => {
                const className = `token-${token.type}`;
                return (
                    <span key={index} className={className}>
                        {token.value}
                    </span>
                );
            })}
        </React.Fragment>
    );
};
