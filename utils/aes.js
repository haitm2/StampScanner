// import crypto from 'crypto'
import CryptoAesCbc from 'react-native-crypto-aes-cbc';

export async function decrypt(text) {
    try {
        var decrypted = await CryptoAesCbc.decryptByBase64(
            'bWFrZXRoZV9iZXN0X2FwcA==',
            'bWFrZXRoZWJlc3RhcHBfaGlwc3RhbXBfaWRlbnRpZnk=',
            text,
            '256'
        );
        return decrypted;
    } catch (err) {
        console.log(err);
        return '';
    }
}

export async function decrypt2(text) {
    try {
        var decrypted = await CryptoAesCbc.decryptByBase64(
            'YW50aXF1ZV9pZGVudGlmeQ==',
            'YW50aXF1ZWlkZW50aWZ5X3VuaXZlcnNhbHRlY2hsYWI=',
            text,
            '256'
        );
        return decrypted;
    } catch (err) {
        console.log(err);
        return '';
    }
}
