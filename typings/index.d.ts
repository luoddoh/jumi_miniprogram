/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?:any,
    api_url?:any
  }
  getDateName:any,
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}