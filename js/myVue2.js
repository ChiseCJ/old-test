/**
 * *this._watcherTpl 订阅池：给 data 对象的属性，生成各自的 订阅池 并在 set 时遍历它并触发 el.update()
 * *this._observer 观察者：对 data 对象实现 Object.defineProperty 并在 set 时遍历 订阅池 并触发 el.update()
 * *this._compile 模版解析：对 el 的节点进行遍历，把 v-bind v-model {{}} 按类型，new 各自的 Watcher() 方法，并触发 el.update() 初始化视图，并绑定对于的事件
 * !这个实例并不支持深度遍历 data 但是下面的 {{}}模版 却是支持
 */
function myVue(options = {}) {
  this.$options = options
  this.$el = document.querySelector(options.el)
  this._data = options.data
  // this._watcherTpl = {} // 订阅池
  this._dep = new Dep() // *新建订阅池实例
  console.log(this._watcherTpl)
  this._observer(this._data) // 数据绑定
  this._compile(this.$el) // 编译模版
  console.log(this)
}
myVue.prototype._observer = function(obj) {
  var _this = this

  // *这执行的是个 func 函数，不用担心想 for 循环一样丢失数据
  Object.keys(obj).forEach(key => {
    // *初始化数据的订阅池(给每个属性一个独立的池)
    _this._dep.subs[key] = {
      _directives: []
    }

    var value = obj[key]

    // *_this._data 如果改成 _this 就实现了数据代理可以直接 this.a
    Object.defineProperty(_this._data, key, {
      configurable: true,
      enumerable: true, // 默认情况下 defineProperty 设置的是不可枚举的
      get() {
        // console.log(`${key}获取值：${value}`)
        return value
        // return _this._data[key]
      },
      set(newVal) {
        console.log(`${key}更新：${newVal}`)
        if (value !== newVal) {
          value = newVal
          // 发布 订阅的
          _this._dep.notify(key)
        }
      }
    })
  })
}
myVue.prototype._compile = function(el) {
  var _this = this,
    nodes = el.children // 获取app的dom
  for (var i = 0, len = nodes.length; i < len; i++) {
    // 遍历dom节点
    var node = nodes[i]
    if (node.children.length) {
      _this._compile(node) // 递归深度遍历 dom树
    }
    // 如果有v-model属性，并且元素是INPUT或者TEXTAREA，我们监听它的input事件
    if (
      node.hasAttribute('v-model') &&
      (node.tagName = 'INPUT' || node.tagName == 'TEXTAREA')
    ) {
      node.addEventListener(
        'input',
        (function(key) {
          // *事件绑定其实是类似异步的，如果不用闭包，等实际运行时 i 就只是最后的值，注意下面需要 return fun()
          // 获取v-model绑定的值
          var attrVal = node.getAttribute('v-model')
          _this._dep.addSub(attrVal, new Watcher(node, _this, attrVal, 'value'))
          return function() {
            // input值改变的时候 将新值赋给数据 触发set=>set触发watch 更新视图
            _this._data[attrVal] = nodes[key].value
            // _this[attrVal] = nodes[key].value
          }
        })(i)
      )
    }
    // v-bind指令
    if (node.hasAttribute('v-bind')) {
      var attrVal = node.getAttribute('v-bind') // 绑定的data
      _this._dep.addSub(attrVal, new Watcher(node, _this, attrVal, 'innerHTML'))
    }
    // {{}}模版
    var reg = /\{\{\s*([^}]+\S)\s*\}\}/g,
      txt = node.textContent // 正则匹配{{}}
    if (reg.test(txt)) {
      node.textContent = txt.replace(reg, (matched, placeholder) => {
        // matched匹配的文本节点包括{{}}, placeholder 是{{}}中间的属性名
        var getName = _this._dep.subs // 所有绑定watch的数据
        getName = getName[placeholder] // 获取对应watch 数据的值
        // *有可能只是把 data 的数据进行展示 testData3
        // *所有没有事件池 创建事件池
        if (!getName._directives) {
          getName._directives = []
        }
        _this._dep.addSub(placeholder, new Watcher(node, _this, placeholder, 'innerHTML'))
        // *这个 split('.') 因为是为了遍历深对象 a.b.c
        // ?但是上面的 getName._directives 又不支持
        return placeholder.split('.').reduce((val, key) => {
          console.log('--', val, key)
          // 获取数据的值 触发get 返回当前值
          // return _this._data[key]
          return val[key]
          // }, _this.$el)
        }, _this._data)
        // return _this._data[placeholder]
      })
    }
  }
}

// *订阅池
function Dep() {
  this.subs = {}
}
Dep.prototype.addSub = function(attrVal, sub) {
  this.subs[attrVal]._directives.push(sub)
}
Dep.prototype.notify = function(attrVal) {
  this.subs[attrVal]._directives.forEach(item => {
    item.update()
  })
}

/**
 * *这是实际更新视图的函数，同时完成了视图的初始化
 */
function Watcher(el, vm, val, attr) {
  this.el = el
  this.vm = vm // myvue 的实例
  this.val = val
  this.attr = attr
  // 初始化的时，直接调用是为了，最开始显示默认的 data.xxx
  this.update()
}
Watcher.prototype.update = function() {
  // 更新元素的对于内容(value, innerHTML)
  this.el[this.attr] = this.vm._data[this.val]
  // this.el[this.attr] = this.vm[this.val]
}
