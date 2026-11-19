// Deterministic screen-space avoidance; the geographic anchor never moves.
export function layoutLandmarks(anchors,width,height,size,obstacles=[]) {
  const placed=[],gap=5,half=size/2
  for(const a of [...anchors].sort((a,b)=>a.y-b.y || a.id.localeCompare(b.id))) {
    let best=null
    for(let row=-4;row<=4;row++)for(let col=-4;col<=4;col++) {
      const x=Math.max(half+4,Math.min(width-half-4,a.x+col*(size+gap)))
      const y=Math.max(half+4,Math.min(height-half-4,a.y-half+row*(size+gap)))
      const overlap=placed.reduce((n,p)=>n+Math.max(0,size+gap-Math.abs(p.x-x))*Math.max(0,size+gap-Math.abs(p.y-y)),0)
      const blocked=obstacles.reduce((n,r)=>n+Math.max(0,Math.min(x+half+3,r.right)-Math.max(x-half-3,r.left))*Math.max(0,Math.min(y+half+3,r.bottom)-Math.max(y-half-3,r.top)),0)
      const cost=(overlap+blocked)*10000+(x-a.x)**2+(y-(a.y-half))**2
      if(!best||cost<best.cost)best={...a,x,y,anchorX:a.x,anchorY:a.y,cost}
    }
    placed.push(best)
  }
  return placed
}
