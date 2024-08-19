// app.ts
const audioCtx = wx.createWebAudioContext()
App<IAppOption>({
  globalData: {
    // api_url: 'http://localhost:5005/api',
    api_url:'https://kc.qianxingwl.com/api',

    // api_url:'http://116.62.114.131:8056/api',
    userInfo: {},
    power: [],

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
  getDateName(e: any, name: any) {
    return e.currentTarget.dataset[name]
  },
  debol_mul(arg1: any, arg2: any) {
    //解决小数相乘精度问题的方法
    let m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length;
    }
    catch (e) {
    }
    try {
      m += s2.split(".")[1].length;
    }
    catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
  },
  loadAudio(url:any) {
    // return new Promise((resolve,reject) => {
    //   wx.request({
    //     url,
    //     responseType: 'arraybuffer',
    //     success: res => {
    //       console.log('res.data', res.data)
    //       audioCtx.decodeAudioData((res.data, (buffer:any) => {
    //         resolve(buffer)
    //       }, err => {
    //         console.error('decodeAudioData fail', err)
    //         reject()
    //       })
    //     },
    //     fail: res => {
    //       console.error('request fail', res)
    //       reject()
    //     }
    //   })
    // })
  },
  audio_error(){
    //  this.loadAudio('https://kc.qianxingwl.com/Upload/audio/shibeichenggong.mp3').then((buffer:any)=>{
    //   let source = audioCtx.createBufferSource()
    //   source.buffer = buffer
    //   source.connect(audioCtx.destination)
    //   source.start()
    // })
  },
  audio_repeat(){
  //   this.loadAudio('https://kc.qianxingwl.com/Upload/audio/shibeichongfu.mp3').then((buffer:any)=>{
  //    let source = audioCtx.createBufferSource()
  //    source.buffer = buffer
  //    source.connect(audioCtx.destination)
  //    source.start()
  //  })
 },
  Power(code: any) {
    if (this.globalData.userInfo.id == 1300000000111 || this.globalData.userInfo.id == 1300000000101) {
      return true
    }
    let powerlist = this.globalData.power
    let index = powerlist.indexOf(code)
    console.log(powerlist,index)
    if (index == -1) {
      return false
    } else {
      return true
    }
  }
})