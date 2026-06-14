# Old High German Gematria

A JavaScript Old High German Gematria calculator based on **Billy Meier Contact Reports 127 and 128** (Plejaren transmission via FIGU / Guido Moosbrugger).

## Usage

### CLI

```bash
node gematria.js GIZEH
node gematria.js "DAS LICHT" --verbose
node gematria.js --list
echo "PYRAMID" | node gematria.js
```

### Programmatic API

```js
const gematria = require('./gematria.js');

// Calculate
const result = gematria.value('GIZEH');
console.log(result.total);    // 21
console.log(result.counted);  // 5
console.log(result.letters);
// → [{ char:'G', value:9 }, { char:'I', value:1 }, ...]

// Umlauts expand into component letters:
const r = gematria.value('SCHÖPFUNG');
console.log(r.total);         // 51
console.log(r.letters[3]);    // { char:'Ö', sub:'O', value:7, expanded:true }
console.log(r.letters[4]);    // { char:'Ö', sub:'E', value:5, expanded:true }

// Utilities
gematria.normalize('Schöpfung');  // 'SCHOEPFUNG'
gematria.normalize('straße');     // 'STRASSE'
gematria.hasValue('Z');           // true
gematria.hasValue('ß');           // true
gematria.charValue('Ä');          // 7  (AE → 2+5)
gematria.charValue('Ö');          // 12 (OE → 7+5)
gematria.charValue('Ü');          // 11 (UE → 6+5)
gematria.charValue('ß');          // 6  (SS → 3+3)
gematria.mapping();               // full value→letters table
```

## Letter Mapping

| Value | Letters |
|---|---|
| **1** | C, H, I, J, T, Y |
| **2** | A, R |
| **3** | S |
| **4** | M |
| **5** | D, E, L, N, Z |
| **6** | P, U, V, W, X |
| **7** | O |
| **8** | F, Q |
| **9** | B, G, K |

### Umlauts

Umlauts expand to their two-letter components, each counted separately:

| Char | Expansion | Calculation | Value |
|---|---|---|---|
| **Ä** | AE | A(2) + E(5) | **7** |
| **Ö** | OE | O(7) + E(5) | **12** |
| **Ü** | UE | U(6) + E(5) | **11** |
| **ß** | SS | S(3) + S(3) | **6** |

> ⚠️ `'ß'.toUpperCase()` returns `'SS'` in JavaScript (length 2), so lookups check the **original character** first before the uppercased form.

## Zero dependencies

Single file, no npm install needed, works in Node.js and the browser (ESM-compatible).

## Related

- [goldenconst](https://github.com/onyxgod777/goldenconst) — Python library for the unified constant system
- [Billy Meier CR 127/128](https://wiki.saalome.org/Billy_Meier/Science_and_Mathematics)

## License

MIT
