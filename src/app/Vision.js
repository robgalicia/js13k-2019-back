/**
 * Refer to js13k-2018-raven.
 * @see https://github.com/elliot-nelson/js13k-2018-raven/blob/master/src/js/Util.js
 */

import {VISION_COLOR} from "./constants";
import {toRad} from "./Utils";

function isInBounds (p, bounds, fudge = 1){
  let a = bounds[0].x;
  let b = bounds[1].x;
  let c = bounds[0].y;
  let d = bounds[1].y;
  (a > b) && ([a, b] = [b, a]);
  (c > d) && ([c, d] = [d, c]);
  return p.x >= a - fudge && p.x <= b + fudge && p.y >= c - fudge && p.y <= d + fudge;
}

function getIntersection(line1, line2) {
  let A1 = line1[1].y - line1[0].y;
  let B1 = line1[0].x - line1[1].x;
  let C1 = A1 * line1[0].x + B1 * line1[0].y;

  let A2 = line2[1].y - line2[0].y;
  let B2 = line2[0].x - line2[1].x;
  let C2 = A2 * line2[0].x + B2 * line2[0].y;

  let det = A1*B2 - A2*B1;

  if (det !== 0) {
    let p = {
      x: (B2*C1 - B1*C2)/det,
      y: (A1*C2 - A2*C1)/det
    };

    if (isInBounds(p, line1, 1) && isInBounds(p, line2, 1)) {
      return p;
    }
  }
}

function getShorter(origin, end1, end2) {
  if (!end1) {
    return end2;
  }
  const end1dx = origin.x - end1.x;
  const end1dy = origin.y - end1.y;
  const end1Len = end1dx * end1dx + end1dy * end1dy;
  const end2dx = origin.x - end2.x;
  const end2dy = origin.y - end2.y;
  const end2Len = end2dx * end2dx + end2dy * end2dy;

  if(end1Len > end2Len) {
    return end2;
  }
  return end1;
}


class Vision {
  constructor (x, y, mapEdges, angleDeg, radius) {
    this.origin = {x, y};
    this.mapEdges = mapEdges;
    this.angleDeg = angleDeg;
    this.radius = radius;
  }

  getIntersectionRange (edges) {
    let firstIntersection = null, lastIntersection = null;
    const {rayEnds, origin} = this;
    rayEnds.forEach(rayEnd => {
      edges.forEach(edge => {
        let intersection = getIntersection([origin, rayEnd], edge);
        if (intersection && lastIntersection) {
          lastIntersection = intersection;
        }
        if (intersection && !firstIntersection) {
          firstIntersection = intersection;
          lastIntersection = intersection;
        }
      })
    });
    if (!firstIntersection) {
      return null;
    }
    return [firstIntersection, lastIntersection];
  }

  update(x, y, offsetDeg) {
    const {origin, angleDeg, radius, mapEdges} = this;
    origin.x = x;
    origin.y = y;
    const endDeg = offsetDeg + angleDeg / 2;
    let endIndex = 0;
    let visionDeg = offsetDeg - angleDeg / 2;
    this.rayEnds = [];
    this.rayEnds.length = (angleDeg / 2) | 0;

    while (visionDeg < endDeg) {
      const visionRad = toRad(visionDeg);
      const visionEndX = origin.x + Math.cos(visionRad) * radius;
      const visionEndY = origin.y + Math.sin(visionRad) * radius;
      const visionEnd = {x: visionEndX, y: visionEndY};
      mapEdges.forEach(mapEdge => {
        const inter = getIntersection([origin, visionEnd], [mapEdge.start, mapEdge.end]);
        this.rayEnds[endIndex] = getShorter(origin, this.rayEnds[endIndex], inter || visionEnd);
      });
      visionDeg += 2;
      endIndex ++;
    }
  }

  render(ctx) {
    const {origin, rayEnds} = this;
    ctx.fillStyle = VISION_COLOR;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    rayEnds.forEach(end => end && ctx.lineTo(end.x, end.y));
    ctx.closePath();
    ctx.fill();
  }
}

export default Vision;
