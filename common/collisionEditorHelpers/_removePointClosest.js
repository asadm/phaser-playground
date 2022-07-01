export default function(polygon, point) {
  let closestPointsIndex = -1;
  let closestPointsDistance = 10000000;

  // try each point pair in polygon and see where this point can be added
  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const distance =  Math.sqrt( Math.pow((p1.x-point.x), 2) + Math.pow((p1.y-point.y), 2) );;
    if (distance < closestPointsDistance) {
      closestPointsDistance = distance;
      closestPointsIndex = i;
    }
  }

  // clone polygon and remove point from polygon
  let clone = polygon.slice(0)
  clone.splice(closestPointsIndex, 1);
  return clone;
}
