/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?:any,
    api_url?:any,
    power?:any
  }
  getDateName:any,
  debol_mul:any,
  Power:any,
  loadAudio:any,
  audio_repeat:any,
  audio_error:any,
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}