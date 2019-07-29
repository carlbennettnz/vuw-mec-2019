import assert from 'assert'
import { Servo, Cmd, TorqueControlMode } from './Servo'

interface ServoIds {
  shoulderLeft: number
  shoulderRight: number
  elbowLeft: number
  elbowRight: number
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

export class Arm {
  private shoulderLeft: Servo
  private shoulderRight: Servo
  private elbowLeft: Servo
  private elbowRight: Servo
  private all: Servo[] = []

  static async init(servoIds: ServoIds): Promise<Arm> {
    const arm = new Arm()

    for (const key in servoIds) {
      const servo = await Servo.init(servoIds[key])
      await servo.write(Cmd.ROLLBACK)
      await servo.write(Cmd.REBOOT)
      arm[key] = servo
      arm.all.push(servo)
    }

    await wait(500)
    await Promise.all(arm.all.map(servo => servo.setTorqueControl(TorqueControlMode.TORQUE_ON)))
    await wait(50)

    return arm
  }

  stop() {
    this.shoulderLeft.setSpeed(0)
    this.shoulderRight.setSpeed(0)
    this.elbowLeft.setSpeed(0)
    this.elbowRight.setSpeed(0)
  }

  async green() {
    await Promise.all(this.all.map(servo => servo.setLeds(false, true, false)))
  }

  async moveShoulderBackwards() {
    await this.shoulderLeft.setSpeed(-200)
    await this.shoulderRight.setSpeed(200)
  }

  async moveShoulderForwards() {
    await this.shoulderLeft.setSpeed(200)
    await this.shoulderRight.setSpeed(-200)
  }

  async moveElbowStraight() {
    await this.elbowLeft.setSpeed(200)
    await this.elbowRight.setSpeed(-200)
  }

  async moveElbowBend() {
    await this.elbowLeft.setSpeed(-200)
    await this.elbowRight.setSpeed(200)
  }
}
