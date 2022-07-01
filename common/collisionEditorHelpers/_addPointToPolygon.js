export default function(polygon, point) {
  let closestPointsIndex = -1;
  let closestPointsDistance = 10000000;

  // try each point pair in polygon and see where this point can be added
  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const distance = pDistance(point.x, point.y, p1.x, p1.y, p2.x, p2.y);
    if (distance < closestPointsDistance) {
      closestPointsDistance = distance;
      closestPointsIndex = i;
    }
  }

  // console.log("closestPointsIndex", closestPointsIndex, closestPointsDistance, polygon[closestPointsIndex], polygon[(closestPointsIndex + 1) % polygon.length]);
  // clone polygon and add point to polygon
  let clone = polygon.slice(0)
  clone.splice((closestPointsIndex + 1) % polygon.length, 0, point);
  return clone;
}

// https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
function pDistance(x, y, x1, y1, x2, y2) {

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}