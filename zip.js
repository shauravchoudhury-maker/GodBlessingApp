// zip.js
// Minimal, dependency-free ZIP writer (STORE method — no compression).
// Enough to bundle the daily PNGs + captions.txt into one downloadable file.
// PNGs are already compressed, so store-only keeps the kit small anyway.

// --- CRC32 -------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// --- Helpers -----------------------------------------------------------
function strToBytes(str) {
  return new TextEncoder().encode(str);
}

// DOS date/time. Passed in (not computed) to stay deterministic-friendly.
function dosDateTime(date) {
  const time = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() / 2)) & 0xFFFF;
  const dt = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xFFFF;
  return { time, dt };
}

function pushU16(arr, v) { arr.push(v & 0xFF, (v >>> 8) & 0xFF); }
function pushU32(arr, v) { arr.push(v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF); }

// --- Public: build a ZIP Blob -----------------------------------------
// files: [{ name: string, bytes: Uint8Array }]
function createZipBlob(files, date) {
  const now = date || new Date();
  const { time, dt } = dosDateTime(now);

  const chunks = [];         // Uint8Array pieces (file data)
  const localHeaders = [];   // byte arrays
  const central = [];        // central directory entries
  let offset = 0;

  for (const f of files) {
    const nameBytes = strToBytes(f.name);
    const data = f.bytes;
    const crc = crc32(data);
    const size = data.length;

    // Local file header
    const lh = [];
    pushU32(lh, 0x04034b50);          // signature
    pushU16(lh, 20);                  // version needed
    pushU16(lh, 0);                   // flags
    pushU16(lh, 0);                   // method = store
    pushU16(lh, time);
    pushU16(lh, dt);
    pushU32(lh, crc);
    pushU32(lh, size);                // compressed size
    pushU32(lh, size);                // uncompressed size
    pushU16(lh, nameBytes.length);
    pushU16(lh, 0);                   // extra len
    for (const b of nameBytes) lh.push(b);
    const lhBytes = new Uint8Array(lh);

    localHeaders.push(lhBytes);
    chunks.push(lhBytes, data);

    // Central directory entry
    const cd = [];
    pushU32(cd, 0x02014b50);
    pushU16(cd, 20);                  // version made by
    pushU16(cd, 20);                  // version needed
    pushU16(cd, 0);                   // flags
    pushU16(cd, 0);                   // method
    pushU16(cd, time);
    pushU16(cd, dt);
    pushU32(cd, crc);
    pushU32(cd, size);
    pushU32(cd, size);
    pushU16(cd, nameBytes.length);
    pushU16(cd, 0);                   // extra len
    pushU16(cd, 0);                   // comment len
    pushU16(cd, 0);                   // disk number
    pushU16(cd, 0);                   // internal attrs
    pushU32(cd, 0);                   // external attrs
    pushU32(cd, offset);              // local header offset
    for (const b of nameBytes) cd.push(b);
    central.push(new Uint8Array(cd));

    offset += lhBytes.length + data.length;
  }

  const centralStart = offset;
  let centralSize = 0;
  for (const c of central) { chunks.push(c); centralSize += c.length; }

  // End of central directory
  const eocd = [];
  pushU32(eocd, 0x06054b50);
  pushU16(eocd, 0);                   // disk
  pushU16(eocd, 0);                   // disk with central dir
  pushU16(eocd, files.length);        // entries on this disk
  pushU16(eocd, files.length);        // total entries
  pushU32(eocd, centralSize);
  pushU32(eocd, centralStart);
  pushU16(eocd, 0);                   // comment len
  chunks.push(new Uint8Array(eocd));

  return new Blob(chunks, { type: "application/zip" });
}

// Convert a canvas data URL ("data:image/png;base64,....") to bytes.
function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
