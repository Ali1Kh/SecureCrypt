// ? Step 1 : Left rotate a 32-bit number by "bits" places
function leftShift(val, bits) {
  return ((val << bits) | (val >>> (32 - bits))) >>> 0;
}

// ? Step 2 : Convert integer to hexadecimal string with 8 digits
function toHexa(val) {
  return val.toString(16).padStart(8, "0");
}

// ? Main Function : Compute SHA-1 Hash of Input Text
function hashWithSha1() {
  const text = document.getElementById("sha1InputText").value;

  // ? Step 3 : Convert text to array of ASCII codes
  const asciiCodes = Array.from(text).map(c => c.charCodeAt(0));

  // ? Step 4 : Convert each ASCII code to 8-bit binary and join to one long bit string
  let bitString = asciiCodes.map(c => c.toString(2).padStart(8, "0")).join("");

  // ? Step 5 : Append a single '1' bit to the message
  bitString += "1";

  // ? Step 6 : Append '0' bits until length ≡ 448 mod 512
  while ((bitString.length % 512) !== 448) {
    bitString += "0";
  }

  // ? Step 7 : Append original message length as a 64-bit binary (big-endian)
  const originalLength = text.length * 8;
  bitString += originalLength.toString(2).padStart(64, "0");

  // ? Step 8 : Split full bit string into 512-bit chunks
  const chunks = [];
  for (let i = 0; i < bitString.length; i += 512) {
    chunks.push(bitString.slice(i, i + 512));
  }

  // ? Step 9 : Initialize SHA-1 hash values (5 words)
  let h0 = 0x67452301;
  let h1 = 0xEFCDAB89;
  let h2 = 0x98BADCFE;
  let h3 = 0x10325476;
  let h4 = 0xC3D2E1F0;

  // ? Step 10 : Process each 512-bit chunk
  for (const chunk of chunks) {
    // ? Step 10.1 : Break chunk into sixteen 32-bit words
    const words = [];
    for (let i = 0; i < 512; i += 32) {
      words.push(parseInt(chunk.slice(i, i + 32), 2));
    }

    // ? Step 10.2 : Extend 16 words to 80 words
    for (let i = 16; i < 80; i++) {
      const val = words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16];
      words[i] = leftShift(val, 1);
    }

    // ? Step 10.3 : Initialize working variables a, b, c, d, e
    let a = h0, b = h1, c = h2, d = h3, e = h4;

    // ? Step 10.4 : Main SHA-1 compression loop (80 rounds)
    for (let i = 0; i < 80; i++) {
      let f, k;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5A827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ED9EBA1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8F1BBCDC;
      } else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }

      const temp = (leftShift(a, 5) + f + e + k + words[i]) >>> 0;
      e = d;
      d = c;
      c = leftShift(b, 30) >>> 0;
      b = a;
      a = temp;
    }

    // ? Step 10.5 : Add the chunk's result to the hash values
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  // ? Step 11 : Concatenate final hash value from h0 to h4
  const hash = toHexa(h0) + toHexa(h1) + toHexa(h2) + toHexa(h3) + toHexa(h4);

  // ? Step 12 : Output the hash to the result field
  document.getElementById("sha1OutputText").value = hash;
  return hash;
}
