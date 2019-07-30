import SerialPort from 'serialport'
import debugFactory from 'debug'
import { HerkulexPacketParser } from './HerkulexPacketParser'

const debugTx = debugFactory('mec:servo:tx')
const debugRx = debugFactory('mec:servo:rx')

export type LedColor = [boolean, boolean, boolean]

export class Servo {
  private static RESPONSE_TIMEOUT = 500 // ms
  private static PORT = process.env.SERIAL_PORT || '/dev/serial0'

  private static tx = new SerialPort(Servo.PORT, { baudRate: 115200 })
  private static rx = Servo.tx
    .pipe(new HerkulexPacketParser())
    .on('data', (data: Buffer) => Servo.printBuffer(debugRx, data))
    .on('data', Servo.handleError)

  public static async init(id: number) {
    return new Servo(id)
  }

  public static close() {
    Servo.tx.close()
  }

  private color: LedColor = [false, true, false]

  private constructor(private pid: number) {}

  private static write(pid: number, cmd: Cmd, data: Buffer = Buffer.from([])) {
    //               header,     packet size,     servo id, cmd, checksum, data
    const payload = [0xff, 0xff, 7 + data.length, pid, cmd, 0, 0, ...data]

    // Calculated based on the rest of the payload
    Servo.setChecksum(payload)

    const buffer = Buffer.from(payload)

    Servo.printBuffer(debugTx, buffer)
    Servo.tx.write(buffer)
  }

  public write(cmd: Cmd, data: Buffer = Buffer.from([])) {
    Servo.write(this.pid, cmd, data)
  }

  public async read(addr: number, length: number, cmd: Cmd = Cmd.RAM_READ): Promise<Buffer> {
    this.write(cmd, Buffer.from([addr, length]))

    return new Promise((resolve, reject) => {
      const listener = (data: Buffer) => {
        if (data[0] === this.pid && data[1] === cmd + 0x40 && data[2] === addr) {
          Servo.rx.off('data', listener)
          clearTimeout(timer)
          resolve(data.slice(4, -2))
        }
      }

      const timer = setTimeout(() => {
        Servo.rx.off('data', listener)
        reject(new Error(`Timeout when reading address ${addr} from servo ${this.pid}`))
      }, Servo.RESPONSE_TIMEOUT)

      Servo.rx.on('data', listener)
    })
  }

  private static setChecksum(payload: number[]) {
    payload[5] =
      payload.slice(2).reduce((cs, bytes, i) => (i < 3 || i > 4 ? cs ^ bytes : cs)) & 0xfe
    payload[6] = ~payload[5] & 0xfe
  }

  public static printBuffer(print: Function, buffer: Buffer) {
    print(buffer)
    print('                 -- --       ' + '-- '.repeat(buffer.length - 7))
  }

  private static async handleError(data: Buffer): Promise<void> {
    const errBits = data.slice(-2)

    if (errBits[0] === 0x00) return

    let errStr = `Servo 0x${data[3].toString(16).padStart(2, '0')}: ${ERRORS[errBits[0]]}`

    if (errBits[0] === 0x08) {
      errStr += ERROR_DETAIL[errBits[1]]
    }

    console.warn(errStr)

    await Servo.clearError(data[3])
  }

  private static async clearError(pid: number) {
    await Servo.write(pid, Cmd.RAM_WRITE, Buffer.from([0x30, 0x02, 0x00, 0x00]))
  }

  public async setTorqueControl(mode: TorqueControlMode) {
    await this.write(Cmd.RAM_WRITE, Buffer.from([0x34, 0x01, mode]))
  }

  public async getTorqueControl(): Promise<TorqueControlMode> {
    return (await this.read(0x34, 1))[0]
  }

  public async setPosition(angle: number, duration: number /* ms */ = 0): Promise<void> {
    const target = (angle + 166.65) * (1024 / (2 * 166.65))

    await this.write(
      Cmd.I_JOG,
      Buffer.from([
        (target >> 0) & 0xff,
        (target >> 8) & 0x3f,
        0b00000000 | // position mode
          (Number(this.color[0]) << 4) |
          (Number(this.color[1]) << 2) |
          (Number(this.color[2]) << 3),
        this.pid,
        Math.min(0xff, Math.min(0, duration * (60 / 672))) // Duration, coverted from milliseconds
      ])
    )
  }

  public async getPosition(): Promise<number> {
    const [modeBuffer, posBuffer] = await Promise.all([this.read(56, 1), this.read(58, 2)])

    // prettier-ignore
    const scale = (pos: number) =>
      (modeBuffer[0] & 1) === 0 // if position mode
        ? pos * ((2 * 166.65) / 1024) - 166.65
        : pos / 6.2 - 300

    return scale(posBuffer.readUInt16LE(0) & 0x03ff)
  }

  public async setSpeed(speed: number): Promise<void> {
    const target = speed

    await this.write(
      Cmd.I_JOG,
      Buffer.from([
        (Math.abs(target) >> 0) & 0xff,
        ((Math.abs(target) >> 8) & 0x3f) | (target < 0 ? 0x40 : 0),
        0b00000010 | // speed mode
          (Number(this.color[0]) << 4) |
          (Number(this.color[1]) << 2) |
          (Number(this.color[2]) << 3),
        this.pid,
        0
      ])
    )
  }

  public async setLeds(r: boolean, g: boolean, b: boolean) {
    this.color = [r, g, b]

    await this.write(
      Cmd.RAM_WRITE,
      Buffer.from([0x35, 0x01, (Number(r) << 2) ^ (Number(b) << 1) ^ Number(g)])
    )
  }

  public async getLeds(): Promise<boolean[]> {
    const [state] = await this.read(53, 1)
    return [(state & 0x04) === 4, (state & 0x01) === 1, (state & 0x02) === 2]
  }

  public static async getIds() {
    await Servo.write(0xfe, Cmd.STAT)

    return new Promise(resolve => {
      const results: number[] = []

      const handler = (data: Buffer) => {
        if (data[0] === Cmd.STAT + 0x40) {
          results.push(data[1])
        }
      }

      Servo.rx.on('data', handler)

      setTimeout(() => {
        Servo.rx.off('data', handler)
        resolve(results)
      }, 100)
    })
  }
}

export enum Cmd {
  EEP_WRITE = 0x01,
  EEP_READ = 0x02,
  RAM_WRITE = 0x03,
  RAM_READ = 0x04,
  I_JOG = 0x05,
  S_JOG = 0x06,
  STAT = 0x07,
  ROLLBACK = 0x08,
  REBOOT = 0x09
}

export enum TorqueControlMode {
  BRAKE_ON = 0x40,
  TORQUE_ON = 0x60,
  FREE_TORQUE = 0x00
}

const ERRORS = {
  0x01: 'Exceeded input voltage limit',
  0x02: 'Exceeded allowed POT limit',
  0x04: 'Exeeded temperature limit',
  0x08: 'Invalid packet: ',
  0x10: 'Overload detected',
  0x20: 'Driver fault detected',
  0x40: 'EEP REG distorted'
}

const ERROR_DETAIL = {
  0x04: 'Checksum error',
  0x08: 'Unknown command',
  0x10: 'Exceeded REG range',
  0x20: 'Garbage detected'
}
