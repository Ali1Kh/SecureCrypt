function generatePrimeFromSeed(seed) {
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

  // Generate pseudo-random numbers until a prime is found
  while (true) {
    x = lcg(x, a, c, m); // Generate next random number
    let possiblePrime = x % 1000; // Limit the range to 0–999
    if (isPrime(possiblePrime)) {
      // Check if it's a prime
      return possiblePrime; // Return the prime number
    }
  }
}
