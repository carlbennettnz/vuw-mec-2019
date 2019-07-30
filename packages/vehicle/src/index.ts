import express from 'express'
import { Arm } from './servo/Arm'

const app = express()

const armPromise = Arm.init({
  shoulderLeft: 0x02,
  shoulderRight: 0x03,
  elbowLeft: 0x05,
  elbowRight: 0x04,
  base: 0x06
})

armPromise.then(arm => arm.setColor([false, true, false]))

app.post('/position', async (req, res, next) => {
  try {
    const arm = await armPromise
    const pos = {
      base: Number(req.query.base) || 0,
      shoulder: Number(req.query.shoulder) || 0,
      elbow: Number(req.query.elbow) || 0
    }

    console.log(pos)
    arm.goTo(pos)
    res.send(204)
  } catch (err) {
    next(err)
  }
})

app.listen(3000)
console.log('listening on 3000')
