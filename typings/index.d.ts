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
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}