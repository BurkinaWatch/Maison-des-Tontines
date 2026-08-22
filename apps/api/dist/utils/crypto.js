import CryptoJS from "crypto-js";
export function hashPhone(phone) {
    const normalized = phone.replace(/[\s\-()]/g, "");
    return CryptoJS.SHA256(normalized).toString(CryptoJS.enc.Hex);
}
export function generateRandomBytes(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
    }
    return result;
}
//# sourceMappingURL=crypto.js.map