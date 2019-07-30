import { Transform } from 'stream'

export class HerkulexPacketParser extends Transform {
  private checksum: Buffer = Buffer.alloc(2)
  private packet: Buffer
  private length: number = 0
  private position: number = 0

  _transform(chunk: Buffer, encoding: string, cb: (err?: Error) => void) {
    for (const byte of chunk) {
      if (this.position < 2) {
        this.readHeader(byte)
      } else if (this.position === 2) {
        this.readPacketLength(byte)
      } else if (this.position === 3) {
        this.readServoId(byte)
      } else if (this.position === 4) {
        this.readCommand(byte)
      } else if (this.position <= 6) {
        this.readChecksum(byte)
      } else {
        this.readData(byte)
      }

      if (this.length !== 0 && this.position >= this.length) {
        this.finalize()
      }
    }
    cb()
  }

  private finalize() {
    if (this.checksumCorrect()) {
      this.push(this.packet)
    } else {
      console.error('Bad checksum')
    }

    this.position = 0
    this.length = 0
  }

  private checksumCorrect(): boolean {
    const a = [this.length, ...this.packet].reduce((cs, bytes) => cs ^ bytes) & 0xfe
    const b = ~a & 0xfe
    return this.checksum[0] === a && this.checksum[1] === b
  }

  private readHeader(byte: number) {
    if (byte === 0xff) this.position++
  }

  private readPacketLength(byte: number) {
    this.length = byte
    this.packet = Buffer.alloc(this.length - 5)
    this.position++
  }

  private readServoId(byte: number) {
    this.packet[0] = byte
    this.position++
  }

  private readCommand(byte: number) {
    this.packet[1] = byte
    this.position++
  }

  private readChecksum(byte: number) {
    this.checksum[this.position - 5] = byte
    this.position++
  }

  private readData(byte: number) {
    this.packet[this.position - 5] = byte
    this.position++
  }
}
