import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) {
    crc ^= byte
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crcBuf])
}

function solidPNG(size, r, g, b) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB

  const rowLen = 1 + size * 3
  const raw = Buffer.alloc(rowLen * size)
  for (let y = 0; y < size; y++) {
    const off = y * rowLen
    raw[off] = 0 // no filter
    for (let x = 0; x < size; x++) {
      const px = off + 1 + x * 3
      raw[px] = r
      raw[px + 1] = g
      raw[px + 2] = b
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

if (!existsSync('public')) mkdirSync('public')

writeFileSync('public/icon-192.png', solidPNG(192, 26, 115, 232))
writeFileSync('public/icon-512.png', solidPNG(512, 26, 115, 232))
console.log('Icons generated: public/icon-192.png (192x192), public/icon-512.png (512x512)')
