function leftShift(val, bits) {
  return ((val << bits) | (val >>> (32 - bits))) >>> 0;
}

function toHexa(val) {
  return val.toString(16).padStart(8, "0");
}

// ! SHA-1
function hashWithSha1() {
  let text = document.getElementById("sha1InputText").value;
  // ? Step 1 : Get Ascii Code For Each Character
  let charsAsciCodes = [];
  for (let i = 0; i < text.length; i++) {
    charsAsciCodes.push(text.charCodeAt(i));
  }
  // ? Step 2 : Covert Ascii Code to Decimal Number 8 binary digits
  let charInBinary = [];
  for (let i = 0; i < charsAsciCodes.length; i++) {
    let charBinary = charsAsciCodes[i].toString(2);
    // * Make Each Binary Number 8 bit
    if (charBinary.length < 8) {
      for (let i = 0; i < 8 - charBinary.length; i++) {
        charBinary = "0" + charBinary;
      }
    }
    charInBinary.push(charBinary);
  }
  // ? Step 3 : Make Original Text from  Binary numbers;

  let bitsText = charInBinary.join("");

  // ? Step 4 : Add Extra Bit In Last of binary numbers
  bitsText += "1";
  // ? Step 5 : Add 0 To Reach 448 Bits
  let charsInTextLength = bitsText.length;
  for (let i = 0; i < 448 - charsInTextLength; i++) {
    bitsText += "0";
  }
  // ? Step 6 : Get Binary Number For Summation Bits of the original text
  let binaryOfSummationBitsx64 = (charsInTextLength - 1).toString(2);
  // * Make Number For Summation Bits 64 Bit
  if (binaryOfSummationBitsx64.length < 64) {
    let binaryOfSummationBitsLength = binaryOfSummationBitsx64.length;
    for (let i = 0; i < 64 - binaryOfSummationBitsLength; i++) {
      binaryOfSummationBitsx64 = "0" + binaryOfSummationBitsx64;
    }
  }

  // ? Step 7 Add x64 Summation Bits To Original Text
  bitsText += binaryOfSummationBitsx64;

  // ? Step 8 : Split Text Into Words 32 Bit
  let splitedWords = [];
  let splitLength = bitsText.length / 32;
  for (let i = 0; i < splitLength; i++) {
    splitedWords.push(bitsText.slice(i * 32, (i + 1) * 32));
  }

  // ? Step 9: We extend 16 Word to reach 80 word
  for (let w = 16; w < 80; w++) {
    let xorResult =
      parseInt(splitedWords[w - 3], 2) ^
      parseInt(splitedWords[w - 8], 2) ^
      parseInt(splitedWords[w - 14], 2) ^
      parseInt(splitedWords[w - 16], 2);

    splitedWords.push(leftShift(xorResult, 1).toString(2));
  }

  // ? Step 10 & 11 : Make each 20 words of 80 are collected in one function to get 4 functions
  // * Initial Hash Values
  let h0 = 0b01100111010001010010001100000001;
  let h1 = 0b11101111110011011010101110001001;
  let h2 = 0b10011000101110101101110011111110;
  let h3 = 0b00010000001100100101010001110110;
  let h4 = 0b11000011110100101110000111110000;
  // Make Four Functions
  let a = h0,
    b = h1,
    c = h2,
    d = h3,
    e = h4;

  for (let i = 0; i < splitedWords.length; i++) {
    let temp, f, k;
    let word = parseInt(splitedWords[i], 2);
    if (i < 20) {
      // Calculated F
      f = ((b & c) | (~b & d)) >>> 0;
      // K Constant
      k = 0b01011010100000100111100110011001;
    } else if (i < 40) {
      f = b ^ c ^ d;
      k = 0b01101110110110011110101110100001;
    } else if (i < 60) {
      f = (b & c) | (b & d) | (c & d);
      k = 0b10001111000110111011110011011100;
    } else {
      f = b ^ c ^ d;
      k = 0b11001010011000101100000111010110;
    }
    // Calc Temp : left shift A by 5 + F + K + E + current word
    temp = leftShift(a, 5) + f + k + e + word;

    e = d;
    d = c;
    c = leftShift(b, 30) >>> 0;
    b = a;
    a = temp;
    // console.log(temp.toString(2));
  }

  // ? Step 12 : Get five parts

  h0 = (h0 + a) >>> 0;
  h1 = (h1 + b) >>> 0;
  h2 = (h2 + c) >>> 0;
  h3 = (h3 + d) >>> 0;
  h4 = (h4 + e) >>> 0;

  let hashValue =
    toHexa(h0) + toHexa(h1) + toHexa(h2) + toHexa(h3) + toHexa(h4);
  sha1OutputText.value = hashValue;
  console.log(hashValue);

  return hashValue;
}
