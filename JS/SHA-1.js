// ! SHA-1
function hashWithSha1(text) {
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

    console.log(
      `W${w}`,
      (((xorResult << 1) | (xorResult >>> 31)) >>> 0).toString(2)
    );
  }

  // ? Step 10 : Make each 20 words of 80 are collected in one function to get 4 functions
  
  

  // console.log(bitsText);
  // console.log(bitsText.length);
  // console.log(words);

  return "Until Not Hashed";
}

console.log(hashWithSha1("hi"));
