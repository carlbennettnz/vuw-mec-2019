import Kinematics from 'kinematics'

import { Servo, Cmd, TorqueControlMode, LedColor } from './Servo'

interface ServoIds {
  shoulderLeft: number
  shoulderRight: number
  elbowLeft: number
  elbowRight: number
  base: number
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
const limit = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x))

const ACCURACY_THRESHOLD = 1
const MAX_SPEED = 200

export class Arm {
  private model: any
  private closed = false

  private shoulderLeft: Servo
  private shoulderRight: Servo
  private elbowLeft: Servo
  private elbowRight: Servo
  private base: Servo
  private all: Servo[] = []

  private basePos: number = 0
  private shoulderPos: number = 0
  private elbowPos: number = 0
  private moving: boolean = false

  private b: number
  private t: number = Number(process.argv[2])

  static async init(servoIds: ServoIds): Promise<Arm> {
    const arm = new Arm()

    // arm.model = new Kinematics([[0, 0, 0], [0, 0, 5], [0, 0, 0], [4.3, 0, 0], [0, 0, 0]])
    // arm.model.debug = true

    for (const key in servoIds) {
      const servo = await Servo.init(servoIds[key])
      // await servo.write(Cmd.ROLLBACK)
      await servo.write(Cmd.REBOOT)
      arm[key] = servo
      arm.all.push(servo)
    }

    await wait(500)
    await Promise.all(arm.all.map(servo => servo.setTorqueControl(TorqueControlMode.TORQUE_ON)))
    await wait(100)

    const lp = await arm.shoulderLeft.getPosition()
    const rp = await arm.shoulderRight.getPosition()
    arm.b = 0 && -(lp + -rp) / 2

    return arm
  }

  async stop() {
    await Promise.all(this.all.map(servo => servo.setSpeed(0)))
  }

  async close() {
    this.closed = true
  }

  async setColor(color: LedColor) {
    await Promise.all(this.all.map(servo => servo.setLeds(...color)))
  }

  async go() {
    if (this.closed) {
      await this.stop()
      Servo.close()
      return
    }

    try {
      await this.seek()
    } catch (err) {
      console.error(err)
    }

    process.nextTick(() => this.go())
  }

  async seek() {
    const { t, b } = this
    const lp = await this.shoulderLeft.getPosition()
    const rp = await this.shoulderRight.getPosition()

    const p = (lp + -rp) / 2 + b
    let e = t - p

    if (Math.abs(e) < ACCURACY_THRESHOLD) {
      e = 0
    }

    const kd = 50

    // if t = 0 and p = -34
    // then e = 34

    const speed = limit(kd * e, -MAX_SPEED, MAX_SPEED)
    await this.moveShoulder(speed)
    console.log()
    console.log('moving')
    console.log('    speed:', speed)
    console.log('    lp:   ', Math.round(lp))
    console.log('    rp:   ', Math.round(rp))
    console.log('    p:    ', Math.round(p))
    console.log('    e:    ', Math.round(e))
  }

  async goTo({ base, shoulder, elbow }: { base: number; shoulder: number; elbow: number }) {
    const baseSpeed = base - this.basePos
    const shoulderSpeed = shoulder - this.shoulderPos
    const elbowSpeed = elbow - this.elbowPos

    this.moving = true

    await this.rotate(baseSpeed)
    await this.moveShoulder(shoulderSpeed)
    await this.moveElbow(elbowSpeed)

    await wait(1000)

    await this.stop()

    this.moving = false

    this.basePos = base
    this.shoulderPos = shoulder
    this.elbowPos = elbow
  }

  async moveShoulder(speed: number) {
    await this.shoulderLeft.setSpeed(speed)
    await this.shoulderRight.setSpeed(-speed)
  }

  async rotate(speed: number) {
    await this.base.setSpeed(speed)
  }

  async moveElbow(speed: number) {
    await this.elbowLeft.setSpeed(speed)
    await this.elbowRight.setSpeed(-speed)
  }
}
