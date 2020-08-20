export const invalidDataInAddDescription = [
    '**Invalid data**, e.g.', '- customer not defined', '- invalid date format', '- `requiredApprovals` out of range'
].join('\n');

export const exampleId = '5f347eedf461eb20f419633e';

export function idApiDocSpec(additionalText = '') {
    return { description: `DB-created id ${additionalText}`, type: 'string', example: exampleId }
}
