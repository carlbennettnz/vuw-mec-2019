import { expect } from 'chai'

import { Servo, Cmd, TorqueControlMode } from './Servo'

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
const retry = async (ms: number, action: () => Promise<void>): Promise<void> => {
  let stop = false

  setTimeout(() => (stop = true), ms)

  return new Promise((resolve, reject) => {
    const loop = () =>
      action()
        .then(resolve)
        .catch(err => (stop ? reject(err) : process.nextTick(loop)))

    loop()
  })
}
/*
I need to be able to test things in two ways: fast and slow.

Fast tests will skip verification if not automatable.
Slow tests will wait for manual user verification.
*/

const ID = !isNaN(Number(process.env.SERVO_ID)) ? Number(process.env.SERVO_ID) : 6

describe('Servo', function() {
  this.timeout(60000)

  before(async () => {
    const servo = await Servo.init(ID)
    await servo.write(Cmd.ROLLBACK)
    await servo.write(Cmd.REBOOT)
    await wait(500)
  })

  after(() => Servo.close())

  describe('#init()', () => {
    it('sets torque control to TORQUE_ON', async () => {
      const servo = await Servo.init(ID)
      await servo.setTorqueControl(TorqueControlMode.BRAKE_ON)
      await Servo.init(ID)
      const mode = await servo.getTorqueControl()
      expect(mode).to.equal(TorqueControlMode.TORQUE_ON)
    })
  })

  describe('.setPosition()', () => {
    let servo: Servo

    before(async () => (servo = await Servo.init(ID)))

    it('sets the position to within 2 degrees of accuracy', async () => {
      for (let target = -90; target <= 90; target += 45) {
        await servo.setPosition(target)
        await wait(100)
        await retry(800, async () => {
          const actual = await servo.getPosition()
          expect(Math.abs(target - actual)).to.be.be.lt(2)
        })
      }
    })
  })

  describe('.setSpeed()', () => {
    let servo: Servo

    before(async () => (servo = await Servo.init(ID)))
    after(async () => await servo.setSpeed(0))

    it('rotates counter-clockwise', async () => {
      // Reset to -90 first
      await servo.setPosition(-90)
      await retry(1000, async () => {
        const pos = await servo.getPosition()
        expect(Math.abs(-90 - pos)).to.be.lt(5)
      })

      await servo.setSpeed(400)
      await wait(100)

      let last = -Infinity

      for (let i = 0; i < 50; i++) {
        const pos = await servo.getPosition()
        expect(pos).to.be.gt(last)
        last = pos
        wait(30)
      }
    })

    it('rotates clockwise', async () => {
      // Reset to 90 first
      await servo.setPosition(90)
      await retry(1000, async () => {
        const pos = await servo.getPosition()
        expect(Math.abs(90 - pos)).to.be.lt(5)
      })

      await servo.setSpeed(-400)
      await wait(100)

      let last = Infinity

      for (let i = 0; i < 50; i++) {
        const pos = await servo.getPosition()
        expect(pos).to.be.lt(last)
        last = pos
        wait(30)
      }
    })
  })

  describe('.setLeds()', () => {
    let servo: Servo

    before(async () => (servo = await Servo.init(ID)))

    it('set to red', async () => {
      await servo.setLeds(true, false, false)
      const [r, g, b] = await servo.getLeds()
      expect(r).to.be.true
      expect(g).to.be.false
      expect(b).to.be.false
    })

    it('set to green', async () => {
      await servo.setLeds(false, true, false)
      const [r, g, b] = await servo.getLeds()
      expect(r).to.be.false
      expect(g).to.be.true
      expect(b).to.be.false
    })

    it('set to red', async () => {
      await servo.setLeds(false, false, true)
      const [r, g, b] = await servo.getLeds()
      expect(r).to.be.false
      expect(g).to.be.false
      expect(b).to.be.true
    })
  })
})
