;(function(window) {
  var jquery = function(selector) {
    return new jquery.fn.init(selector)
  }

  jquery.fn = jquery.prototype = {
    constructor: jquery,
    css: function(key, value) {
      console.log('-css-', key, value)
    },
    html: function(value) {
      return '-html-'
    }
  }

  // 构造函数
  var init = (jquery.fn.init = function(selector) {
    var slice = Array.prototype.slice
    var dom = slice.call(document.querySelectorAll(selector))

    var i,
      len = dom ? dom.length : 0
    for (i = 0; i < len; i++) {
      this[i] = dom[i]
    }
    this.length = len
    this.selector = selector || ''
  })

  init.prototype = jquery.fn

  window.$ = jquery
})(window)
