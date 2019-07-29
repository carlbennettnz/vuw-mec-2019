import { Arm } from './Arm'
import { Servo } from './Servo'
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
async function play() {
  const arm = await Arm.init({
    shoulderLeft: 0x02,
    shoulderRight: 0x03,
    elbowLeft: 0x05,
    elbowRight: 0x04
  })

  // await arm.moveShoulderBackwards()
  // await arm.moveShoulderForwards()

  // await arm.moveElbowStraight()
  await arm.moveElbowBend()
  await wait(1000)
  await arm.stop()
}

play().catch(console.error)
