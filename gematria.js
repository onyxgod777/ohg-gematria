#!/usr/bin/env node

/**
 * ohg-gematria — Old High German Gematria
 *
 * Based on Billy Meier Contact Reports 127 & 128 (Plejaren transmission).
 *
 * Usage:
 *   const gematria = require('./gematria.js');
 *   gematria.value('GIZEH');    // → { total: 13, letters: [...] }
 *
 *   # CLI:
 *   node gematria.js GIZEH
 *   node gematria.js "DAS LICHT"
 *   node gematria.js --list
 */

"use strict";

// ── Gematria mapping (CR 127/128) ────────────────────────────────────

const MAP = Object.freeze({
  // Value 1
  'C': 1, 'H': 1, 'I': 1, 'J': 1, 'T': 1, 'Y': 1,
  // Value 2
  'A': 2, 'R': 2,
  // Value 3
  'S': 3,
  // Value 4
  'M': 4,
  // Value 5
  'D': 5, 'E': 5, 'L': 5, 'N': 5, 'Z': 5,
  // Value 6
  'P': 6, 'U': 6, 'V': 6, 'W': 6, 'X': 6,
  // Value 7
  'O': 7,
  // Value 8
  'F': 8, 'Q': 8,
  // Value 9
  'B': 9, 'G': 9, 'K': 9,
});

// Umlauts expand to their two-letter components, each counted separately.
//   Ä = AE → A(2) + E(5) = 7
//   Ö = OE → O(7) + E(5) = 12
//   Ü = UE → U(6) + E(5) = 11
//   ß = SS → S(3) + S(3) = 6
// Accented base letters (É, È, etc.) resolve to the plain letter.
const UMLAUTS = Object.freeze({
  'Ä': 'AE', 'Å': 'A', 'Æ': 'AE',
  'Ö': 'OE', 'Œ': 'OE',
  'Ü': 'UE',
  'É': 'E', 'È': 'E', 'Ë': 'E', 'Ê': 'E',
  'ß': 'SS',
});

// Reverse mapping: value → letters
const VALUE_GROUPS = Object.freeze({
  1: ['C', 'H', 'I', 'J', 'T', 'Y'],
  2: ['A', 'R'],
  3: ['S'],
  4: ['M'],
  5: ['D', 'E', 'L', 'N', 'Z'],
  6: ['P', 'U', 'V', 'W', 'X'],
  7: ['O'],
  8: ['F', 'Q'],
  9: ['B', 'G', 'K'],
});

// A character is an umlaut if its resolved form is longer than 1 char
const UMLAUT_CHARS = new Set(
  Object.entries(UMLAUTS)
    .filter(([, v]) => v.length > 1)
    .map(([k]) => k)
);

// ── Core API ─────────────────────────────────────────────────────────

/**
 * Calculate the gematria value of a string.
 *
 * @param {string} text  Input text (case-insensitive, umlauts resolved)
 * @returns {{ total: number, letters: Array<{char:string,value:number}>, counted: number }}
 */
function value(text) {
  if (typeof text !== 'string') {
    throw new TypeError(`Expected string, got ${typeof text}`);
  }

  const letters = [];
  let total = 0;
  let counted = 0;

  for (const ch of text) {
    const upper = ch.toUpperCase();
    // Look up original char first (for ß which toUpperCase converts to SS)
    const expansion = UMLAUTS[ch] || UMLAUTS[upper];

    if (expansion !== undefined && expansion.length > 1) {
      // Umlaut / ß — expand into component letters
      for (const sub of expansion) {
        const val = MAP[sub];
        if (val !== undefined) {
          letters.push({ char: ch, sub: sub, value: val, expanded: true });
          total += val;
          counted++;
        }
      }
    } else {
      // Single character
      const resolved = expansion || upper;
      const val = MAP[resolved];
      if (val !== undefined) {
        letters.push({ char: ch, value: val });
        total += val;
        counted++;
      } else {
        letters.push({ char: ch, value: 0 });
      }
    }
  }

  return { total, letters, counted };
}

/**
 * Normalize text: uppercase, remove non-gematria characters.
 *
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  let out = '';
  for (const ch of text) {
    const u = ch.toUpperCase();
    const expansion = UMLAUTS[ch] || UMLAUTS[u];
    const resolved = expansion || u;
    for (const sub of resolved) {
      if (MAP[sub] !== undefined) out += sub;
    }
  }
  return out;
}

/**
 * Check if a character has a gematria value.
 *
 * @param {string} ch  Single character
 * @returns {boolean}
 */
