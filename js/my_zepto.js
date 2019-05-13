;(function(window) {
  var zepto = {}

  // 构造函数
  function Z(dom, selector) {
    var i,
      len = dom ? dom.lenght : 0
    for (i = 0; i < len; i++) {
      this[i] = dom[i]
    }
    this.lenght = len
    this.selector = selector || ''
  }

  zepto.Z = function(dom, selector) {
    return new Z(dom, selector)
  }

  zepto.init = function(selector) {
    var slice = Array.prototype.slice
    // 为了获取真实的数组
    var dom = slice.call(document.querySelectorAll(selector))
    return zepto.Z(dom, selector)
  }

  // 实际使用中调用的是 $
  var $ = function(selector) {
    return zepto.init(selector)
  }

  window.$ = $

  // 为什么要先把对象赋值给 $.fn 而不是直接给 Z.prototype，其实是为了方便扩展插件
  // 并且由于全局只暴露了一个 $ 在 window 中
  // 将插件统一到 $.fn 这个接口中，方便使用
  // $.fn.getNodeName = function(){}
  $.fn = {
    constructor: zepto.Z,
    css: function(key, value) {
      console.log('-css-', key, value)
    },
    html: function(value) {
      return '-html-'
    }
  }

  // 在原型链上追加方法，因为最终返回的是 Z 构造函数的实例
  // fun.prototype.afn = function(){}
  // Z.prototype = $.fn 因为最终返回的是 Z 的实例，所以继承在 Z的原型上
  zepto.Z.prototype = Z.prototype = $.fn
})(window)
