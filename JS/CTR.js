// Linear Congruential Generator (LCG) for key stream generation
function generateKeyStream(seed, length) {
    const a = 1664525;  // Multiplier
    const c = 1013904223; // Increment
    const m = Math.pow(2, 32); // Modulus
    let keyStream = [];
    let x = seed;

    for (let i = 0; i < length; i++) {
        x = (a * x + c) % m;
        // Convert to byte (0-255)
        keyStream.push((x >> 16) & 0xFF);
    }

    return keyStream;
}

// Convert string to array of character codes
function stringToBytes(str) {
    let bytes = [];
    for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}

// Convert byte (ASCII ) array to string
function bytesToString(bytes) {
    return String.fromCharCode(...bytes);
}

// XOR two byte arrays
function xorBytes(arr1, arr2) {
    let result = [];
    for (let i = 0; i < arr1.length; i++) {
        result.push(arr1[i] ^ arr2[i]);
    }
    return result;
}

// CTR encryption function
function encryptCTR(plaintext, seed, nonce) {
    const blockSize = 16;
    const plaintextBytes = stringToBytes(plaintext);
    let ciphertextBytes = [];

    for (let i = 0; i < plaintextBytes.length; i += blockSize) {
        // Create counter block: nonce + counter
        let counter = Math.floor(i / blockSize);
        let counterBlock = [];

        // Add nonce (fixed)
        for (let j = 0; j < nonce.length; j++) {
            counterBlock.push(nonce[j]);
        }

        // Add counter (as 4 bytes)
        for (let j = 3; j >= 0; j--) {
            counterBlock.push((counter >> (8 * j)) & 0xFF);
        }

        // Generate key stream block
        let keyStream = generateKeyStream(seed + counter, blockSize);

        // Slice plaintext block
        let block = plaintextBytes.slice(i, i + blockSize);

        // XOR block with keystream
        let cipherBlock = xorBytes(block, keyStream.slice(0, block.length));
        ciphertextBytes.push(...cipherBlock);
    }

    return ciphertextBytes;
}

// Decryption is same as encryption in CTR mode
function decryptCTR(ciphertextBytes, seed, nonce) {
    const blockSize = 16;
    let decryptedBytes = [];

    for (let i = 0; i < ciphertextBytes.length; i += blockSize) {
        let counter = Math.floor(i / blockSize);
        let counterBlock = [];

        for (let j = 0; j < nonce.length; j++) {
            counterBlock.push(nonce[j]);
        }

        for (let j = 3; j >= 0; j--) {
            counterBlock.push((counter >> (8 * j)) & 0xFF);
        }

        let keyStream = generateKeyStream(seed + counter, blockSize);

        let block = ciphertextBytes.slice(i, i + blockSize);
        let plainBlock = xorBytes(block, keyStream.slice(0, block.length));
        decryptedBytes.push(...plainBlock);
    }

    return bytesToString(decryptedBytes);
}

// Example usage:
let message = "Hello, this is a test!";
let seed = 123456; // LCG seed
let nonce = [1, 2, 3, 4]; // Fixed nonce (4 bytes)

let encrypted = encryptCTR(message, seed, nonce);
console.log("Encrypted bytes:", encrypted);

let decrypted = decryptCTR(encrypted, seed, nonce);
console.log("Decrypted text:", decrypted);
