// pages/InventoryOutCode/InventoryOutCode.ts
import { ApiGet } from "../../utils/request";
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    table: [],
    oringDate:[],
    scanEnabled: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let that = this;
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      that.setData({
        oringDate:data.data
      })
    })
    that.call_scan()
  },
  call_scan(){
    let that=this;
    wx.scanCode({
      onlyFromCamera:true,
      scanType:['barCode'],
      success(res){
        let obj={
          detail:{
            result:res.result
          }
        }
        that.successScan(obj)
      }
    })
  },
  JudgeRepeat(code:any){
    let data:any=this.data.oringDate
    for(let i=0;i<data.length;i++){
      if(data[i].okCodeList&&data[i].okCodeList.includes(code)){
        return true
      }
    }
    return false
  },
  async successScan(e: any) {
    let table: any = this.data.table;
      let code = e.detail.result;
      console.log(code)
      if (code&&code.length>14) {
        wx.showLoading({
          title: '处理中'
        })
        let code_row: any =''
        console.log('获取前：'+code_row)
          await this.getRowInfo(code).then(res=>{
            code_row=res
          })
          console.log('获取后：'+code_row)
          if (code_row!='') {
            if (table.length > 0) {
              let index=-1;
              for (let i = 0; i < table.length; i++) {
                let row: any = table[i]
                if (code_row.id == row.id) {
                  index=i;
                }
              }
              if(index!=-1){
                let row: any = table[index]
                let add_scan = true;
                let break_ok=true;
                  for (let j = 0; (j < row.scanCode.length &&break_ok); j++) {
                    if (row.scanCode[j] == code||this.JudgeRepeat(code)) {
                      break_ok=false
                      await this.module().then((res: any) => {
                        if (!res) {
                          add_scan = false
                        }
                      })
                    }
                  }
                  if (add_scan) {
                    row.scanCode.push(code)
                  }
              }else{
                let add_scan=true
                if(this.JudgeRepeat(code)){
                  await this.module().then((res: any) => {
                    if (!res) {
                      add_scan = false
                    }
                  })
                }
                if(add_scan){
                  code_row.scanCode = [code]
                  table.push(code_row)
                }
              }
            } else {
              let add_scan=true
                if(this.JudgeRepeat(code)){
                  await this.module().then((res: any) => {
                    if (!res) {
                      add_scan = false
                    }
                  })
                }
                if(add_scan){
                  code_row.scanCode = [code]
                  table.push(code_row)
                }
            }
            wx.hideLoading()
            this.setData({
              table: table,
            })
            wx.showToast({
              title:'条码识别成功！',
              icon:'success',
              duration:300
            })
          } else {
            wx.hideLoading()
          }
      }else{
        await this.module_error();
      }
      setTimeout(()=>{
        this.call_scan()
      },1000)
  },
  async module() {
    return new Promise((resolve: any, reject: any) => {
      app.audio_repeat()
      if(app.Power('InputCodes')){
        wx.showModal({
          title: '提示',
          content: '重复扫码是否确定添加？',
          success(res: any) {
            if (res.confirm) {
              resolve(true)
            }
            if (res.cancel) {
              resolve(false)
            }
          }
        })
      }else{
        wx.showModal({
          title: '提示',
          showCancel:false,
          content: '重复扫码不予添加！',
          confirmText:'取消',
          confirmColor:'#000000',
          success(res: any) {
            if (res.confirm) {
              resolve(false)
            }
            if (res.cancel) {
              resolve(false)
            }
          }
        })
      }
      
    })
  },
  async module_error() {
    return new Promise((resolve: any, reject: any) => {
      app.audio_error()
      wx.showModal({
        title: '提示',
        content: '条码识别错误，请重试！',
        showCancel:false,
        success(res: any) {
          if (res.confirm) {
            resolve(true)
          }
        }
      })
    })
  },
  async getRowInfo(code: any) {
    let that=this;
    return new Promise((resolve: any, reject: any) => {
      ApiGet("/flcProcureDetail/barCodeInfoDetail",{
        code
      }).then(async (res:any)=>{
        if(res.code==200&&res.result){
          resolve(res.result)
        }else{
          await that.module_error();
          resolve('')
        }
      })
    })
  },
  clearData() {
    let that=this;
    wx.showModal({
      title:'提示',
      content:'是否确定操作！',
      success (res) {
        if (res.confirm) {
          that.setData({
            table: []
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },
  back() {
    wx.showModal({
      title:'提示',
      content:'是否确定操作！',
      success (res) {
        if (res.confirm) {
          wx.navigateBack({
            delta: 1
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  ok() {
    let that = this;
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('acceptDataFromOpenedPage', { data: that.data.table });
    this.back()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})