;(function(window) {
  // 调用 schema 的封装
  function _invoek(action, data, callback) {
    // 拼接 schema 协议
    var schema = 'myapp://utils/' + action

    // 拼接参数，提前放一个 ?a=a 省的判断 ？ 还是 &
    schema += '?a=a'
    var key
    for (key in data) {
      // 防止是原型上的属性
      if (data.hasOwnProperty(key)) {
        schema += '&' + key + '=' + data[key]
      }
    }

    // 处理 callback
    var callbackName = ''
    if (typeof callbackName === 'string') {
      callbackName = callback
    } else {
      callbackName = action + Date.now()
      window[callbackName] = callback
    }
    schema += '&callback=' + callbackName

    // 触发
    var iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = schema
    var body = document.body
    body.appendChild(iframe)
    setTimeout(function() {
      body.removeChild(iframe)
      iframe = null
    })
  }

  // 暴露全局的变量
  window.invoke = {
    share: function(data, callback) {
      _invoek('share', data, callback)
    },
    scan: function(data, callback) {
      _invoek('scan', data, callback)
    },
    login: function(data, callback) {
      _invoek('login', data, callback)
    }
  }
})(window)
