// Linear Congruential Generator to generate two distinct prime numbers
function generateTwoPrimesFromSeed(seed) {
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

  // LCG formula to generate random numbers
  function lcg(seed, a, c, m) {
    return (a * seed + c) % m;
  }

  let primes = [];
  // Increase the range for generating primes that will result in a 515-bit n
  while (primes.length < 2) {
    x = lcg(x, a, c, m);
    let possiblePrime = x % 1000000; // Limit the range to larger primes (~1 million)
    if (isPrime(possiblePrime) && !primes.includes(possiblePrime) && possiblePrime > Math.pow(2, 255)) {
      primes.push(possiblePrime);
    }
  }

  let [p, q] = primes;
  return { p, q };
}

// Extended Euclidean Algorithm to calculate modular inverse
function modInverse(e, phi) {
  let t = 0, newT = 1;
  let r = phi, newR = e;

  while (newR !== 0) {
    let quotient = Math.floor(r / newR);
    [t, newT] = [newT, t - quotient * newT];
    [r, newR] = [newR, r - quotient * newR];
  }

  if (r > 1) throw new Error("No modular inverse exists");
  if (t < 0) t += phi;
  return t;
}

// RSA Encryption: Encrypts a string using character codes
function rsaEncrypt(plaintext, publicKey) {
  const { e, n } = publicKey;
  const result = [];

  for (let i = 0; i < plaintext.length; i++) {
    const charCode = plaintext.charCodeAt(i);
    const encrypted = BigInt(charCode) ** BigInt(e) % BigInt(n);
    result.push(encrypted.toString());
  }

  return result;
}

// RSA Decryption: Decrypts an array of encrypted codes
function rsaDecrypt(cipherArray, privateKey) {
  const { d, n } = privateKey;
  let result = "";

  for (let i = 0; i < cipherArray.length; i++) {
    const decrypted = BigInt(cipherArray[i]) ** BigInt(d) % BigInt(n);
    result += String.fromCharCode(Number(decrypted));
  }

  return result;
}

// Format base64 string with 64-character lines
function formatBase64(str) {
  return str.match(/.{1,64}/g).join("\n");
}

// Simulate PEM format by encoding JSON as Base64 (using btoa for browser)
function toPemKey(title, keyData) {
  const json = JSON.stringify(keyData);
  const base64 = btoa(json); // Use btoa for browser (not Node.js)
  return `-----BEGIN ${title}-----\n${formatBase64(base64)}\n-----END ${title}-----`;
}

// Export Public Key in PEM format
function exportPublicKeyPem(publicKey) {
  return toPemKey("PUBLIC KEY", publicKey);
}

// Export Private Key in PEM format
function exportPrivateKeyPem(privateKey) {
  return toPemKey("RSA PRIVATE KEY", privateKey);
}

// Generate RSA Key Pair and export as PEM
function getKeyPair() {
  const seed = Date.now();
  const { p, q } = generateTwoPrimesFromSeed(seed);
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const e = 65537;
  const d = modInverse(e, phi);

  const publicKey = { e, n };
  const privateKey = { d, n, p, q };

  const publicKeyPem = exportPublicKeyPem(publicKey);
  const privateKeyPem = exportPrivateKeyPem(privateKey);

  return {
    seed,
    p,
    q,
    publicKey,
    privateKey,
    publicKeyPem,
    privateKeyPem
  };
}

// === DEMO USAGE ===

return;

// const {
//   seed,
//   p,
//   q,
//   publicKey,
//   privateKey,
//   publicKeyPem,
//   privateKeyPem
// } = getKeyPair();

// const plaintext = "Hello RSA!";
// const ciphertext = rsaEncrypt(plaintext, publicKey);
// const decryptedText = rsaDecrypt(ciphertext, privateKey);

// // === OUTPUT RESULTS ===
// console.log("Seed:", seed);
// console.log("Generated Primes:", p, q);
// console.log("Public Key PEM:\n", publicKeyPem);
// console.log("Private Key PEM:\n", privateKeyPem);
// console.log("Plaintext:", plaintext);
// console.log("Encrypted:", ciphertext);
// console.log("Decrypted:", decryptedText);
