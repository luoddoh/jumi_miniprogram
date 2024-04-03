// index.ts
// 获取应用实例
import {LoginApi,ApiGet} from '../../utils/request'
const app = getApp<IAppOption>()

Component({
  data: {
    userInfo: {
      account:'',
      password:''
    },
    save_info:false
  },
  methods: {
    onLoad(){
      this.get_stor_userinfo()
    },
    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '/pages/logs/logs',
      })
    },
    get_stor_userinfo(){
      let that=this;
      wx.getStorage({
        key:'UserInfo',
        success(res:any){
          console.log(res)
          let data=JSON.parse(res.data);
          if(data){
            that.setData({
              userInfo:data,
              save_info:true
            })
          }
        }
      })
    },
    save_userinfo(){
      let info=JSON.stringify(this.data.userInfo) 
      wx.setStorage({
        key:'UserInfo',
        data:info
      })
    },
    remve_userinfo(){
      wx.removeStorage({
        key:'UserInfo'
      })
    },
    onInputChange(e: any) {
      const name=app.getDateName(e,"name")
      let user:{[key:string]:string} = this.data.userInfo
      user[name]=e.detail
      this.setData({
        "userInfo": user
      })
    },
    onSaveChange(e:any){
      this.setData({
        save_info:e.detail
      })
    },
    login(){
      wx.showLoading({
        title:'登录中'
      })
      let that=this;
      let userInfo=this.data.userInfo
      console.log(userInfo)
      LoginApi(userInfo.account,userInfo.password).then((res:any)=>{
        wx.hideLoading()
        if(res.code==200){
          if(that.data.save_info){
            that.save_userinfo();
          }else{
            that.remve_userinfo();
          }
          that.getUserInfo();
          wx.redirectTo({
            url:"/pages/home/home"
          })
        }
      })
    },
    getUserInfo(){
      ApiGet("/sysAuth/userInfo",{}).then((res:any)=>{
        if(res.code==200){
          app.globalData.userInfo=res.result
        }
      })
    }
  },
  
})
