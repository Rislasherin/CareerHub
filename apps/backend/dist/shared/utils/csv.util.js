"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsvContent = void 0;
const parseCsvLine = (line) => {
    const values = [];
    let currentValue = "";
    let insideQuotes = false;
    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        if (character === '"') {
            const nextCharacter = line[index + 1];
            if (insideQuotes && nextCharacter === '"') {
                currentValue += '"';
                index += 1;
                continue;
            }
            insideQuotes = !insideQuotes;
            continue;
        }
        if (character === "," && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = "";
            continue;
        }
        currentValue += character;
    }
    values.push(currentValue.trim());
    return values;
};
const parseCsvContent = (csvContent) => {
    const lines = csvContent
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    if (lines.length < 2) {
        return [];
    }
    const headers = parseCsvLine(lines[0]).map((header) => header.trim());
    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        return headers.reduce((row, header, index) => {
            row[header] = values[index]?.trim() ?? "";
            return row;
        }, {});
    });
};
exports.parseCsvContent = parseCsvContent;
