const express = require('express')
const fs = require('fs')
const { spawn } = require('child_process')
const Mp4Segmenter = new require('./Mp4Segmenter')
const segmenter = new Mp4Segmenter()
const ffmpeg = spawn(
  'ffmpeg',
  [
    '-loglevel',
    'debug',
    '-r',
    '30',
    '-s',
    '320x240',
    '-pix_fmt',
    'uyvy422',
    '-f',
    'avfoundation',
    '-i',
    '0',
    '-an',
    // '-c:v',
    // 'copy',
    '-f',
    'mp4',
    '-r',
    '1',
    '-movflags',
    '+frag_keyframe+empty_moov+default_base_moof',
    '-metadata',
    'title="media source extensions"',
    'pipe:1'
  ],
  {
    stdio: [
      'ignore',
      'pipe',
      'inherit' /* change stdio[2] inherit to ignore to hide ffmpeg debug to stderr */
    ]
  }
)

ffmpeg.on('error', error => {
  console.error('error', error)
})

ffmpeg.on('exit', (code, signal) => {
  console.log('exit', code, signal)
})

ffmpeg.stdio[1].pipe(segmenter)

const app = express()

app.get('/video', function(req, res) {
  if (!segmenter.initSegment) {
    res.status(503)
    res.end('service not available')
    return
  }

  res.status(200)
  res.header('Content-Type', 'video/mp4')
  res.write(segmenter.initSegment)
  ffmpeg.stdio[1].pipe(res)
  res.on('close', () => {
    ffmpeg.stdio[1].unpipe(res)
  })
})

app.listen(3000)
