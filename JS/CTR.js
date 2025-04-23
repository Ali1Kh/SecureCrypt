let ivString = "1234567890abcdef";
// ! Generate lcg
function generateLcg(length = 16) {
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  let seed = Date.now();

  let key = "";
  for (let i = 0; i < length; i++) {
    seed = (a * seed + c) % m;
    const charCode = 97 + (seed % 26); // a-z
    key += String.fromCharCode(charCode);
  }

  return key;
}

//! CTR encryption function

function encryptWithCTR(PlainText) {
  //* Remove all spaces from the  text
  const text = PlainText.replaceAll(" ", "");

  //* Generate a secret key with lcg
  const keyString = generateLcg(16);
  const key = CryptoJS.enc.Utf8.parse(keyString);
  //* Generate Convert IV to bytes
  const ivBytes = CryptoJS.enc.Utf8.parse(ivString);
  //* Convert the plaintext to a format suitable for cryptographic operations
  const data = CryptoJS.enc.Utf8.parse(text);

  const blockSize = 16;
  let encryptedResult = [];

  //* Encryption for each block
  for (let i = 0; i < data.sigBytes; i += blockSize) {
    const block = data.words.slice(i / 4, (i + blockSize) / 4);

    //* Generate Counter
    let counter = ivBytes.words.slice();
    const blockIndex = Math.floor(i / blockSize);
    //* XOR the last word of the counter with the block index
    counter[counter.length - 1] ^= blockIndex;
    //* Encrypt Counter
    const counterEncrypted = CryptoJS.AES.encrypt(
      CryptoJS.lib.WordArray.create(counter),
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }
    ).ciphertext.words;
    //*  XOR the Message with Counter
    const xorResult = block.map((value, j) => value ^ counterEncrypted[j]);
    //* Add the encrypted block to the result
    encryptedResult = encryptedResult.concat(xorResult);
  }

  //* Convert to Base64
  const encryptedBase64 = CryptoJS.enc.Base64.stringify(
    CryptoJS.lib.WordArray.create(encryptedResult)
  );

  return { key: keyString, encrypted: encryptedBase64 };
}

// Decryption in CTR mode
function decryptCTR(base64Cipher, keyString, ivString) {
  //* Parse key string to a format for CryptoJS
  const key = CryptoJS.enc.Utf8.parse(keyString);
  //* Parse IV to bytes
  const ivBytes = CryptoJS.enc.Utf8.parse(ivString);
  //* Convert the Base64 ciphertext
  const encryptedBytes = CryptoJS.enc.Base64.parse(base64Cipher);
  const blockSize = 16;
  let decryptedResult = [];

  for (let i = 0; i < encryptedBytes.sigBytes; i += blockSize) {
    //* Extract the current block of ciphertext
    const block = encryptedBytes.words.slice(i / 4, (i + blockSize) / 4);
    //*  Generate the same counter value that was used during encryption
    const counter = ivBytes.words.slice();
    const blockIndex = Math.floor(i / blockSize);
    //* XOR the last word of the counter with the block index
    counter[counter.length - 1] ^= blockIndex;

    //* Convert the counter to WordArray
    const counterWordArray = CryptoJS.lib.WordArray.create(counter);

    //* Encrypt Counter Value
    const aesEcb = CryptoJS.AES.encrypt(counterWordArray, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding, // CTR uses NoPadding
    });

    //* Get the encrypted counter value
    const counterEncrypted = aesEcb.ciphertext.words;
    //* XOR the ciphertext block with the encrypted counter to recover plaintext
    const xorResult = block.map((byte, j) => byte ^ counterEncrypted[j]);
    decryptedResult = decryptedResult.concat(xorResult);
  }

  return CryptoJS.enc.Utf8.stringify(
    CryptoJS.lib.WordArray.create(decryptedResult)
  )
    .replace(/\0+$/, "")
    .trim();
}

function encrypt(id) {
  let text = document.getElementById(id).value;
  if (!text) {
    document.getElementById(id).style.border = "2px solid red";
    Toastify({
      text: "Please enter text to hash!",
      style: {
        background: "red",
        borderRadius: "5px",
      },
    }).showToast();
    return;
  } else {
    document.getElementById(id).style.border = "";
  }
  let result = encryptWithCTR(text);
  document.getElementById("encryptOutput").value = result.encrypted;
  document.getElementById("secretKey").innerHTML = result.key;
}

function decrypt(id) {
  let hashed = document.getElementById(id).value;
  if (!hashed) {
    document.getElementById(id).style.border = "2px solid red";
    Toastify({
      text: "Please enter text to decrypt!",
      style: {
        background: "red",
        borderRadius: "5px",
      },
    }).showToast();
    return;
  } else {
    document.getElementById(id).style.border = "";
  }
  let secretKey = document.getElementById("secretKey").value;
  let result = decryptCTR(hashed, secretKey, ivString);
  console.log(result);

  document.getElementById("decryptOutput").value = result;
}
