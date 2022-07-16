// app.js
App({//注册整个小程序，有些全局变量可以放到这里，用getApp()方法可以获取到小程序的实例，从而访问其中的方法和数据
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {//全局数据，某个页面销毁时不想销毁的数据可以放到这里，放到缓存也可以。除非整个小程序重新加载，不然这里面的全局数据不会被销毁。
    userInfo: null,
    //下面两个变量是用来解决，关闭音乐详情界面后，isPlay被销毁，但是音乐还在播放，再次打开的时候由于isPlay是默认值false，因此和音乐播放的状态相反的情况。所以考虑把音乐播放的状态变量放到全局，就不会随着音乐详情页面的销毁而销毁了。
    isMusicPlay: false,//是否有音乐在播放
    musicId: '',//正在播放音乐的id
  }
})
