import React from 'react'
import CircleThing from './machines/CircleThing'

export const Map = () => (
  <svg
    version="1.1"
    baseProfile="full"
    xmlns="http://www.w3.org/2000/svg"
    className="w-screen h-screen"
  >
    <defs>
      <pattern
        id="grid-pattern"
        patternUnits="userSpaceOnUse"
        x="300"
        y="679"
        width="20"
        height="20"
      >
        <line className="stroke-current text-gray-700" x1="0" y1="0" x2="0" y2="20" />
        <line className="stroke-current text-gray-700" x1="0" y1="0" y2="0" x2="20" />
      </pattern>

      <pattern
        id="subgrid-pattern"
        patternUnits="userSpaceOnUse"
        x="300"
        y="679"
        width="1"
        height="1"
      >
        <line x1="0" y1="0" x2="0" y2="1" />
        <line x1="0" y1="0" y2="0" x2="1" />
      </pattern>
    </defs>

    <rect fill="url(#grid-pattern)" x="0" y="0" width="100%" height="100%" />

    <rect x="100" y="100" width="100" height="100" className="stroke-current" fill="transparent" />
    <rect x="200" y="100" width="100" height="100" className="stroke-current" fill="transparent" />
    <rect x="300" y="100" width="100" height="100" className="stroke-current" fill="transparent" />
    <rect x="400" y="100" width="100" height="100" className="stroke-current" fill="transparent" />
    <rect x="500" y="100" width="100" height="100" className="stroke-current" fill="transparent" />

    <CircleThing x={100} y={300} />
    <CircleThing x={300} y={300} />
  </svg>
)
