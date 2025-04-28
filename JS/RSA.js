// Calculate GCD (Greatest Common Divisor) using Euclidean Algorithm
function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Find Modular Inverse using Extended Euclidean Algorithm
function modInverse(e, phi) {
  let [a, b] = [e, phi]; // Initialize a = e, b = phi
  let [x0, x1] = [1, 0];

  while (b !== 0) {
    const q = Math.floor(a / b);
    [a, b] = [b, a % b];
    [x0, x1] = [x1, x0 - q * x1];
  }

  return x0 < 0 ? x0 + phi : x0;
}

// ===================== Modular Exponentiation =====================

// Efficiently calculate (message^e) % n for RSA encryption
function modPow(message, e, n) {
  let cipher = 1;
  message = message % n; // Take modulo initially
  while (e > 0) {
    if (e % 2 === 1) cipher = (cipher * message) % n; // If exponent is odd, multiply cipher
    e = Math.floor(e / 2); // Divide exponent by 2
    message = (message * message) % n; // Square the message
  }
  return cipher;
}

// ===================== Byte Conversion Helpers =====================

// Convert an array of numbers to a byte array
function numberArrayToBytes(arr, byteLength = 4) {
  const bytes = [];
  for (const num of arr) {
    for (let i = byteLength - 1; i >= 0; i--) {
      bytes.push((num >> (8 * i)) & 0xff); // Extract each byte
    }
  }
  return new Uint8Array(bytes);
}

// Convert a byte array back to an array of numbers
function bytesToNumberArray(bytes, byteLength = 4) {
  const result = [];
  for (let i = 0; i < bytes.length; i += byteLength) {
    let num = 0;
    for (let j = 0; j < byteLength; j++) {
      num = (num << 8) | (bytes[i + j] || 0); // Combine bytes into number
    }
    result.push(num);
  }
  return result;
}

// ===================== Base64 Encoding Helpers =====================

// Encode a Uint8Array into a Base64 string
function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

// Decode a Base64 string into a Uint8Array
function fromBase64(b64) {
  const binaryStr = atob(b64);
  return new Uint8Array([...binaryStr].map((ch) => ch.charCodeAt(0)));
}

// !===================== START
// Generate two primes from a seed
function generateTwoPrimesFromSeed(seed) {
  // Constants for LCG
  const a = 1103515245;
  const c = 12345;
  const m = Math.pow(2, 31);
  let x = seed; // Starting seed

  // Check if a number is prime
  function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }

  // LCG function to generate next random number
  function lcg(seed, a, c, m) {
    return (a * seed + c) % m;
  }

  const primes = []; // Array to store found primes

  // Keep generating until we find 2 unique primes
  while (primes.length < 2) {
    x = lcg(x, a, c, m); // Generate next random number
    const possiblePrime = x % 1000; // Keep number small
    if (isPrime(possiblePrime) && !primes.includes(possiblePrime)) {
      primes.push(possiblePrime); // Add prime if it's not repeated in the array
    }
  }

  return primes; // Return the two primes
}

// Generate RSA public and private keys
function rsa() {
  const [p, q] = generateTwoPrimesFromSeed(Date.now());
  const n = p * q;
  const phi = (p - 1) * (q - 1); // Euler's totient function
  let e = 19; // Choose a small fixed e

  // Check if 'e' is valid
  if (e >= phi || gcd(e, phi) !== 1) {
    throw new Error("Invalid 'e'. It must be less than φ and coprime with it.");
  }

  const d = modInverse(e, phi); // Find private exponent 'd'

  return {
    publicKey: [n, e],
    privateKey: [n, d],
  };
}

// !Encrypt text and output Base64 encoded ciphertext
function encryptTextBase64(text, publicKey) {
  const [n, e] = publicKey; // Extract public key components

  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text); // Encode text to bytes

  const maxBlockSize = 53;
  if (textBytes.length > maxBlockSize) {
    throw new Error("Input too long. RSA max block size is 53 bytes.");
  }

  const cipherNums = [];
  // Encrypt each byte separately using RSA
  for (const byte of textBytes) {
    cipherNums.push(modPow(byte, e, n));
  }

  const encryptedBytes = numberArrayToBytes(cipherNums); // Convert cipher numbers to bytes
  return toBase64(encryptedBytes); // Return Base64 encoded cipher
}

// !Decrypt Base64 encoded ciphertext back to text
function decryptTextBase64(base64Cipher, privateKey) {
  const [n, d] = privateKey; // Extract private key components

  const encryptedBytes = fromBase64(base64Cipher); // Decode Base64 to bytes
  const cipherNums = bytesToNumberArray(encryptedBytes); // Convert bytes to cipher numbers

  // Decrypt each number
  const decryptedBytes = cipherNums.map((c) => modPow(c, d, n));
  const decoder = new TextDecoder();
  return decoder.decode(Uint8Array.from(decryptedBytes)); // Convert bytes back to text
}
// !===================== End

// ===================== Main Logic =====================

// Generate public and private RSA keys
let { publicKey, privateKey } = rsa();

// Function called when "Encrypt" button is clicked
function encrypt() {
  const plainText = document.getElementById("plainText").value.trim(); // Get text from input field
  const outputField = document.getElementById("encryptOutput"); // Get output field
  console.log("Done as Standard Key");
  try {
    const encrypted = encryptTextBase64(plainText, publicKey); // Encrypt the text
    outputField.value = encrypted; // Display the encrypted text
  } catch (err) {
    alert(err.message); // Show error if any
  }
}

// Function called when "Decrypt" button is clicked
function decrypt() {
  const cipherText = document.getElementById("cipherText").value.trim(); // Get cipher text
  const outputField = document.getElementById("decryptOutput"); // Get output field

  try {
    const decrypted = decryptTextBase64(cipherText, privateKey); // Decrypt the cipher text
    outputField.value = decrypted; // Display the decrypted text
  } catch (err) {
    alert("Decryption failed: " + err.message); // Show error if any
  }
}
