// pages/ProcureDetail/ProcureDetail.ts
import { ApiGet,ApiPost } from '../../utils/request'
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    detailInfo: {},
    table: [],
    Total: {
      inventoryNum: 0,
      purchaseNum: 0,
      totalAmount: 0,
      okNum: 0,
      OneOkNumber:0
    },
    update_number:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(e: any) {
    if (e.id) {
      this.setData({
        id: e.id
      })
    }
    this.setData({
      update_number:app.Power('InspectionChanges')
    })
    this.initData();
  },
  initData() {
    let that = this;
    ApiGet("/flcProcure/miniDetail", {
      id: that.data.id
    }).then((res: any) => {
      if (res.code == 200) {
        that.setData({
          detailInfo: res.result
        })
      }
    })
    ApiGet("/flcProcureDetail/list", {
      ProcureId: that.data.id
    }).then((res: any) => {
      if (res.code == 200) {
        that.setData({
          table: res.result
        })
        that.RefreshTotal()
      }
    })
  },
  RefreshTotal() {
    function accAdd(num1: any, num2: any) {
      var r1, r2, m;
      try { r1 = num1.toString().split(".")[1].length } catch (e) { r1 = 0 }
      try { r2 = num2.toString().split(".")[1].length } catch (e) { r2 = 0 }
      m = Math.pow(10, Math.max(r1, r2))
      return (num1 * m + num2 * m) / m
    }
    let data = this.data.table
    let inventoryNum = 0
    let purchaseNum = 0
    let totalAmount = 0
    let okNum = 0
    let OneOkNumber = 0
    data.forEach((item: any) => {
      inventoryNum += item.inventoryNum
      purchaseNum += item.purchaseNum
      totalAmount = accAdd(totalAmount, item.totalAmount)
      okNum += (item.okNum+(!item.OneOkNumber?0:item.OneOkNumber))
      OneOkNumber+=!item.OneOkNumber?0:item.OneOkNumber
    })

    this.setData({
      Total: {
        inventoryNum,
        purchaseNum,
        totalAmount,
        okNum,
        OneOkNumber
      }
    })
  },
  onInputChange(e: any) {
    const name=app.getDateName(e,"name")
    const index=e.currentTarget.dataset.index
    let table:any = this.data.table
    table[index][name]= parseInt(e.detail.value==''?0:e.detail.value)
    table[index].totalAmount=app.debol_mul(table[index].purchasePrice,table[index].purchaseNum)
    this.setData({
      "table": table
    })
    this.RefreshTotal()
  },
  toInspection() {
    let table = this.data.table;
    let that=this;
    wx.showModal({
      title:'提示',
      content:'请选择扫码方式！',
      cancelText:'摄像头',
      confirmText:'扫码枪',
      success:(res:any)=>{
        if (res.confirm) {
          console.log('用户点击扫码枪')
          wx.navigateTo({
            url: '/pages/ProcureInspectionQian/ProcureInspectionQian',
            events: {
              // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
              acceptDataFromOpenedPage: function (data: any) {
                let table=data.data;
                that.daohuo(table)
                that.RefreshTotal()
              },
            },
            success: function (res) {
              // 通过eventChannel向被打开页面传送数据
              res.eventChannel.emit('acceptDataFromOpenerPage', { data: table })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击摄像头')
          wx.navigateTo({
            url: '/pages/ProcureInspection/ProcureInspection',
            events: {
              // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
              acceptDataFromOpenedPage: function (data: any) {
                let table=data.data;
                that.daohuo(table)
                that.RefreshTotal()
              },
            },
            success: function (res) {
              // 通过eventChannel向被打开页面传送数据
              res.eventChannel.emit('acceptDataFromOpenerPage', { data: table })
            }
          })
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
  daohuo(data:any){
    let oring=this.data.table;
    oring.forEach((row:any)=>{
      data.forEach((ele:any)=>{
        if(row.id==ele.id){
          row.OneOkNumber=ele.scanCode.length
          row.oneCodeList=JSON.stringify(ele.scanCode) 
          row.ok_totalAmount=(row.OneOkNumber+row.okNum)*row.purchasePrice
          if(!row.oringnoNum){
            row.oringnoNum=row.noNum
          }
          row.noNum=row.oringnoNum-row.OneOkNumber<0?0:row.oringnoNum-row.OneOkNumber
        }
      })
    })
    this.setData({
      table:oring
    })
  },
  save(){
    let that=this
    wx.showModal({
      title:'提示',
      content:'是否确定操作！',
      success (res) {
        if (res.confirm) {
          wx.showLoading({
            title:'保存中'
          })
          ApiPost('/flcProcureDetail/inspection',that.data.table)
          .then((res:any)=>{
            wx.hideLoading()
            if(res.code==200){
              wx.showToast({
                title:'保存成功',
                icon:'success'
              })
              wx.navigateBack({
                delta:1
              })
            }else{
              wx.showToast({
                title:'保存失败',
                icon:'error'
              })
            }
          })
          .catch(()=>{
            wx.hideLoading()
            wx.showToast({
              title:'系统错误',
              icon:'error'
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
   
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