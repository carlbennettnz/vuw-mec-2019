import React, { Fragment } from 'react'

export default ({ x, y }) => (
  <Fragment>
    <rect x={x} y={y} width="160" height="160" className="stroke-current" fill="transparent" />
    <circle cx={x + 80} cy={y + 80} r="60" className="stroke-current" fill="transparent" />
    <circle cx={x + 80} cy={y + 80} r="20" className="stroke-current" fill="transparent" />

    <line
      x1={x + 60}
      y1={y + 80}
      x2={x + 20}
      y2={y + 80}
      className="stroke-current"
      fill="transparent"
    />
    <line
      x1={x + 100}
      y1={y + 80}
      x2={x + 140}
      y2={y + 80}
      className="stroke-current"
      fill="transparent"
    />
    <line
      x1={x + 80}
      y1={y + 60}
      x2={x + 80}
      y2={y + 20}
      className="stroke-current"
      fill="transparent"
    />
    <line
      x1={x + 80}
      y1={y + 100}
      x2={x + 80}
      y2={y + 140}
      className="stroke-current"
      fill="transparent"
    />
    <line
      x1={x + 80 - 20 * Math.sin(Math.PI / 4)}
      y1={y + 80 + 20 * Math.sin(Math.PI / 4)}
      x2={x + 80 - 60 * Math.sin(Math.PI / 4)}
      y2={y + 80 + 60 * Math.sin(Math.PI / 4)}
      className="stroke-current"
      fill="transparent"
    />
    <line
      x1={x + 80 + 20 * Math.sin(Math.PI / 4)}
      y1={y + 80 + 20 * Math.sin(Math.PI / 4)}
      x2={x + 80 + 60 * Math.sin(Math.PI / 4)}
      y2={y + 80 + 60 * Math.sin(Math.PI / 4)}
      className="stroke-current"
      fill="transparent"
    />
    <line
      x1={x + 80 + 20 * Math.sin(Math.PI / 4)}
      y1={y + 80 - 20 * Math.sin(Math.PI / 4)}
      x2={x + 80 + 60 * Math.sin(Math.PI / 4)}
      y2={y + 80 - 60 * Math.sin(Math.PI / 4)}
      className="stroke-current"
      fill="transparent"
    />
    <line
      x1={x + 80 - 20 * Math.sin(Math.PI / 4)}
      y1={y + 80 - 20 * Math.sin(Math.PI / 4)}
      x2={x + 80 - 60 * Math.sin(Math.PI / 4)}
      y2={y + 80 - 60 * Math.sin(Math.PI / 4)}
      className="stroke-current"
      fill="transparent"
    />
  </Fragment>
)
