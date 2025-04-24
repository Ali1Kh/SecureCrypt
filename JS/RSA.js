// Helper Function: Calculate GCD using the Euclidean Algorithm
function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Extended Euclidean Algorithm to get modular inverse
function modInverse(e, phi) {
  let [a, b] = [e, phi];
  let [x0, x1] = [1, 0];

  while (b !== 0) {
    const q = Math.floor(a / b);
    [a, b] = [b, a % b];
    [x0, x1] = [x1, x0 - q * x1];
  }

  return x0 < 0 ? x0 + phi : x0;
}

// Generate two prime numbers using LCG
function generateTwoPrimesFromSeed(seed) {
  const a = 1103515245;
  const c = 12345;
  const m = Math.pow(2, 31);
  let x = seed;

  function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }

  function lcg(seed, a, c, m) {
    return (a * seed + c) % m;
  }

  const primes = [];

  while (primes.length < 2) {
    x = lcg(x, a, c, m);
    const possiblePrime = x % 1000;
    if (isPrime(possiblePrime) && !primes.includes(possiblePrime)) {
      primes.push(possiblePrime);
    }
  }

  return primes;
}

// RSA Key Generation Function
function rsa() {
  const [p, q] = generateTwoPrimesFromSeed(Date.now());
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  let e = 19;

  if (e >= phi || gcd(e, phi) !== 1) {
    throw new Error("Invalid 'e'. It must be less than φ and coprime with it.");
  }

  const d = modInverse(e, phi);
  return {
    publicKey: [n, e],
    privateKey: [n, d],
  };
}

// Modular Exponentiation
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

// Convert number array to byte array
function numberArrayToBytes(arr, byteLength = 4) {
  const bytes = [];
  for (const num of arr) {
    for (let i = byteLength - 1; i >= 0; i--) {
      bytes.push((num >> (8 * i)) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

// Convert byte array to number array
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

// Encode Uint8Array to base64
function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

// Decode base64 to Uint8Array
function fromBase64(b64) {
  const binaryStr = atob(b64);
  return new Uint8Array([...binaryStr].map((ch) => ch.charCodeAt(0)));
}

// Encrypt text to base64
function encryptTextBase64(text, publicKey) {
  const [n, e] = publicKey;

  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);

  const maxBlockSize = 53;
  if (textBytes.length > maxBlockSize) {
    throw new Error("Input too long. RSA max block size is 53 bytes.");
  }

  const cipherNums = [];
  for (const byte of textBytes) {
    cipherNums.push(modPow(byte, e, n));
  }

  const encryptedBytes = numberArrayToBytes(cipherNums);
  return toBase64(encryptedBytes);
}

// Decrypt base64 to text
function decryptTextBase64(base64Cipher, privateKey) {
  const [n, d] = privateKey;

  const encryptedBytes = fromBase64(base64Cipher);
  const cipherNums = bytesToNumberArray(encryptedBytes);

  const decryptedBytes = cipherNums.map((c) => modPow(c, d, n));
  const decoder = new TextDecoder();
  return decoder.decode(Uint8Array.from(decryptedBytes));
}

// Main Logic
let { publicKey, privateKey } = rsa();

// Bind to Encrypt Button
function encrypt() {
  const plainText = document.getElementById("plainText").value.trim();
  const outputField = document.getElementById("encryptOutput");
  console.log("Done as Standerd Key");
  try {
    const encrypted = encryptTextBase64(plainText, publicKey);
    outputField.value = encrypted;
  } catch (err) {
    alert(err.message);
  }
}

// Bind to Decrypt Button
function decrypt() {
  const cipherText = document.getElementById("cipherText").value.trim();
  const outputField = document.getElementById("decryptOutput");

  try {
    const decrypted = decryptTextBase64(cipherText, privateKey);
    outputField.value = decrypted;
  } catch (err) {
    alert("Decryption failed: " + err.message);
  }
}
