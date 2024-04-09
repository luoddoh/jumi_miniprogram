/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?:any,
    api_url?:any
  }
  getDateName:any,
  debol_mul:any,
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}