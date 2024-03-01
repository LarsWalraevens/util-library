import pako from 'pako';

/**
 * 
 * Converts compressed data to uncompressed JSON
 * @param res 
 * @param hasLog (boolean) Print log or not
 * @returns uncompressed JSON
 * 
 */
export function handleCompressedData(res: any, hasLog?: boolean): any {
    try {
        if (hasLog === undefined || hasLog === true) console.log("Method handleCompressedData");
        // Decode base64 (convert ASCII to binary)
        const strData = atob(res);

        // Convert binary string to character-number array
        const charData = strData.split('').map(x => x.charCodeAt(0));

        // Turn number array into a byte-array
        const binData = new Uint8Array(charData);

        // Pako magic
        const strResult = pako.inflate(binData, { to: 'string' });

        // Convert gunzipped byteArray back to ASCII string:
        const jsonData = JSON.parse(strResult);

        hasLog === undefined || hasLog === true ? console.log({ compressedData: jsonData }) : null;

        return jsonData;
    } catch (error) {
        console.error(`handleCompressedData: ${error}`);
        throw new Error(`handleCompressedData: ${error}`);
    }
}