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
console.log(result.total);    // 13
console.log(result.counted);  // 5
console.log(result.letters);
// → [{ char:'G', value:9 }, { char:'I', value:1 }, ...]

// Utilities
gematria.normalize('Schöpfung');  // 'SCHOPFUNG'
gematria.hasValue('Z');            // true
gematria.charValue('Ä');           // 2 (resolves to A)
gematria.mapping();                // full value→letters table
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

Umlauts expand to their two-letter components:
- **Ä** → AE → **A(2) + E(5) = 7**
- **Ö** → OE → **O(7) + E(5) = 12**
- **Ü** → UE → **U(6) + E(5) = 11**
- **ß** → SS → **S(3) + S(3) = 6**

## Zero dependencies

Single file, no npm install needed, works in Node.js and the browser (ESM-compatible).

## Related

- [goldenconst](https://github.com/onyxgod777/goldenconst) — Python library for the unified constant system
- [Billy Meier CR 127/128](https://wiki.saalome.org/Billy_Meier/Science_and_Mathematics)

## License

MIT
