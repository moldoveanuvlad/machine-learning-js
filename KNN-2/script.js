
class FreeKick {

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.LRchances = [];
    this.UDchances = [];
    this.goals = 0;
    this.misses = 0;
  }

  positionMapper(position){
    return position + 100
  }

  decideOnShootDirection(x, y){
    this.LRchances = [];
    this.UDchances = [];
    const LR = d3.scaleLinear()
        .domain([0,100])
        .range([5, 80])

    const MC = d3.scaleLinear()
            .domain([100,0])
            .range([5, 80])
    // -100 , 0, 100
    const r = Math.round(LR(-Math.min(0, y)))
    const m = Math.round(MC(Math.abs(y)))
    const l = Math.round(LR(Math.max(0, y)))

    const u = Math.round(LR(-Math.min(0, x)))
    const c = Math.round(MC(Math.abs(x)))
    const d = Math.round(LR(Math.max(0, x)))
    console.log(r, m, l, u, c , d)
    const o = (100 - (l + m + r))

    for(let i = 0; i < l; i++){
      this.LRchances.push('L')
    }
    for(let i = 0; i < r; i++){
      this.LRchances.push('R')
    }
    for(let i = 0; i < m; i++){
      this.LRchances.push('M')
    }
    for(let i = 0; i < o; i++){
      this.LRchances.push('O')
    }

    for(let i = 0; i < u; i++){
      this.UDchances.push('U')
    }
    for(let i = 0; i < d; i++){
      this.UDchances.push('D')
    }
    for(let i = 0; i < c; i++){
      this.UDchances.push('C')
    }

    console.log('For Y position ' + this.positionMapper(this.x)+ ' left chances are: ' + l + '. center chances are: ' + m + '. right chances are: ' + r +'. miss chances are: ' + o)
    console.log('For X position ' + this.positionMapper(this.y)+ ' up chances are: ' + u + '. center chances are: ' + c + '. down chances are: ' + d)
  }

  execute(){
    this.decideOnShootDirection(this.x, this.y)
    const shoot = (c) => {
      return c[Math.floor(Math.random()*100)]
    }
    const xShoot = shoot(this.LRchances)
    const yShoot = shoot(this.UDchances)
    console.log("Shoot position is: " + this.positionMapper(this.x) + "," + this.positionMapper(this.y) + ". Shoot will be directed to: " + xShoot + yShoot + "")
    d3.select('#direction').html(xShoot+yShoot)
    return xShoot+yShoot
  }
}

class Keeper {
  constructor(){
    this.positions = ['LU', 'MU', 'RU', 'LC', 'MC', 'RC', 'LD', 'MD', 'RD']
  }

  positionMapper(position){
    return position + 100
  }

  randomDefendFreeKick(fk) {
    const randomChosenPosition = this.positions[Math.floor(Math.random()*9)]

    d3.selectAll('.circle').style('background', 'transparent')
    d3.selectAll('.circle').style('border', '2px solid #d3d3d3')
    d3.select('.' + randomChosenPosition).style('border', '2px solid black')
    if(!this.positions.includes(fk) || !this.positions.includes(randomChosenPosition)){
      d3.select('#direction').html('Outside')
      d3.select('#keeper').html('Outside')
      return
    }
    console.log('Random chosen position is:', randomChosenPosition)
    if( fk === randomChosenPosition){
      console.log('I`ve defended the free kick!!!')
      d3.select('.' + fk).style('background', 'green')
      freeKick.misses++
    }
    else {
      console.log('Oh no, it`s a goal')
      d3.select('.' + fk).style('background', 'red')
      freeKick.goals++
    }
    d3.select('#goals').html(freeKick.goals)
    d3.select('#misses').html(freeKick.misses)
    d3.select('#accuracy').html((freeKick.misses * 100 / (freeKick.misses+freeKick.goals)).toFixed(2) + '%') 
    d3.select('#keeper').html(randomChosenPosition)

    return fk === randomChosenPosition ? 'defend' : 'goal'
  }

