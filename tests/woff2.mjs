// Reads the tables that the font checks need from a WOFF2 file, with no dependency: the code points of the cmap,
// the variation axes of fvar and the name records. WOFF2 (W3C Recommendation) stores all tables in one Brotli stream.
import { brotliDecompressSync } from 'node:zlib';

// The tag of each table, by the index that the WOFF2 table directory uses (WOFF2 spec, section 5.1).
const knownTags = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx',
  'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar',
  'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];

function readBase128(bytes, at) {
  let value = 0;
  for (let i = 0; i < 5; i++) {
    const byte = bytes[at.offset++];
    value = value * 128 + (byte & 0x7f);
    if (!(byte & 0x80)) return value;
  }
  throw new Error('Invalid UIntBase128 in the WOFF2 table directory');
}

// Returns { tables: { tag: Buffer } } for the tables that are stored as they are (all except a transformed glyf, loca and hmtx).
export function readWoff2(buffer) {
  if (buffer.toString('latin1', 0, 4) !== 'wOF2') throw new Error('Not a WOFF2 file');
  const tableCount = buffer.readUInt16BE(12), compressedSize = buffer.readUInt32BE(20);
  const at = { offset: 48 }, entries = [];
  for (let i = 0; i < tableCount; i++) {
    const flags = buffer[at.offset++], index = flags & 0x3f, version = flags >> 6;
    const tag = index === 63 ? (at.offset += 4, buffer.toString('latin1', at.offset - 4, at.offset)) : knownTags[index];
    const length = readBase128(buffer, at);
    const transformed = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0;
    entries.push({ tag, transformed, stored: transformed ? readBase128(buffer, at) : length });
  }
  const data = brotliDecompressSync(buffer.subarray(at.offset, at.offset + compressedSize));
  const tables = {};
  let position = 0;
  for (const entry of entries) {
    if (!entry.transformed) tables[entry.tag] = data.subarray(position, position + entry.stored);
    position += entry.stored;
  }
  return { tables };
}

// The set of code points that the best Unicode cmap subtable maps (formats 4 and 12).
export function codePoints(font) {
  const cmap = font.tables.cmap, found = new Set(), records = [];
  for (let i = 0; i < cmap.readUInt16BE(2); i++) records.push({ platform: cmap.readUInt16BE(4 + i * 8), encoding: cmap.readUInt16BE(6 + i * 8), offset: cmap.readUInt32BE(8 + i * 8) });
  const wanted = records.find(r => r.platform === 3 && r.encoding === 10) || records.find(r => r.platform === 0 && r.encoding === 4)
    || records.find(r => r.platform === 3 && r.encoding === 1) || records.find(r => r.platform === 0);
  if (!wanted) throw new Error('The font has no Unicode cmap');
  const table = cmap.subarray(wanted.offset), format = table.readUInt16BE(0);
  if (format === 12) {
    for (let g = 0; g < table.readUInt32BE(12); g++) {
      const start = table.readUInt32BE(16 + g * 12), end = table.readUInt32BE(20 + g * 12), glyph = table.readUInt32BE(24 + g * 12);
      for (let c = start; c <= end; c++) if (glyph + (c - start) !== 0) found.add(c);
    }
  } else if (format === 4) {
    const segments = table.readUInt16BE(6) / 2, ends = 14, starts = ends + segments * 2 + 2, deltas = starts + segments * 2, ranges = deltas + segments * 2;
    for (let s = 0; s < segments; s++) {
      const end = table.readUInt16BE(ends + s * 2), start = table.readUInt16BE(starts + s * 2), offset = table.readUInt16BE(ranges + s * 2);
      for (let c = start; c <= end && c !== 0xffff; c++) {
        const glyph = offset === 0 ? (c + table.readInt16BE(deltas + s * 2)) & 0xffff : table.readUInt16BE(ranges + s * 2 + offset + (c - start) * 2);
        if (glyph !== 0) found.add(c);
      }
    }
  } else throw new Error(`cmap format ${format} is not supported`);
  return found;
}

// The variation axes of a variable font: [{ tag, min, default, max }]. Empty for a static font.
export function axes(font) {
  const fvar = font.tables.fvar;
  if (!fvar) return [];
  const first = fvar.readUInt16BE(4), count = fvar.readUInt16BE(8), size = fvar.readUInt16BE(10), fixed = at => fvar.readInt32BE(at) / 65536;
  return Array.from({ length: count }, (_, i) => {
    const at = first + i * size;
    return { tag: fvar.toString('latin1', at, at + 4), min: fixed(at + 4), default: fixed(at + 8), max: fixed(at + 12) };
  });
}

// The name records of the Windows platform, by name ID: 0 copyright, 1 family, 5 version, 6 PostScript name.
export function names(font) {
  const table = font.tables.name, base = table.readUInt16BE(4), result = {};
  for (let i = 0; i < table.readUInt16BE(2); i++) {
    const at = 6 + i * 12, platform = table.readUInt16BE(at), id = table.readUInt16BE(at + 6);
    if (platform !== 3 || id in result) continue;
    const start = base + table.readUInt16BE(at + 10);
    result[id] = Buffer.from(table.subarray(start, start + table.readUInt16BE(at + 8))).swap16().toString('utf16le');
  }
  return result;
}

// The ranges of a CSS unicode-range descriptor, such as "U+0000-00FF,U+0131", as [[start, end], ...].
export function parseUnicodeRange(text) {
  return text.split(',').map(part => {
    const [, from, to] = part.trim().match(/^U\+([0-9A-F]+)(?:-([0-9A-F]+))?$/i) || [];
    if (!from) throw new Error(`Invalid unicode-range part: ${part}`);
    return [parseInt(from, 16), parseInt(to || from, 16)];
  });
}
export const inRanges = (ranges, codePoint) => ranges.some(([start, end]) => codePoint >= start && codePoint <= end);
