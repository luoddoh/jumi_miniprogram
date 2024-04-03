// pages/InventoryOutDetail/InventoryOutDetail.ts
import { ApiGet,ApiPost } from '../../utils/request'
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
      outNum: 0,
      totalAmount: 0,
    }
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
    this.initData();
  },
  initData() {
    let that = this;
    ApiGet("/flcInventoryOut/miniDetail", {
      id: that.data.id
    }).then((res: any) => {
      if (res.code == 200) {
        that.setData({
          detailInfo: res.result
        })
      }
    })
    ApiGet("/flcInventoryOutDetail/list", {
      OutId: that.data.id
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
    let outNum = 0
    let totalAmount = 0
    data.forEach((item: any) => {
      inventoryNum += item.inventoryNum
      outNum += item.outNum
      totalAmount = accAdd(totalAmount, item.totalAmount)
    })

    this.setData({
      Total: {
        inventoryNum,
        outNum,
        totalAmount,
      }
    })
  },
  toInspection() {
    let table = this.data.table;
    let that=this;
    wx.navigateTo({
      url: '/pages/InventoryOutCode/InventoryOutCode',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function (data: any) {
          let table=data.data;
          that.daohuo(table)
        },
      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: table })
      }
    })
  },
  back() {
    wx.navigateBack({
      delta: 1
    })
  },
  daohuo(data:any){
    let oring=this.data.table;
    oring.forEach((row:any)=>{
      data.forEach((ele:any)=>{
        if(row.id==ele.id){
          row.outNum=ele.scanCode.length
          row.totalAmount=row.outNum*row.price
        }
      })
    })
    this.setData({
      table:oring
    })
  },
  save(){
    wx.showLoading({
      title:'保存中'
    })
    let that=this
    ApiPost('/flcInventoryOutDetail/update',that.data.table)
    .then((res:any)=>{
      wx.hideLoading()
      if(res.code==200){
        wx.showToast({
          title:'保存成功',
          icon:'success'
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