  trainedDefendFreeKick(fk){
    const learnedData = this.trainKeeper()
    const trainedChosenPosition = this.knn(learnedData, { x: freeKick.x, y: freeKick.y }, 5)
    d3.selectAll('.circle').style('background', 'transparent')
    d3.selectAll('.circle').style('border', '2px solid #d3d3d3')
    d3.select('.' + trainedChosenPosition).style('border', '2px solid black')
    if(!this.positions.includes(fk) || !this.positions.includes(trainedChosenPosition)){
      d3.select('#direction').html('Outside')
      d3.select('#keeper').html('Outside')
      return
    }
    if( fk === trainedChosenPosition){
      console.log('I`ve defended the free kick!!!')
      d3.select('.' + fk).style('background', 'green')
      freeKick.misses++
    }
    else {
      console.log('Oh no, it`s a goal')
      d3.select('.' + fk).style('background', 'red')
      freeKick.goals++
    }
    d3.select('#goals').html(freeKick.goals)
    d3.select('#misses').html(freeKick.misses)
    d3.select('#accuracy').html((freeKick.misses * 100 / (freeKick.misses+freeKick.goals)).toFixed(2) + '%') 
    d3.select('#keeper').html(trainedChosenPosition)

    return fk === trainedChosenPosition ? 'defend' : 'goal'
  }

  knn(dataset, point, k) {
    let distances = []
    dataset.forEach((e) => {
      const neighbourX = e.x
      const neighbourY = e.y
      let distance = Math.sqrt(Math.pow(neighbourX - this.positionMapper(point.x), 2) + Math.pow(neighbourY - this.positionMapper(point.y), 2))
      distances.push({distance: distance, ...e})
    })

    const ordered = _.orderBy(distances, 'distance', 'asc')
    console.log(ordered)
    const reducedSet = ordered.slice(0, k)
    console.log(reducedSet)

    const count = _.countBy(reducedSet, 'shoot')
    console.log(count)

    const result = _.toPairs(count)
    console.log(result)

    const lordered = _.orderBy(result, el => el[1], 'desc')
    console.log(lordered)

    let accuracy = 0
    for( let i = 0; i< 10; i++){
      const test = freeKick.execute()
      console.log(test)
      if(lordered[0][0] === test)
      accuracy++
    }
    console.log('I predict shoot will be ' + lordered[0][0] + '. My accuracy is ' + ((accuracy*100)/10).toFixed(2) + '%.')
    return lordered[0][0]
  }

  trainKeeper(){
    let trainingSet = []
      let count = 0;
      for( let i = 0; i <= 200; i = i+20) {
        for( let k = 0; k <= 200; k = k+20){
          freeKick.decideOnShootDirection(i-100, k-100)
          trainingSet.push({x: i, y: k, shoot: freeKick.execute(i-100, k-100)})
          count++
        }
      }
    return trainingSet
  }
}

const svg = d3.select("body").append("svg")
    .attr("width", 200)
    .attr("height", 220)
    .attr('fill', 'rgba(0,0,0,0)')
    .attr('class', 'shooting-area')

const rect = svg.append("rect")
    .attr("width", 200)
    .attr("height", 200)
    .attr('class', 'shoot-area')
    .style('border', '2px dashed white')
    .attr('stroke-width', 2)
    .attr('stroke', 'white')
    .attr('stroke-dasharray', '3, 3')
    .on("mousemove", mousemove)
    .on("click", addBall)
let freeKick;
let keeper = new Keeper;
function mousemove(d, i) {
  console.log(d3.mouse(this));
}

function addBall(){
  svg.selectAll('circle').remove()
  svg.append('circle')
    .attr('r', 5)
    .attr('fill', 'red')
    .attr('cx', d3.mouse(this)[0])
    .attr('cy', d3.mouse(this)[1])
  d3.select('.x-position').attr('value', d3.mouse(this)[0])
  d3.select('.y-position').attr('value', d3.mouse(this)[1])

  freeKick = new FreeKick((d3.mouse(this)[0]-100), (d3.mouse(this)[1]-100))
}

function executeFreeKick(){
  const fk = freeKick.execute()
  return keeper.randomDefendFreeKick(fk)
}
function executeUpgradedFreeKick(){
  const fk = freeKick.execute()
  return keeper.trainedDefendFreeKick(fk)
}

function massRandomShooting(times) {
  let misses = 0;
  let goals = 0
  for (let index = 0; index < times; index++) {
    const result = executeFreeKick()
    console.log(result)
    result === 'goal' ? goals++ : misses++
  }
  console.log(misses, goals)
}

function massTrainedShooting(times) {
  let misses = 0;
  let goals = 0
  for (let index = 0; index < times; index++) {
    const result = executeUpgradedFreeKick()
    console.log(result)
    result === 'goal' ? goals++ : misses++
  }
  console.log(misses, goals)
}

function reset() {

}
