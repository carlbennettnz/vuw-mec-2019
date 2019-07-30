import { Request, Response, NextFunction } from 'express'

import { init } from 'raspi'
import { PWM } from 'raspi-pwm'

let servo: any

init(() => {
  servo = new PWM('P1-12')
})

export default (req: Request, res: Response, next: NextFunction) => {
  const setpoint = Number(req.query.setpoint) || 0
  const actual = (setpoint / 100) * (0.126 - 0.03) + 0.03
  servo.write(actual)
  console.log(`set to ${setpoint}, actual ${actual}`)
  res.send(200)
}
