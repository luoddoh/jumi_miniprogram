import { ApiGet } from "../../utils/request";

// pages/InventoryCheckCode/InventoryCheckCode.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    table: [],
    scanEnabled: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let that = this;
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      
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
  async successScan(e: any) {
    let table: any = this.data.table;
      let code = e.detail.result;
      console.log(code)
      if (code) {
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
                let add_scan = true
                  for (let j = 0; (j < row.scanCode.length && add_scan); j++) {
                    if (row.scanCode[j] == code) {
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
                code_row.scanCode = [code]
              table.push(code_row)
              }
            } else {
              code_row.scanCode = [code]
              table.push(code_row)
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
      }
      setTimeout(()=>{
        this.call_scan()
      },1000)
  },
  async module() {
    return new Promise((resolve: any, reject: any) => {
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
    })
  },
  async module_error() {
    return new Promise((resolve: any, reject: any) => {
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
  async module_code() {
    return new Promise((resolve: any, reject: any) => {
      wx.showModal({
        title: '提示',
        content: '当前订货单未完全入库，是否确定添加？',
        success(res: any) {
          if (res.confirm) {
            resolve(true)
          }
          if (res.cancel) {
            resolve(false)
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
          if(res.result.okNum<res.result.purchaseNum){
            let ok=await that.module_code()
            if(ok){
              resolve(res.result)
            }else{
              resolve('')
            }
          }else{
            resolve(res.result)
          }
        }else{
          await that.module_error();
          resolve('')
        }
      })
    })
  },
  clearData() {
    this.setData({
      table: []
    })
  },
  back() {
    wx.navigateBack({
      delta: 1
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