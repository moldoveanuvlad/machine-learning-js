const colors = ['#e01a4fff', '#f9c22eff', '#53b3cbff']
const dataset = new Array(300)
const trainerSet = []
const magicNumberK = 3
const size = 510

const svg = d3.select('svg')
  svg.attr('width', size)
  svg.attr('height', size)
  svg.on("click", function() {
    const coords = d3.mouse(this)
    trainerSet.push(this)
    svg.append('circle')
      .attr('r', function(d){ return 5 })
      .attr('cx', function(d, i){ return coords[0]})
      .attr('cy', function(d, i){ return coords[1]})
      .attr('fill', function(){
        return knn(trainerSet, d3.select(this))
      })
  })

const circles = svg.selectAll('circle').data(dataset)
  circles.enter()
  .append('circle')
  .attr('r',function(d){ return 5 })
  .attr('cx',function(d, i){ return Math.floor(Math.random()*(size-10) +5)})
  .attr('cy',function(d, i){ return Math.floor(Math.random()*(size-10) +5)})
  .attr('fill', function(d){
    trainerSet.push(this)
    //second iteration
    if(parseInt(d3.select(this).attr('cx')) > parseInt(d3.select(this).attr('cy'))){
      return 'green'
    }
    else{
      return colors[Math.floor(Math.random()*3)]
    }
    //first iteration
    //return colors[Math.floor(Math.random()*3)]
  })
const knn = (dataset, point) => {
  let distances = []
  const currentNodeX = point.attr('cx')
  const currentNodeY = point.attr('cy')
	dataset.forEach((e) => {
    const neighbourX = d3.select(e).attr('cx')
    const neighbourY = d3.select(e).attr('cy')
  	let distance = Math.sqrt(Math.pow(neighbourX-currentNodeX, 2) + Math.pow(neighbourY-currentNodeY, 2))
    d3.select(e).attr('distance', distance)
    distances.push(distance)
  })
  distances.sort(function(a, b){return a-b})
  const nb = []
  for(let i=0; i< magicNumberK; i++){
    const nextNeighbour = d3.select("[distance='" + distances[i] + "']")
  	const nextNeighbourX = nextNeighbour.attr('cx')
  	const nextNeighbourY = nextNeighbour.attr('cy')
  	const nextNeighbourFill = nextNeighbour.attr('fill')
    nb.push({fill: nextNeighbourFill, distance: nextNeighbour.attr('distance')})
    svg.append('line')
      .attr('x1', currentNodeX)
      .attr('x2', nextNeighbourX)
      .attr('y1', currentNodeY)
      .attr('y2', nextNeighbourY)
      .style("stroke-dasharray", ("3, 3"))
      .attr('stroke', 'grey')
      .lower()
  }
  const result = _.chain(nb)
  .countBy('fill')
  .toPairs()
  .sortBy((el) => el[1])
  .value()
  .reverse()
  console.log(result)
  return result[0][0]
}

// setInterval(() => {
//   console.log(Math.random() * 410)
//   svg.append('circle')
//       .attr('r', function(d){ return 5 })
//       .attr('cx', function(d, i){ return Math.floor(Math.random() * 410)})
//       .attr('cy', function(d, i){ return Math.floor(Math.random() * 410)})
//       .attr('fill', function(){
//         console.log(d3.select(this))
//         return knn(trainerSet, d3.select(this))
//       })
// },100)
