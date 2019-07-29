import { Motor } from './Motor'
import { Gpio } from 'pigpio'

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

// const gpioPins = [12, 13, 18, 19, 23, 24, 26]

describe('Motor', function() {
  this.timeout(60000)

  let motor: Motor

  before(() => {
    motor = new Motor(12, 13, 19)
  })

  it('moves', async () => {
    // const pwm = new Gpio(23, { mode: Gpio.OUTPUT })
    // const a = new Gpio(13, { mode: Gpio.OUTPUT })
    // pwm.digitalWrite(1)
    // a.digitalWrite(1)
    // await wait(20000)
    // out.digitalWrite(0)
    // await wait(1000)
    // out.pwmWrite(0)
    motor.setSpeed(255)
    await wait(3000)
    motor.setSpeed(64)
    await wait(3000)
    motor.setSpeed(0)
  })
})