function hasValue(ch) {
  if (typeof ch !== 'string' || ch.length !== 1) return false;
  const u = ch.toUpperCase();
  const expansion = UMLAUTS[ch] || UMLAUTS[u];
  if (expansion && expansion.length > 1) return true;  // umlaut → has components
  const resolved = expansion || u;
  return MAP[resolved] !== undefined;
}

/**
 * Get the value of a single character.
 *
 * @param {string} ch  Single character
 * @returns {number|undefined}
 */
function charValue(ch) {
  if (typeof ch !== 'string' || ch.length !== 1) return undefined;
  const u = ch.toUpperCase();
  const expansion = UMLAUTS[ch] || UMLAUTS[u];
  if (expansion && expansion.length > 1) {
    // For umlauts, return the sum of component values
    let sum = 0;
    for (const sub of expansion) sum += MAP[sub] || 0;
    return sum;
  }
  const resolved = expansion || u;
  return MAP[resolved];
}

/**
 * Get the full mapping table.
 *
 * @returns {object}  { value: [letters], ... }
 */
function mapping() {
  return VALUE_GROUPS;
}

// ── CLI ──────────────────────────────────────────────────────────────

function printResult(result, verbose) {
  console.log('');
  console.log('═'.repeat(40));
  console.log('  Old High German Gematria (CR 127/128)');
  console.log('═'.repeat(40));
  console.log('');

  if (result.counted === 0) {
    console.log('  No gematria letters found.');
    console.log('');
    return;
  }

  console.log(`  Total: ${result.total}`);
  console.log(`  Letters counted: ${result.counted}`);

  // Decimal parity
  const sd = sumDigits(result.total);
  const dp = decimalParity(result.total);
  console.log(`  Sum of digits: ${sd}`);
  console.log(`  Decimal parity: ${dp}`);
  console.log('');

  if (verbose) {
    console.log('  Breakdown:');
    for (const l of result.letters) {
      if (l.value > 0) {
        if (l.expanded) {
          console.log(`    ${l.char} → ${l.sub}=${l.value} (as ${l.sub})`);
        } else {
          console.log(`    ${l.char} → ${l.value}`);
        }
      } else {
        console.log(`    ${l.char === ' ' ? '(space)' : l.char} → — (ignored)`);
      }
    }
    console.log('');
  }
}

function printList() {
  console.log('');
  console.log('═'.repeat(40));
  console.log('  Gematria Mapping — CR 127/128');
  console.log('═'.repeat(40));
  console.log('');

  for (let v = 1; v <= 9; v++) {
    const letters = VALUE_GROUPS[v].join(', ');
    console.log(`  ${v} → ${letters}`);
  }
  console.log('');
}

function cli(args) {
  const flags = { verbose: false, list: false, words: [] };

  for (const arg of args) {
    if (arg === '--verbose' || arg === '-v') {
      flags.verbose = true;
    } else if (arg === '--list' || arg === '-l') {
      flags.list = true;
    } else if (arg.startsWith('--')) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(1);
    } else {
      flags.words.push(arg);
    }
  }

  if (flags.list) {
    printList();
    return;
  }

  if (flags.words.length === 0) {
    // Interactive mode if piped
    if (!process.stdin.isTTY) {
      let input = '';
      process.stdin.on('data', d => { input += d.toString(); });
      process.stdin.on('end', () => {
        const result = value(input.trim());
        printResult(result, true);
      });
      return;
    }

    console.log('');
    console.log('  Old High German Gematria');
    console.log('');
    console.log('  Usage: node gematria.js <word> [--verbose] [--list]');
    console.log('');
    console.log('  Examples:');
    console.log('    node gematria.js GIZEH');
    console.log('    node gematria.js "DAS LICHT" -v');
    console.log('    node gematria.js --list');
    console.log('    echo "PYRAMID" | node gematria.js');
    console.log('');
    return;
  }

  for (const word of flags.words) {
    const result = value(word);
    if (flags.words.length > 1) {
      console.log(`\n  ── "${word}" ──`);
    }
    printResult(result, flags.verbose);
  }
}

// ── Exports ──────────────────────────────────────────────────────────

function decimalParity(n) {
  if (typeof n !== 'number' || n <= 0) return 0;
  while (n >= 10) {
    let s = 0;
    while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
    n = s;
  }
  return n;
}

function sumDigits(n) {
  if (typeof n !== 'number' || n <= 0) return 0;
  let s = 0;
  while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
  return s;
}

module.exports = { value, normalize, hasValue, charValue, mapping, decimalParity, sumDigits, MAP, VALUE_GROUPS };

// ── Run as CLI ───────────────────────────────────────────────────────

if (require.main === module) {
  cli(process.argv.slice(2));
}
