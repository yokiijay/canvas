const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const canvasWidth = (canvas.width = window.innerWidth - 2)
const canvasHeight = (canvas.height = window.innerHeight - 2)

canvas.minX = 0
canvas.minY = 0
canvas.midX = canvasWidth / 2
canvas.midY = canvasHeight / 2
canvas.maxX = canvasWidth
canvas.maxY = canvasHeight

/* -------------------------- utils -------------------------- */
const utils = {}
utils.getMouse = (canvas = document.querySelector('canvas')) => {
  let mouse = { x: 0, y: 0 }
  canvas.addEventListener('mousemove', ev => {
    let { pageX, pageY, target } = ev
    let { left, top, widht, height } = target.getBoundingClientRect()
    mouse.x = pageX - left
    mouse.y = pageY - top
  })
  return mouse
}
utils.angleToRad = angle => {
  // Math.PI = 180
  return (angle / 180) * Math.PI
}
utils.radToAngle = rad => {
  return (rad / Math.PI) * 180
}
utils.random = (a, b) => {
  return Math.random() * (b - a) + a
}

// mouse
const mouse = utils.getMouse(canvas)

/* -------------------------- Components -------------------------- */
class Ball {
  constructor({
    x = 0,
    y = 0,
    size = 30,
    fillColor = 'hotpink',
    strokeColor,
    opacity = 1,
    speed = 1,
    direction = 0,
    borderBounce = false,
    random = {
      // 随机属性
      position: false,
      speed: false,
      direction: false,
      size: false,
      fillColor: false,
      strokeColor: false,
      opacity: false
    }
  }) {
    this.x = x
    this.y = y
    this.size = size
    this.fillColor = fillColor
    this.strokeColor = strokeColor
    this.opacity = opacity
    this.speed = speed
    this.direction = direction
    this.borderBounce = borderBounce
    this.random = random
    this.vectorX = 1
    this.vectorY = 1

    // 随机
    this.random.position && this.randomPosition()
    this.random.speed && this.randomSpeed()
    this.random.direction && this.randomDirection()
    this.random.size && this.randomSize()
    this.random.fillColor && this.randomFillColor()
    this.random.opacity && this.randomOpacity()

    return this
  }

  render(ctx) {
    ctx.save()

    ctx.beginPath()
    ctx.translate(this.x, this.y)
    ctx.fillStyle = this.fillColor
    ctx.strokeStyle = this.strokeColor
    ctx.globalAlpha = this.opacity
    ctx.arc(0, 0, this.size, 0, Math.PI * 2)
    this.fillColor && ctx.fill()
    this.strokeColor && ctx.stroke()

    ctx.restore()
    return this
  }

  randomPosition() {
    this.x = utils.random(0, canvasWidth)
    this.y = utils.random(0, canvasHeight)
  }

  randomSpeed(rangeA = 0.01, rangeB = 10) {
    this.speed = utils.random(rangeA, rangeB)
  }

  randomDirection(rangeA = -180, rangeB = 180) {
    this.direction = utils.random(rangeA, rangeB)
  }

  runAtDirection() {
    // c = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    if (this.speed && this.direction) {
      let c = 0
      c += this.speed
      this.x += Math.cos(utils.angleToRad(this.direction)) * c * this.vectorX
      this.y += Math.sin(utils.angleToRad(this.direction)) * c * this.vectorY
    }
  }

  randomSize(rangeA = 1, rangeB = 30) {
    this.size = utils.random(rangeA, rangeB)
  }

  randomFillColor() {
    this.fillColor = `rgba(${utils.random(100, 255)},${utils.random(
      100,
      255
    )},${utils.random(100, 255)},1)`
  }

  randomOpacity(rangeA = 0, rangeB = 1) {
    this.opacity = utils.random(rangeA, rangeB)
  }

  borderBouncing() {
    if (this.borderBounce) {
      if (this.x - this.size < 0) (this.vectorX *= -1), (this.x = 0 + this.size)
      if (this.x + this.size > canvasWidth)
        (this.vectorX *= -1), (this.x = canvasWidth - this.size)

      if (this.y - this.size < 0) (this.vectorY *= -1), (this.y = 0 + this.size)
      if (this.y + this.size > canvasHeight)
        (this.vectorY *= -1), (this.y = canvasHeight - this.size)
    }
  }
}

/* -------------------------- Scene -------------------------- */

class ParticleScene {
  constructor(ctx){
    this.ctx = ctx
    this.particles = new Set()
  }

  render(){
    this.particles.forEach(item=>{
      item.render(this.ctx)
    })
  }

  runAtDirection(){
    let {particles,ctx} = this
    function run(){
      requestAnimationFrame(run)
      ctx.clearRect(0,0,canvasWidth,canvasHeight)
      particles.forEach(item => {
        if(item.borderBounce) item.borderBouncing()
        item.runAtDirection()
        item.render(ctx)
      })
    } run()
  }
}

/* -------------------------- main -------------------------- */

// 1 实例化场景对象
const scene = new ParticleScene(ctx)

// 2 往场景里添加ball的实例
for(let i=0;i<100;i++){
  scene.particles.add(new Ball({
    x: canvas.midX,
    y: canvas.midY,
    borderBounce: true,
    random: {
      size: true,
      position: true,
      speed: true,
      direction: true
    }
  }))
}

// 3 渲染场景
scene.render()
// 4 让球跑起来 (球必须有speed和direction)
scene.runAtDirection()

// 5 结合鼠标事件添加球体
canvas.addEventListener('mousemove', ev=>{
  // const {pageX, pageY, target} = ev
  scene.particles.add(new Ball({
    x: mouse.x,
    y: mouse.y,
    // borderBounce: true,
    size: 4,
    random: {
      // size: true,
      speed: true,
      direction: true,
      fillColor: true,
      opacity: true
    }
  }))
})