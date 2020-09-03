//app.js
App({
  globalData: {
    appid: '<%= appid%>',//appid
    secret: '<%= secret%>',//secret
    frameUrl:'http://m.<%= pathname%>/shop?companyId=3503',
    payBackFrameUrl:'https:/m.<%= pathname%>/shop/orderDetail?order_=',
    apiUrl:'http://api.<%= pathname%>',
    btiMapIrameUrl:'http://point.<%= pathname%>/',
  }
})
