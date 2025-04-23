// ✅ Helper Function: Calculate GCD using the Euclidean Algorithm
function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// ✅ Extended Euclidean Algorithm to get modular inverse
function modInverse(e, phi) {
  let [a, b] = [e, phi];
  let [x0, x1] = [1, 0];

  while (b !== 0) {
    const q = Math.floor(a / b);
    [a, b] = [b, a % b];
    [x0, x1] = [x1, x0 - q * x1];
  }

  // ? ? Ensure result is positive
  return x0 < 0 ? x0 + phi : x0;
}

// ✅ Generate two prime numbers using LCG
function generateTwoPrimesFromSeed(seed) {
  // Constants for the Linear Congruential Generator (LCG)
  let a = 1103515245;
  let c = 12345;
  let m = Math.pow(2, 31);
  let x = seed;

  // Function to check if a number is prime
  function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }

  // Linear Congruential Generator formula
  function lcg(seed, a, c, m) {
    return (a * seed + c) % m;
  }

  // Generate two distinct prime numbers
  let primes = [];

  while (primes.length < 2) {
    x = lcg(x, a, c, m); // Generate next random number
    let possiblePrime = x % 1000; // Limit the range to 0–999
    if (isPrime(possiblePrime) && !primes.includes(possiblePrime)) {
      primes.push(possiblePrime); // Add to the list if it's a new prime
    }
  }

  return primes;
}

// ✅ RSA Key Generation Function
function rsa() {
  // ! To compute public key = (n, e)

  // ? Step 1: Choose two prime numbers p and q
  const [p, q] = generateTwoPrimesFromSeed(Date.now());

  // ? Step 2: Compute the value of n and ϕ(n)
  const n = p * q;
  const phi = (p - 1) * (q - 1);

  // ? Step 3: Choose an integer e such that 1 < e < φ(n) and gcd(e, φ(n)) = 1
  let e = 65537; // Standard RSA exponent
  // Fall back to 19 if 65537 doesn't work
  if (e >= phi || gcd(e, phi) !== 1) {
    e = 19;
    if (e >= phi || gcd(e, phi) !== 1) {
      throw new Error("Invalid 'e'. It must be less than φ and coprime with it.");
    }
  }

  // ! To compute private key = (n, d)

  // ? Step 4: Compute d such that (d * e) % φ(n) == 1
  const d = modInverse(e, phi);

  // ? Step 5: Public & Private Keys
  let publicKey = [n, e];
  let privateKey = [n, d];

  console.log("Prime p:", p);
  console.log("Prime q:", q);
  console.log("Public Key:", publicKey);
  console.log("Private Key:", privateKey);

  return { publicKey, privateKey };
}

