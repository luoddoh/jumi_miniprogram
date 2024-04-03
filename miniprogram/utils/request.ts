import {weAtob} from './weapp-jwt.js'
// token 键定义
export const accessTokenKey = 'access-token';
export const refreshAccessTokenKey = `x-${accessTokenKey}`;
const app = getApp<IAppOption>()
 const sm=require('miniprogram-sm-crypto') 
// 获取 token
export const getToken = () => {
  return  wx.getStorageSync(accessTokenKey);
};
export const getRefreshToken = () => {
  return  wx.getStorageSync(refreshAccessTokenKey);
};
// 清除 token
export const clearAccessTokens = () => {
	clearTokens();

	// 刷新浏览器
	
};
// 清除 token
export const clearTokens = () => {
  wx.removeStorageSync(accessTokenKey)
  wx.removeStorageSync(refreshAccessTokenKey)
};
export const LoginApi=async (Account:any,Password:any)=>{
  const publicKey = `0484C7466D950E120E5ECE5DD85D0C90EAA85081A3A2BD7C57AE6DC822EFCCBD66620C67B0103FC8DD280E36C3B282977B722AAEC3C56518EDCEBAFB72C5A05312`;
   let	password = sm.sm2.doEncrypt(Password, publicKey, 1);
  return new Promise((resolve,reject)=>{
      wx.request({
        url:app.globalData.api_url+'/miniAppUser/login',
        data:{
          Account,
          Password:password
        },
        method:'POST',
        success(res:any){
          resolve(res.data)
          wx.setStorage({
            key:accessTokenKey,
            data:res.data.result.accessToken
          })
        },
        fail(err){
          reject(err)
        }
      })
  })
 
}
export const ApiPost=async (apiName:string,data:any)=>{
  const accessToken = getToken();
  // 判断 accessToken 是否过期
  const jwt: any = decryptJWT(accessToken);
  const exp = getJWTDate(jwt.exp as number);
  let obj={
    "Authorization":`Bearer ${accessToken}`,
    'X-Authorization':''
  }
  // token 已经过期
  if (new Date() >= exp) {
    // 获取刷新 token
    const refreshAccessToken:any = getRefreshToken();
    // 携带刷新 token
    if (refreshAccessToken) {
      obj['X-Authorization']=`Bearer ${refreshAccessToken}`
    }
  }
  return new Promise((resolve,reject)=>{
      wx.request({
        url:app.globalData.api_url+apiName,
        data,
        header:obj,
        method:'POST',
        success(res:any){
          resolve(res.data)
        },
        fail(err){
          reject(err)
        }
      })
  })
 
}
export const ApiGet=async (apiName:string,data:any)=>{
  const accessToken = getToken();
  // 判断 accessToken 是否过期
  const jwt: any = decryptJWT(accessToken);
  const exp = getJWTDate(jwt.exp as number);
  let obj={
    "Authorization":`Bearer ${accessToken}`,
    'X-Authorization':''
  }
  // token 已经过期
  if (new Date() >= exp) {
    // 获取刷新 token
    const refreshAccessToken:any = getRefreshToken();
    // 携带刷新 token
    if (refreshAccessToken) {
      obj['X-Authorization']=`Bearer ${refreshAccessToken}`
    }
  }
  return new Promise((resolve,reject)=>{
      wx.request({
        url:app.globalData.api_url+apiName,
        data,
        header:obj,
        method:'GET',
        success(res:any){
          resolve(res.data)
        },
        fail(err){
          reject(err)
        }
      })
  })
 
}

/**
 * 解密 JWT token 的信息
 * @param token jwt token 字符串
 * @returns <any>object
 */
export function decryptJWT(token: string): any {
  token = token.replace(/_/g, '/').replace(/-/g, '+');
  var json = decodeURIComponent(escape(weAtob(token.split('.')[1])));
	return JSON.parse(json);
}

/**
 * 将 JWT 时间戳转换成 Date
 * @description 主要针对 `exp`，`iat`，`nbf`
 * @param timestamp 时间戳
 * @returns Date 对象
 */
export function getJWTDate(timestamp: number): Date {
	return new Date(timestamp * 1000);
}