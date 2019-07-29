import { Gpio } from 'pigpio'

export class Motor {
  power: Gpio
  a: Gpio
  b: Gpio

  constructor(pwmPin: number, aPin: number, bPin: number) {
    this.power = new Gpio(pwmPin, { mode: Gpio.OUTPUT })
    this.a = new Gpio(aPin, { mode: Gpio.OUTPUT })
    this.b = new Gpio(bPin, { mode: Gpio.OUTPUT })

    this.power.pwmWrite(0)
    this.a.digitalWrite(0)
    this.a.digitalWrite(0)
  }

  setSpeed(speed: number) {
    this.a.digitalWrite(speed ? 1 : 0)
    this.power.pwmWrite(speed)
    console.log(`set speed to ${speed}`)
  }
}
