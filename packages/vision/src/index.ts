import express from 'express'

import camera from './camera'

const app = express()

app.use(express.static(__dirname + '/../../ui/dist'))
app.use(express.static(__dirname + '/../pics'))
app.post('/snap', camera)

app.listen(3000)
