import { Request, Response } from 'express'
import PiCamera from 'pi-camera'

export default (req: Request, res: Response) => {
  const time = Date.now()
  const camera = new PiCamera({
    mode: 'photo',
    output: `${__dirname}/../pics/${time}.jpg`,
    width: 640,
    height: 480,
    nopreview: true
  })

  camera
    .snap()
    .then(() => res.send(time))
    .catch((err: any) => {
      console.error(err)
      res.status(500).send((err && err.message) || err)
    })
}
