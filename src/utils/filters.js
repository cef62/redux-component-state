const BLOCKED_PREFIX = '__';
export const filterPrivateField = field => !field.startsWith(BLOCKED_PREFIX);
