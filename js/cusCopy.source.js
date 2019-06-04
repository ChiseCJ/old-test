/**
 * * 190304
 * * 190520 添加点击 mask 钩子
 * * 190604 添加 mask flag
 */
;(function(window) {
  // 获取 url param
  function requestParam(strName) {
    var strHref = location.search
    var intPos = strHref.indexOf('?')
    if (intPos === -1) {
      return ''
    }
    var strRight = strHref.substr(intPos + 1)
    var arrTmp = strRight.split('&')
    for (var i = 0; i < arrTmp.length; i++) {
      var arrTemp = arrTmp[i].split('=')
      if (arrTemp[0].toUpperCase() == strName.toUpperCase()) {
        if (i === arrTmp.length - 1) {
          var sIndex = arrTemp[1].indexOf('#')
          if (sIndex !== -1) {
            arrTemp[1] = arrTemp[1].substring(0, sIndex)
          }
        }
        return arrTemp[1]
      }
    }
    return ''
  }
  // 执行 copy
  function copyText(action) {
    var succeeded

    try {
      succeeded = document.execCommand(action)
    } catch (err) {
      console.log(succeeded)
    }
    return succeeded
  }

  // 选中 elem 的内容，并返回选中的内容
  function select(element) {
    var selectedText

    if (element.nodeName === 'SELECT') {
      element.focus()

      selectedText = element.value
    } else if (
      element.nodeName === 'INPUT' ||
      element.nodeName === 'TEXTAREA'
    ) {
      var isReadOnly = element.hasAttribute('readonly')

      if (!isReadOnly) {
        element.setAttribute('readonly', '')
      }

      element.select()
      element.setSelectionRange(0, element.value.length)

      if (!isReadOnly) {
        element.removeAttribute('readonly')
      }

      selectedText = element.value
    } else {
      if (element.hasAttribute('contenteditable')) {
        element.focus()
      }

      var selection = window.getSelection()
      var range = document.createRange()

      range.selectNodeContents(element)
      selection.removeAllRanges()
      selection.addRange(range)

      selectedText = selection.toString()
    }

    return selectedText
  }

  // 创建用于 copy 的元素，并填入内容
  function selectFack(text) {
    var isRTL = document.documentElement.getAttribute('dir') == 'rtl'
    // create dom
    var fakeElem = document.createElement('textarea')
    fakeElem.style.fontSize = '12pt'

    fakeElem.style.border = '0'
    fakeElem.style.padding = '0'
    fakeElem.style.margin = '0'
    // Move element out of screen horizontally
    fakeElem.style.position = 'absolute'
    fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px'
    // Move element to the same position vertically
    var yPosition = window.pageYOffset || document.documentElement.scrollTop
    fakeElem.style.top = yPosition + 'px'

    fakeElem.setAttribute('readonly', '')
    fakeElem.value = text
    // append
    document.getElementsByTagName('body')[0].appendChild(fakeElem)

    // 调用 select
    select(fakeElem)
    var res_ = ''
    if (document.queryCommandSupported('copy')) {
      // 调用 copy 命令
      res_ = copyText('copy')
    } else {
      res_ = false
    }
    return res_
  }

  // 创建 mask 并绑定事件
  function createDOMBindEvent(text) {
    // doc event
    var elem = document.createElement('div')
    elem.style.position = 'fixed'
    elem.style.top = 0
    elem.style.left = 0
    elem.style.bottom = 0
    elem.style.width = '100%'
    elem.style.zIndex = 2345
    elem.style.webkitTapHighlightColor = 'transparent'
    // elem.style.backgroundColor = '#eee';
    elem.addEventListener('click', function() {
      var result = selectFack(text)
      if (result) {
        window.cusCopySucc && window.cusCopySucc()
      }
      if (!requestParam('mflag')) {
        document.getElementsByTagName('body')[0].removeChild(elem)
      }
      elem = null
    })
    document.getElementsByTagName('body')[0].appendChild(elem)
  }

  window.createDOMBindEvent = createDOMBindEvent

  // ajax
  // fetch('//libaiapi.mtcop.com/random')
  //   .then(function(result) {
  //     return result.text()
  //   })
  //   .then(function(result) {
  //     // todo 文本内容
  //     createDOMBindEvent(result);
  //   })
  //   .catch(function(err) {
  //     console.dir(err)
  //   })
})(window)
