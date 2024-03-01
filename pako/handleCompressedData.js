import pako from 'pako';

export function handleCompressedData(res) {
    try {
        console.log("Method handleCompressedData")
        // Decode base64 (convert ascii to binary)
        var strData = atob(res.data);

        // Convert binary string to character-number array
        var charData = strData.split('').map(function (x) { return x.charCodeAt(0); });

        // Turn number array into byte-array
        var binData = new Uint8Array(charData);

        // Pako magic
        var strData = pako.inflate(binData, { to: 'string' });

        // Convert gunzipped byteArray back to ascii string:
        // var strData = String.fromCharCode.apply(null, [...new Uint16Array(data)]);
        // var item = JSON.parse(pako.inflate(res.data, { to: 'string' }))
        // var item = ungzip(res.data, { windowBits: '16+MAX_WBITS' })
        var jsonData = (JSON.parse(strData));
        console.log({ compressedData: jsonData })
        return jsonData;

    } catch (error) {
        throw Error(`handleCompressedData: ${error}`)
    }

}