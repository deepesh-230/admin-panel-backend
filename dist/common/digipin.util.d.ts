export declare function encodeDigipin(lat: number, lon: number): string | null;
export declare function resolveDigipinFields(latitude?: number | null, longitude?: number | null, pincode?: string | null): {
    digipin: string | null;
    pincode?: string | null;
};
