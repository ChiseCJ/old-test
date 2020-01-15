// *web-worker 处理程序
// self.addEventListener('message',function(e){
//   console.log(e)
// })
console.log(self)
// *文件引用
self.importScripts('./city-data.js')
console.log(self.cityData)

self.onmessage = e => {
  console.log('w-', e.data)
}

// self.postMessage('-123-')
let res = handlerData(self.cityData)
self.postMessage({
  cityObj: res
})

function handlerData(list) {
  var provinceArr = []
  var cityArr = []
  var areaArr = []
  // 三级分离
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (item.levelType == 1) {
      provinceArr.push(item)
      // _cityData.push(item)
    } else if (item.levelType == 2) {
      cityArr.push(item)
    } else {
      areaArr.push(item)
    }
  }
  // arr -> obj
  var provinceObj = {}
  var cityObj = {}
  for (let i = 0; i < provinceArr.length; i++) {
    const item = provinceArr[i]
    provinceObj['p_' + item.id] = item
  }
  for (let i = 0; i < cityArr.length; i++) {
    const item = cityArr[i]
    cityObj['c_' + item.id] = item
  }
  // 区 -> 市
  for (let i = 0; i < areaArr.length; i++) {
    const item = areaArr[i]

    if (cityObj['c_' + item.parentId]) {
      if (cityObj['c_' + item.parentId].children) {
        cityObj['c_' + item.parentId].children.push(item)
      } else {
        cityObj['c_' + item.parentId].children = []
        cityObj['c_' + item.parentId].children.push(item)
      }
    }
  }
  // 市 -> 省
  for (let i = 0; i < cityArr.length; i++) {
    const item = cityArr[i]

    if (provinceObj['p_' + item.parentId]) {
      if (provinceObj['p_' + item.parentId].children) {
        provinceObj['p_' + item.parentId].children.push(cityObj['c_' + item.id])
      } else {
        provinceObj['p_' + item.parentId].children = []
        provinceObj['p_' + item.parentId].children.push(cityObj['c_' + item.id])
      }
    }
  }
  // 新构造的数据
  var _cityData = []
  for (const key in provinceObj) {
    if (provinceObj.hasOwnProperty(key)) {
      const item = provinceObj[key]
      _cityData.push(item)
    }
  }
  return _cityData
}

;(function() {
  fetch('https://douban.uieee.com/v2/movie/top250')
    .then(res => {
      return res.json()
    })
    .then(res => {
      console.log(res)
      self.postMessage(res)
    })
})()