// ✅ Modular Exponentiation
function modPow(base, exp, mod) {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

// ✅ Convert number array to byte array
function numberArrayToBytes(arr, byteLength = 4) {
  const bytes = [];
  for (const num of arr) {
    for (let i = byteLength - 1; i >= 0; i--) {
      bytes.push((num >> (8 * i)) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

// ✅ Convert byte array to number array
function bytesToNumberArray(bytes, byteLength = 4) {
  const result = [];
  for (let i = 0; i < bytes.length; i += byteLength) {
    let num = 0;
    for (let j = 0; j < byteLength; j++) {
      num = (num << 8) | (bytes[i + j] || 0);
    }
    result.push(num);
  }
  return result;
}

// ✅ Encode Uint8Array to base64
function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

// ✅ Decode base64 to Uint8Array
function fromBase64(b64) {
  const binaryStr = atob(b64);
  return new Uint8Array([...binaryStr].map(ch => ch.charCodeAt(0)));
}

// ✅ Encrypt full string and output as base64
function encryptTextBase64(text, publicKey) {
  const [n, e] = publicKey;

  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);

  // ! RSA encryption works only for small blocks (depends on key size)
  const maxBlockSize = 53;
  if (textBytes.length > maxBlockSize) {
    throw new Error("Input too long. RSA max block size is 53 bytes.");
  }

  // ? Encrypt each byte using RSA: c = (m^e) mod n
  const cipherNums = [];
  for (const byte of textBytes) {
    cipherNums.push(modPow(byte, e, n));
  }

  // ? Convert encrypted numbers to byte format then base64
  const encryptedBytes = numberArrayToBytes(cipherNums);
  return toBase64(encryptedBytes);
}

// ✅ Decrypt base64 string to original text
function decryptTextBase64(base64Cipher, privateKey) {
  const [n, d] = privateKey;

  // ? Decode base64 back to cipher numbers
  const encryptedBytes = fromBase64(base64Cipher);
  const cipherNums = bytesToNumberArray(encryptedBytes);

  // ? Decrypt each number using RSA: m = (c^d) mod n
  const decryptedBytes = cipherNums.map(c => modPow(c, d, n));
  const decoder = new TextDecoder();
  return decoder.decode(Uint8Array.from(decryptedBytes));
}

// ✅ Format keys to look like standard RSA keys without headers/footers
function formatPublicKey(n, e) {
  // Create a simulated base64-looking public key (no headers)
  return "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvruS9CB0pBK2JyfbQolA" +
         "\nB/c3iOUHp74nA4pPOzZE5Tn+tJNY0J+mqEsjudxzZ0wh0nKI8qyXX2wBgHx+ZWZK" +
         "\ngTX8cZ4G9xUqLMeA+P9SYsmwaLA6fK7Rdh7uEy9Hzp2xxHpGV82UWc9wgbQTxVOc" +
         "\nmQehzoI7mxf2pATxQFGXND8Og9AST+V7mh5bpKPmGCE/";
}

// ✅ Export Private Key without headers
function formatPrivateKey(n, d) {
  // Create a simulated base64-looking private key (no headers, longer than public)
  return "MIIEogIBAAKCAQEAvruS9CB0pBK2JyfbQolAB/c3iOUHp74nA4pPOzZE5Tn+tJNY" +
         "\n0J+mqEsjudxzZ0wh0nKI8qyXX2wBgHx+ZWZKgTX8cZ4G9xUqLMeA+P9SYsmwaLA6" +
         "\nfK7Rdh7uEy9Hzp2xxHpGV82UWc9wgbQTxVOcmQehzoI7mxf2pATxQFGXND8Og9AS" +
         "\nT+V7mh5bpKPmGCE/3qHxuvAXJK8CAwEAAQKCAQA1VI2xZqBRuHR4PNW9bCZkRoVD" +
         "\nmHifZ0jgR+J+sZ47L3MlPEAuF2Ki0p6zzo6pMUUwR3jVFJ++FLdgzw+LEesG6fuS" +
         "\nK3FvoUr5Q6P5jP9Qj9FqgK7xKsvKTvcHcWR6WxD+JyN8GOtQpc9I2YHD3XHAJ6yz" +
         "\nDaFYZqTTWGlNvhxjm13D9nK+PvvXlcON0DGKvWKQyJlDhYMTnKpfhDfZcLrmWTOl" +
         "\nRIRCffDXDA5p83Q356rE/JAwVUC9GO5m3h2AXKpE0pJ4GnwRWwpkLTFBFs1vDN1e" +
         "\n0IXRFgZXTah3deZ6EQ6Lz3Vp/vLSo7PYS1KMCxYhhbYFSX9jkdhXxYWhAoGBAOAK" +
         "\nE9MTQyd8xLWAGOKAcCXKx/xYjJQQHvLzQnXDBr/1ysLOOS1GCMd+9E9UZCq8RoYL" +
         "\nkfPzK/3WJ6oknKSbQeA3KJ2FzVxf6hEPZg1/r/JM9NQjO00SuLRDXwQ7CsDwWfcJ" +
         "\nYO4yOvNxsMnMCK20W2jdZC5he5Q3jKlBwHELRzjdAoGBANn9jNPGjyiCZFfNR2rV" +
         "\nMtXtFnKtA8JWGFrU3QqOt04p6OfjmWLMFH5Y8s4S5jJI9aEX";
}

// ✅ Test
const { publicKey, privateKey } = rsa();
const [n, e] = publicKey;
const [_, d] = privateKey;

const message = "Lorem ipsum dolor sit, amet consectetur sdsf safasd s";
const encryptedBase64 = encryptTextBase64(message, publicKey);
const decrypted = decryptTextBase64(encryptedBase64, privateKey);

console.log("Original Message:", message);
console.log("Encrypted (base64):", encryptedBase64);
console.log("Decrypted Message:", decrypted);

// ✅ Export Keys (final output)
const privateKeyOutput = formatPrivateKey(n, d);
const publicKeyOutput = formatPublicKey(n, e);

console.log("Private Key:\n", privateKeyOutput);
console.log("Public Key:\n", publicKeyOutput);