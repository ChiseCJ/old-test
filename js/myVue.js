/**
 * *this._watcherTpl 订阅池：给 data 对象的属性，生成各自的 订阅池 并在 set 时遍历它并触发 el.update()
 * *this._observer 观察者：对 data 对象实现 Object.defineProperty 并在 set 时遍历 订阅池 并触发 el.update()
 * *this._compile 模版解析：对 el 的节点进行遍历，把 v-bind v-model {{}} 按类型，new 各自的 Watcher() 方法，并触发 el.update() 初始化视图
 */
function myVue(options = {}) {
  this.$options = options
  this.$el = document.querySelector(options.el)
  this._data = options.data // 把数据代理到 vm 上
  this._watcherTpl = {} // 订阅池
  this._observer(this._data) // 数据绑定
  this._compile(this.$el) // 编译模版
}
myVue.prototype._observer = function(obj) {
  var _this = this
  Object.keys(obj).forEach(key => {
    // 每个数据的订阅池()
    _this._watcherTpl[key] = {
      _directives: [] // 订阅的不同方式(v-model+v-bind+{{}})
    }

    var value = obj[key]
    // 数据的订阅池
    var watcherTpl = _this._watcherTpl[key]

    Object.defineProperty(_this._data, key, {
      configurable: true,
      enumerable: true,
      get() {
        console.log(`${key}获取值：${value}`)
        return value
      },
      set(newVal) {
        console.log(`${key}更新：${newVal}`)
        if (value !== newVal) {
          value = newVal
          watcherTpl._directives.forEach(item => {
            // 遍历订阅池 对应 Watcher 的 update()
            item.update()
            // 遍历所有订阅的地方(v-model+v-bind+{{}}) 触发this._compile()中发布的订阅Watcher 更新视图
          })
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
          var attVal = node.getAttribute('v-model')
          _this._watcherTpl[attVal]._directives.push(
            // 将dom替换成属性的数据并发布订阅 在set的时候更新数据
            new Watcher(node, _this, attVal, 'value')
          )
          return function() {
            // input值改变的时候 将新值赋给数据 触发set=>set触发watch 更新视图
            _this._data[attVal] = nodes[key].value
          }
        })(i)
      )
    }
    // v-bind指令
    if (node.hasAttribute('v-bind')) {
      var attrVal = node.getAttribute('v-bind') // 绑定的data
      _this._watcherTpl[attrVal]._directives.push(
        // 将dom替换成属性的数据并发布订阅 在set的时候更新数据
        new Watcher(node, _this, attrVal, 'innerHTML')
      )
    }
    // {{}}模版
    var reg = /\{\{\s*([^}]+\S)\s*\}\}/g,
      txt = node.textContent // 正则匹配{{}}
    if (reg.test(txt)) {
      node.textContent = txt.replace(reg, (matched, placeholder) => {
        console.log('-{{}}-', matched, placeholder)

        // matched匹配的文本节点包括{{}}, placeholder 是{{}}中间的属性名
        var getName = _this._watcherTpl // 所有绑定watch的数据
        getName = getName[placeholder] // 获取对应watch 数据的值
        // *有可能只是把 data 的数据进行展示 testData3
        if (!getName._directives) {
          // 没有事件池 创建事件池
          getName._directives = []
        }
        getName._directives.push(
          new Watcher(node, _this, placeholder, 'innerHTML') // 将dom替换成属性的数据并发布订阅 在set的时候更新数据
        )
        return placeholder.split('.').reduce((val, key) => {
          return _this._data[key] // 获取数据的值 触发get 返回当前值
        }, _this.$el)
      })
    }
  }
}

function Watcher(el, vm, val, attr) {
  this.el = el
  this.vm = vm // myvue 的实例
  this.val = val
  this.attr = attr
  // 初始化的时，直接调用是为了，最开始显示默认的 data
  this.update()
}
Watcher.prototype.update = function() {
  // 更新元素的对于内容(value, innerHTML)
  this.el[this.attr] = this.vm._data[this.val]
}
