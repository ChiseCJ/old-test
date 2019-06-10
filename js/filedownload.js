fetch('/tdm-web/media/job/export', {
  method: 'post',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'startTime=2019%2F06%2F01&endTime=2019%2F06%2F30'
})
  .then(res => {
    console.log(res.headers.get('Content-disposition'))

    return res.blob()
  })
  .then(res => {
    var a = document.createElement('a')
    var url = window.URL.createObjectURL(res)
    var filename = '\u963f\u65af\u987f\u53d1_20190606021714.xls'
    a.href = res
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  })
