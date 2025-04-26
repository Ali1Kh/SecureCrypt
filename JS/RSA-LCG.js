// Helper Function: Calculate GCD using the Euclidean Algorithm
function gcd(a, b) {
  // Keep looping until b becomes 0
  while (b !== 0) {
    const temp = b;
    b = a % b; // Update b to the remainder of a divided by b
    a = temp;  // Set a to the previous value of b
  }
  return a; // GCD is stored in a
}

// Extended Euclidean Algorithm to find modular inverse
function extendedGCD(a, b) {
  if (b === 0) return { gcd: a, x: 1, y: 0 }; // Base case
  const { gcd, x: x1, y: y1 } = extendedGCD(b, a % b); // Recursive call
  // Update x and y using results of recursive call
  return { gcd, x: y1, y: x1 - Math.floor(a / b) * y1 };
}

// Find modular inverse of a modulo m using Extended Euclidean Algorithm
function modInverseWithLcgKey(a, m) {
  const { gcd, x } = extendedGCD(a, m);
  if (gcd !== 1) throw new Error("Inverse doesn't exist."); // Modular inverse exists only if GCD is 1
  return ((x % m) + m) % m; // Ensure result is positive
}

// Modular Inverse using LCG-generated candidates
function modInverseLCG(e, phi) {
  // Constants for LCG (Linear Congruential Generator)
  const a = 1103515245;
  const c = 12345;
  const m = Math.pow(2, 31);
  let x = Date.now(); // Initialize seed with current timestamp

  // Try generating a candidate modular inverse
  for (let i = 0; i < 100000; i++) {
    x = (a * x + c) % m; // LCG next value
    const candidate = x % phi;

    if (candidate > 1 && gcd(e, candidate) === 1) {
      try {
        const inv = modInverseWithLcgKey(e, phi);
        return inv; // Return the modular inverse
      } catch {}
    }
  }

  // If no valid inverse found
  throw new Error("No modular inverse found using LCG.");
}

// RSA Key Generation Function using fixed primes and LCG for private key
function rsaLcg() {
  const p = 61;  // First prime number
  const q = 53;  // Second prime number
  const n = p * q; // n = p * q
  const phi = (p - 1) * (q - 1); // Euler's totient function
  let e = 19; // Public exponent

  // Validate e
  if (e >= phi || gcd(e, phi) !== 1) {
    throw new Error("Invalid 'e'. It must be less than φ and coprime with it.");
  }

  const d = modInverseLCG(e, phi); // Generate private exponent d using LCG
  return {
    publicKey: [n, e],
    privateKey: [n, d],
  };
}

// Modular Exponentiation (Efficiently compute base^exp % mod)
function modPow(base, exp, mod) {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod; // If exp is odd, multiply result
    exp = Math.floor(exp / 2); // Divide exp by 2
    base = (base * base) % mod; // Square the base
  }
  return result;
}

// Convert number array to byte array
function numberArrayToBytes(arr, byteLength = 4) {
  const bytes = [];
  for (const num of arr) {
    // Break each number into bytes
    for (let i = byteLength - 1; i >= 0; i--) {
      bytes.push((num >> (8 * i)) & 0xff);
    }
  }
  return new Uint8Array(bytes); // Return as Uint8Array
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

// Encode Uint8Array to Base64 string
function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

// Decode Base64 string to Uint8Array
function fromBase64(b64) {
  const binaryStr = atob(b64);
  return new Uint8Array([...binaryStr].map((ch) => ch.charCodeAt(0)));
}

// Encrypt text to base64 using RSA public key
function encryptTextBase64Lcg(text, publicKey) {
  const [n, e] = publicKey;

  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text); // Convert text to bytes

  const maxBlockSize = 53; // Limit because n is small (n < 2^16)
  if (textBytes.length > maxBlockSize) {
    throw new Error("Input too long. RSA max block size is 53 bytes.");
  }

  const cipherNums = [];
  // Encrypt each byte individually
  for (const byte of textBytes) {
    cipherNums.push(modPow(byte, e, n));
  }

  const encryptedBytes = numberArrayToBytes(cipherNums);
  return toBase64(encryptedBytes); // Return Base64 encoded ciphertext
}

// Decrypt base64 text back to plain text using RSA private key
function decryptTextBase64Lcg(base64Cipher, privateKey) {
  const [n, d] = privateKey;

  const encryptedBytes = fromBase64(base64Cipher); // Decode Base64
  const cipherNums = bytesToNumberArray(encryptedBytes); // Convert to number array

  const decryptedBytes = cipherNums.map((c) => modPow(c, d, n)); // Decrypt each number
  const decoder = new TextDecoder();
  return decoder.decode(Uint8Array.from(decryptedBytes)); // Convert bytes to text
}

// Generate RSA keys on page load
let { publicKey: publicKeyLcg, privateKey: privateKeyLcg } = rsaLcg();

// Bind to Encrypt Button
function encryptWithLcg() {
  const plainText = document.getElementById("plainText").value.trim(); // Get input text
  const outputField = document.getElementById("encryptOutput"); // Get output field
  console.log("Done with LCG");

  try {
    const encrypted = encryptTextBase64Lcg(plainText, publicKeyLcg);
    outputField.value = encrypted; // Show encrypted text
  } catch (err) {
    console.log(err.message);
  }
}

// Bind to Decrypt Button
function decryptLcg() {
  const cipherText = document.getElementById("cipherText").value.trim(); // Get cipher text
  const outputField = document.getElementById("decryptOutput"); // Get output field

  try {
    const decrypted = decryptTextBase64Lcg(cipherText, privateKeyLcg);
    outputField.value = decrypted; // Show decrypted text
  } catch (err) {
    alert("Decryption failed: " + err.message);
  }
}
