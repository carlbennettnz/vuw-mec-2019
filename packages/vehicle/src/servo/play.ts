import { Arm } from './Arm'
import { Servo } from './Servo'
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
async function play() {
  const arm = await Arm.init({
    shoulderLeft: 0x02,
    shoulderRight: 0x03,
    elbowLeft: 0x05,
    elbowRight: 0x04,
    base: 0x06
  })

  await arm.setColor([false, true, false])
  await wait(300)
  // arm.go()

  // await arm.
  const speed = Number(process.argv[2]) || 0

  console.log('move')
  await arm.moveElbow(speed)
  await arm.moveShoulder(speed)
  await arm.rotate(speed)
  await wait(1000)
  await arm.stop()
  console.log('done')

  // await wait(300)
  // await arm.setColor([false, true, false])
  // await arm.moveShoulder(-200)
  // await wait(300)
  // await arm.moveShoulder(0)

  // await arm.moveElbowStraight()
  // await arm.moveElbowBend()
  // await arm.stop()

  await wait(100)
  await arm.close()
}

play().catch(console.error)
