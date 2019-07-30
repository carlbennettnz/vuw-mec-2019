import express from 'express'

import camera from './camera'
import gimbal from './gimbal'

const app = express()

app.use(express.static(__dirname + '/../../ui/dist'))
app.use(express.static(__dirname + '/../pics'))
app.post('/snap', camera)
app.post('/gimbal', gimbal)

app.listen(3000)
console.log('listening on 3000')
