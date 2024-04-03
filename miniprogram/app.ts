// app.ts
App<IAppOption>({
  globalData: {
    // api_url:'http://localhost:5005/api',
    api_url:'https://kc.qianxingwl.com/api',
    userInfo:{}
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
  getDateName(e:any,name:any){
    return e.currentTarget.dataset[name]
  }
})