//app.js
App({
  globalData: {
    appid: '<%= appid%>',//appid
    secret: '<%= secret%>',//secret
    frameUrl:'<%= pathname%>/shop?companyId=<%= companyId%>',
    payBackFrameUrl:'<%= pathname%>/shop/orderDetail?order_=',
    apiUrl:'<%= apiPathname%>',
    btiMapIrameUrl:'<%= pointPathname%>/',
  }
})
