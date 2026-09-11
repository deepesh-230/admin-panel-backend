export declare function normalizeRow(raw: Record<string, string>): Record<string, string>;
export declare function pick(row: Record<string, string>, ...keys: string[]): string;
export declare function parseBool(value: string | undefined, fallback?: boolean): boolean;
export declare function parseIntSafe(value: string | undefined, fallback?: number): number;
export declare function parseFloatSafe(value: string | undefined): number | undefined;
export declare function isUuid(value: string): boolean;
