function leftShift(val, bits) {
  return ((val << bits) | (val >>> (32 - bits))) >>> 0;
}
function toHexa(val) {
  return val.toString(16).padStart(8, "0");
}

// ! Main Function : Compute SHA-1 Hash of Input Text
function hashWithSha1(text) {
  // ? Step 1 : Get Ascii Code For Each Character
  let charsAsciCodes = [];
  for (let i = 0; i < text.length; i++) {
    charsAsciCodes.push(text.charCodeAt(i));
  }

  // ? Step 2 : Convert Ascii Code to 8-bit Binary
  let charInBinary = [];
  for (let i = 0; i < charsAsciCodes.length; i++) {
    let charBinary = charsAsciCodes[i].toString(2).padStart(8, "0");
    charInBinary.push(charBinary);
  }

  // ? Step 3 : Join Binary
  let bitsText = charInBinary.join("");

  // ? Step 4 : Add Extra Bit In Last of binary numbers
  bitsText += "1";

  //* Store the length of the original text
  let charsInTextLength = bitsText.length;
  // ? Step 5 : Add 0 To Reach 448 Bits
  bitsText = bitsText.padEnd(448, "0");

  // ? Step 6 : Append original length as 64-bit binary
  let binaryOfSummationBitsx64 = (charsInTextLength - 1).toString(2);
  // * Make Number For Summation Bits 64 Bit
  if (binaryOfSummationBitsx64.length < 64) {
    binaryOfSummationBitsx64 = binaryOfSummationBitsx64.padStart(64, "0");
  }
  bitsText += binaryOfSummationBitsx64;

  // ? Step 7 : Process in 512-bit chunks
  let numberOfChunks = bitsText.length / 512;

  // ? Step 8 : Initial Hash Values
  let h0 = 0b01100111010001010010001100000001; // ! 0x67452301
  let h1 = 0b11101111110011011010101110001001; // ! 0xEFCDAB89
  let h2 = 0b10011000101110101101110011111110; // ! 0x98BADCFE
  let h3 = 0b00010000001100100101010001110110; // ! 0x10325476
  let h4 = 0b11000011110100101110000111110000; // ! 0xC3D2E1F0

  for (let chunkIndex = 0; chunkIndex < numberOfChunks; chunkIndex++) {
    let chunk = bitsText.slice(chunkIndex * 512, (chunkIndex + 1) * 512);

    // ? Step 9 : Break chunk into 16 words
    let w = [];
    for (let i = 0; i < 16; i++) {
      w[i] = parseInt(chunk.slice(i * 32, (i + 1) * 32), 2);
    }

    // ? Step 10 : Extend to 80 words
    for (let i = 16; i < 80; i++) {
      w[i] = leftShift(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }

    // ? Step 11 : Initialize hash value for this chunk
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let i = 0; i < 80; i++) {
      let f, k;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0b01011010100000100111100110011001; // ! 0x5a827999
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0b01101110110110011110101110100001; // ! 0x6ed9eba1
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0b10001111000110111011110011011100; // ! 0x8f1bbcdc
      } else {
        f = b ^ c ^ d;
        k = 0b11001010011000101100000111010110; // ! 0xca62c1d6
      }
      let temp = (leftShift(a, 5) + f + e + k + w[i]) >>> 0;
      e = d;
      d = c;
      c = leftShift(b, 30) >>> 0;
      b = a;
      a = temp;
    }

    // ? Step 12 : Add chunk hash to result
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  // ? Step 13 : Final Hash
  const hash = toHexa(h0) + toHexa(h1) + toHexa(h2) + toHexa(h3) + toHexa(h4);

  // ? Step 14 : Output Result

  return hash;
}

function generateHash(id) {
  let text = document.getElementById(id).value;
  if (!text) {
    document.getElementById(id).style.border = "2px solid red";
    Toastify({
      text: "Please enter text to encrypt!",
      style: {
        background: "red",
        borderRadius: "5px",
      },
    }).showToast();
    return;
  } else {
    document.getElementById(id).style.border = "";
  }
  let hashedText = hashWithSha1(text);
  document.getElementById("sha1OutputText").value = hashedText;
}

function verifySha1() {
  let text = document.getElementById("sha1VerifyInput").value;
  let hash = document.getElementById("sha1VerifyHash").value;
  let hashedText = hashWithSha1(text);

  // if (!text && !hash) {
  //   document.getElementById("sha1VerifyInput").style.border = "2px solid red";
  //   document.getElementById("sha1VerifyHash").style.border = "2px solid red";
  //   Toastify({
  //     text: "Please enter text and hash to verify!",
  //     style: {
  //       background: "red",
  //       borderRadius: "5px",
  //     },
  //   }).showToast();
  //   return;
  // } else
  if (!text) {
    document.getElementById("sha1VerifyInput").style.border = "2px solid red";
    Toastify({
      text: "Please enter text to hash!",
      style: {
        background: "red",
        borderRadius: "5px",
      },
    }).showToast();
    return;
  } else if (!hash) {
    document.getElementById("sha1VerifyInput").style.border = "";
    document.getElementById("sha1VerifyHash").style.border = "2px solid red";
    Toastify({
      text: "Please enter hash to verify!",
      style: {
        background: "red",
        borderRadius: "5px",
      },
    }).showToast();
    return;
  }
  // Verify
  if (hashedText === hash) {
    document.getElementById("sha1VerifyInput").style.border = "2px solid green";
    document.getElementById("sha1VerifyHash").style.border = "2px solid green";
    Toastify({
      text: "Hash verified successfully!",
      style: {
        background: "green",
        borderRadius: "5px",
      },
    }).showToast();
  } else {
    document.getElementById("sha1VerifyInput").style.border = "2px solid red";
    document.getElementById("sha1VerifyHash").style.border = "2px solid red";
    Toastify({
      text: "Hash verification failed!",
      style: {
        background: "red",
        borderRadius: "5px",
      },
    }).showToast();
  }
}
