// Main stem and north branch come from the surveyed atlas waterway. The offshore
// waypoints are a short illustrative course through the rendered ocean polygon.
const offshore = [[246, -154], [250, -131], [247, -109], [248, -93]]

export function boatCourse([main, mouth]) {
  const river = [...main.slice(38), ...mouth.slice(1)]
  const points = [...river, ...offshore]
  let length = 0
  const segments = points.slice(1).map(([bx, by], i) => {
    const [x, y] = points[i]
    const dx = bx - x, dy = by - y
    const span = Math.hypot(dx, dy)
    const segment = { x, y, dx, dy, span, start: length }
    length += span
    return segment
  })
  const mouthStart = segments[main.length - 39].start
  const mouthEnd = segments[river.length - 1].start

  return {
    length, mouthStart, mouthEnd,
    pointAt(distance, out) {
      const d = Math.max(0, Math.min(distance, length))
      const segment = segments.find(s => d < s.start + s.span) || segments.at(-1)
      const t = (d - segment.start) / segment.span
      return out.set(segment.x + segment.dx * t, segment.y + segment.dy * t)
    },
    nearestRiver(x, y, reach) {
      let best = reach * reach
      let distance = null
      for (const s of segments) {
        if (s.start >= mouthEnd) break
        const t = Math.max(0, Math.min(1, ((x - s.x) * s.dx + (y - s.y) * s.dy) / (s.span * s.span)))
        const dx = x - s.x - t * s.dx, dy = y - s.y - t * s.dy
        const squared = dx * dx + dy * dy
        if (squared < best) { best = squared; distance = s.start + s.span * t }
      }
      return distance
    },
  }
}
