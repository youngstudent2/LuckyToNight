define(function(require, exports, module) {

  var $ = require('./jquery')
  require('./easing')
  require('./velocity')
  var CANVAS_HEIGHT = 700
  var CANVAS_WIDTH = 900

  var BALL_WIDTH = 70
  var BALL_HEIGHT = 70
  var LUCKY_BALL_WIDTH = 300
  var LUCKY_BALL_HEIGHT = 300

  var DURATION_MIN = 500
  var DURATION_MAX = 1000
  var ZOOM_DURATION = 700
  var HIT_SPEED = 20

  var RIGIDITY = 2 // 弹性系数：2 -钢球 4 - 橡胶球，越大越软，建议小于 10

  var dis_num = 150 //一次抽奖显示的球的个数

  function User(name, options) {
    this.name = name
    this.options = options || {}

    this.el = null
    this.width = 0
    this.height = 0
    this.left = 0
    this.top = 0
    this.x = 0
    this.y = 0

    this.moving = false
    this.lucky = false
    this.zooming = false

    this.createEl()
    this.move()
  }

  User.prototype.createEl = function() {
    this.el = $('<li>' + this.name + '</li>').appendTo('#balls')
    this.width = this.el.width()
    this.height = this.el.height()
  }

  User.prototype.move = function(callback) {
    this.left = r(0, CANVAS_WIDTH - this.width)
    this.top = r(0, CANVAS_HEIGHT - this.height)

    this.x = this.left + this.width / 2
    this.y = this.top + this.height / 2
    Velocity(this.el,{
      'left': this.left,
      'top': this.top
    },{
      duration: r(DURATION_MIN, DURATION_MAX),
      easing: "easeInSine",
      complete: callback
    })
    //this.reflow(callback)
  }

  User.prototype.changeName = function(newName){
    this.name = newName
    this.el[0].textContent = newName
 
  }

  User.prototype.reflow = function(callback, direct) {
     

    if (direct) {
      this.el[0].style.left = this.left
      this.el[0].style.top = this.top
    }
    else {
      var x = this.left + this.width / 2
      var y = this.top + this.height / 2
      this.x += (x - this.x)*330/r(DURATION_MIN,DURATION_MIN)
      this.y += (y - this.y)*330/r(DURATION_MIN,DURATION_MIN)
      this.left = this.x - this.width / 2
      this.top = this.y - this.height / 2 
       this.el.animate({
        'left': this.left,
        'top': this.top
      }, 18, 'easeOutBack', callback)/**/
     /*
     Velocity(this.el,{
        'left': this.left,
        'top': this.top
      },{
        duration: 8,
        easing: "easeInSine",
        complete: callback
      })*/
    } 
  }

  User.prototype.start = function() {
    this.reset()
    this.moving = true
    this.autoMove()
  }

  User.prototype.reset = function() {
    this.el.stop(true, true)
    this.zooming = false
    this.lucky = false

    this.el[0].className = ''
    this.el[0].style.width = BALL_WIDTH + 'px'
    this.el[0].style.height = BALL_HEIGHT + 'px'
    this.width = this.el.width()
    this.height = this.el.height()

    this._maxTop = CANVAS_HEIGHT - this.height
    this._maxLeft = CANVAS_WIDTH - this.width
  }

  User.prototype.autoMove = function() {
    var that = this
   
    if (this.moving) {
      this.move(function() {
        that.autoMove()
      })
    }
  }

  User.prototype.stop = function() {
    this.el.stop(true, true)
    this.moving = false
  }

  User.prototype.bang = function() {
    var that = this

    this.lucky = true
    this.el[0].className = 'selected'
    this.width = LUCKY_BALL_WIDTH
    this.height = LUCKY_BALL_HEIGHT
    this.left = (CANVAS_WIDTH - this.width) / 2
    this.top = (CANVAS_HEIGHT - this.height) / 2
    this.zooming = true
    Velocity(this.el,{
      'left': this.left,
      'top': this.top,
      'width': this.width,
      'height': this.height
    },{
      duration:ZOOM_DURATION,
      complete:function() {
        that.zooming = false
      }
    })
    /*
    this.el.animate({
      'left': this.left,
      'top': this.top,
      'width': this.width,
      'height': this.height
    }, ZOOM_DURATION, function() {
      that.zooming = false
    })*/
  }

  User.prototype.beginHit = function() {
    this._xMove = 0
    this._yMove = 0
  }

  User.prototype.hitMove = function() {
    this.left += this._xMove
    this.top += this._yMove

    this.top = this.top < 0 ? 0 : (this.top > this._maxTop ? this._maxTop : this.top)
    this.left = this.left < 0 ? 0 : (this.left > this._maxLeft ? this._maxLeft : this.left)
    if(!this.zooming)
      this.reflow(null, false)
  }


  module.exports = {

    users: [],
    dis_start:0,
    dis_end:0,
    stop_move:false,
    init: function(data) {
      this.data = data
    
      this.users = data.slice(0,dis_num).map(function(name) {
        return new User(name);
      })

      this._bindUI()
    },

    _bindUI: function() {
      var that = this
      var s = false
      // bind button
      var trigger = document.querySelector('#go')
      var firstButton = document.querySelector('#first')
      var secondButton = document.querySelector('#second')
      var thirdButton = document.querySelector('#third')
      var luckys=document.querySelector('#lucky-balls')
      var luckyButton1 = document.querySelector('#lucky-prize1')
      var luckyButton2 = document.querySelector('#lucky-prize2')
      trigger.innerHTML = trigger.getAttribute('data-text-start')
      trigger.addEventListener('click', go, false)
      firstButton.addEventListener('click', go1, false)
      secondButton.addEventListener('click',go2_auto, false)
      thirdButton.addEventListener('click', go3_auto, false)
      luckyButton1.addEventListener('click',go4_auto, false)
      luckyButton2.addEventListener('click',go5_auto, false)
      function go() {
        if (trigger.getAttribute('data-action') === 'start') {
          trigger.setAttribute('data-action', 'stop')
          trigger.innerHTML = trigger.getAttribute('data-text-stop')
          that.start()
        }
        else {
          trigger.setAttribute('data-action', 'start')
          trigger.innerHTML = trigger.getAttribute('data-text-start')
          that.stop()
        }
      }

      function go1() {
        if(trigger.getAttribute('data-running') === 'running')
          return
        if(luckys.innerHTML.length>0){
          that.moveLucky()
          luckys.innerHTML = ''
        }
        if (trigger.getAttribute('data-action') === 'start') {
          trigger.setAttribute('data-action', 'stop')
          trigger.innerHTML = firstButton.getAttribute('data-text-stop')
          that.start()
        }
        else {
          trigger.setAttribute('data-action', 'start')
          trigger.innerHTML = firstButton.getAttribute('data-text-start')
          that.stop()
        }
      }

      function go2() {
        if (trigger.getAttribute('data-action') === 'start') {
          trigger.setAttribute('data-action', 'stop')
          trigger.innerHTML = secondButton.getAttribute('data-text-stop')
          that.start()
        }
        else {
          trigger.setAttribute('data-action', 'start')
          trigger.innerHTML = secondButton.getAttribute('data-text-start')
          that.stop()
        }
      }

      function go2_auto(){
        if(trigger.getAttribute('data-running') === 'running')
          return
        if(luckys.innerHTML.length>0){
          that.moveLucky()
          luckys.innerHTML = ''         
        }
        if(trigger.getAttribute('data-action') === 'start')
          go2()
        else{
          that.stop_move = true
          for(var i=0;i<3;i++){
            setTimeout(go2,5+i*2000)
            setTimeout(go2,2000+i*2000)
          }
          setTimeout(() => {
            go2()
            that.stop_move = false
          },5+3*2000)
          //问：为什么您开始写屎山代码？
          //答：昨晚甲方又改需求了嘤嘤嘤o(╥﹏╥)o
        }

      }
      function go3() {
        if (trigger.getAttribute('data-action') === 'start') {
          trigger.setAttribute('data-action', 'stop')
          trigger.innerHTML = thirdButton.getAttribute('data-text-stop')
          that.start()
        }
        else {
          trigger.setAttribute('data-action', 'start')
          trigger.innerHTML = thirdButton.getAttribute('data-text-start')
          that.stop()
        }
      }
      function go3_auto() {
        if(trigger.getAttribute('data-running') === 'running')
          return
        if(luckys.innerHTML.length>0){
          that.moveLucky()
          luckys.innerHTML = ''
        }
        if(trigger.getAttribute('data-action') === 'start')
          go3()
        else{
          that.stop_move = true
          for(var i=0;i<7;i++){
            setTimeout(go3,5+i*2000)
            setTimeout(go3,2000+i*2000)
          }
          
          setTimeout(() => {
            go3()
            that.stop_move = false
          },5+7*2000)
        }
      }
      function go4() {
        if (trigger.getAttribute('data-action') === 'start') {
          trigger.setAttribute('data-action', 'stop')
          trigger.innerHTML = luckyButton1.getAttribute('data-text-stop')
          that.start()
        }
        else {
          trigger.setAttribute('data-action', 'start')
          trigger.innerHTML = luckyButton1.getAttribute('data-text-start')
          that.stop()
        }
      }

      function go4_auto() {
        if(trigger.getAttribute('data-running') === 'running')
          return
        else trigger.setAttribute('data-running', 'running')
        if(luckys.innerHTML.length>0){
          that.moveLucky()
          luckys.innerHTML = ''
        }
        go4()
        for(var i=0;i<15;i++){
          setTimeout(go4,2000+i*2000)
        }
        setTimeout(() => {
          trigger.setAttribute('data-running', 'wait')
         
        }, 30010);
      }
      function go5() {
        if (trigger.getAttribute('data-action') === 'start') {
          trigger.setAttribute('data-action', 'stop')
          trigger.innerHTML = luckyButton2.getAttribute('data-text-stop')
          that.start()
        }
        else {
          trigger.setAttribute('data-action', 'start')
          trigger.innerHTML = luckyButton2.getAttribute('data-text-start')
          that.stop()
        }
      }

      function go5_auto() {
        if(trigger.getAttribute('data-running') === 'running')
          return
        else trigger.setAttribute('data-running', 'running')
        if(luckys.innerHTML.length>0){
          that.moveLucky()
          luckys.innerHTML = ''
        }
        go5()
        for(var i=0;i<15;i++){
          setTimeout(go5,2000+i*2000)
        }
        setTimeout(() => {
          trigger.setAttribute('data-running', 'wait')
        }, 30010);
      }



      // bind #lucky-balls
      $('#lucky-balls').on('click', 'li', function(e) {
        var el = $(e.target)
        var name = el.text()
        var options = that.data[name]

        if (options) {
          that.addItem(name, options)
          that.hit()
          el.remove()
        }
      })

      // bind #balls
      $('#balls').on('click', 'li', function(e) {
        var el = $(e.target)
        var name = el.text()
        that.s=true
        for (var i = 0; i < that.users.length; i++) {
          var user = that.users[i]

          if (user.name === name) {
            that.moveLucky()
            if (that.luckyUser !== user) {
              that.setLucky(user)
            }
            break
          }
        }
      })
/*
      // bind keydown
      document.addEventListener('keydown', function(ev) {
        if (ev.keyCode == '32') {
          go()
        }
        else if (ev.keyCode == '27') {
          that.moveLucky()
          $('#lucky-balls li').eq(0).click()
        }
      }, false)
*/
    },

    start: function() {
      this.timer && clearTimeout(this.timer)
      if(this.s){
        this.s=false
      }
      else {
        this.moveLucky()
      }
      

      this.dis_start+=dis_num
      if(this.dis_start+dis_num>this.data.length){
        this.dis_start=0
      }
      this.dis_end=this.dis_start+dis_num

      for(var i=0;i<this.users.length;i++){
        this.users[i].changeName(this.data[this.dis_start+i])
        if(!this.stop_move)
          this.users[i].start()
      }
    },

    stop: function() {
      var users = this.users
      var z = 0, lucky = users[0]

      for(var i=0;i<this.users.length;i++){
        this.users[i].stop()
      }
      var luckyNum = r(0,this.data.length)
      if(luckyNum>=this.dis_start&&luckyNum<this.dis_end){
        lucky = users[luckyNum-this.dis_start]
      }  
      else{
        users[0].changeName(this.data[luckyNum])
        lucky=users[0]
      }
      lucky.bang()
      this.hit()
      this.luckyNum = luckyNum
      this.luckyUser = lucky
 
    },

    removeItem: function(item, num) {
      /**/
      for (var i = 0; i < this.users.length; i++) {
        var user = this.users[i]
        if (user === item) {
          this.users.splice(i, 1)
        }
      }
      this.users.push(new User(0))
      this.data.splice(num,1);
    },

    addItem: function(name, options) {
      this.users.push(new User(name, options))
    },

    moveLucky: function() {
      var luckyUser = this.luckyUser
      if (luckyUser) {
        luckyUser.el[0].style.cssText = ''
        luckyUser.el.prependTo('#lucky-balls')
        this.removeItem(luckyUser, this.luckyNum)
        this.luckyUser = null
      }
    },

    setLucky: function(item) {
      this.users.forEach(function(user) {
        user.stop()
      })
      this.luckyUser = item
      item.bang()
      this.hit()
    },

    hit: function() {
      var that = this
      var hitCount = 0
      var users = this.users

      users.forEach(function(user) {
        user.beginHit()
      })
      for (var i = 0; i < users.length; i++) {
        for (var j = i + 1; j < users.length; j++) {
          if (isOverlap(users[i], users[j])) {
            hit(users[i], users[j])
            hitCount++
          }
        }
      }

      users.forEach(function(user) {
         user.hitMove()
      })

      if (hitCount > 0) {
        this.timer = setTimeout(function() {
          that.hit()
        }, HIT_SPEED)
      }
    }
  }


  // Helpers

  function r(from, to) {
    from = from || 0
    to = to || 1
    return Math.floor(Math.random() * (to - from + 1) + from)
  }

  function getOffset(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  }

  function isOverlap(a, b) {
    return getOffset(a, b) <= (a.width + b.width) / 2
  }

  function hit(a, b) {
    var yOffset = b.y - a.y
    var xOffset = b.x - a.x

    var offset = getOffset(a, b)

    var power = Math.ceil(((a.width + b.width) / 2 - offset) / RIGIDITY)
    var yStep = yOffset > 0 ? Math.ceil(power * yOffset / offset) : Math.floor(power * yOffset / offset)
    var xStep = xOffset > 0 ? Math.ceil(power * xOffset / offset) : Math.floor(power * xOffset / offset)

    if (a.lucky) {
      b._xMove += xStep * 2
      b._yMove += yStep * 2
    }
    else if (b.lucky) {
      a._xMove += xStep * -2
      a._yMove += yStep * -2
    }
    else {
      a._yMove += -1 * yStep
      b._yMove += yStep

      a._xMove += -1 * xStep
      b._xMove += xStep
    }
  }

})
