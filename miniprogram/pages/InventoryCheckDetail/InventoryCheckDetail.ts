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
      checkNum: 0,
      totalAmount: 0,
      differenceNum: 0,
      differencePrice: 0
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
    ApiGet("/flcInventoryCheck/miniDetail", {
      id: that.data.id
    }).then((res: any) => {
      if (res.code == 200) {
        that.setData({
          detailInfo: res.result
        })
      }
    })
    ApiGet("/flcInventoryCheckDetail/list", {
      CheckId: that.data.id
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
    let checkNum = 0
    let totalAmount = 0
    let differenceNum = 0
    let differencePrice=0
    data.forEach((item: any) => {
      inventoryNum += item.inventoryNum
      checkNum += item.checkNum
      totalAmount = accAdd(totalAmount, item.totalAmount)
      differenceNum += item.differenceNum
      differencePrice=accAdd(differencePrice, item.differencePrice)
    })

    this.setData({
      Total: {
        inventoryNum,
        checkNum,
        totalAmount,
        differenceNum,
        differencePrice
      }
    })
  },
  onInputChange(e: any) {
    const name=app.getDateName(e,"name")
    const index=e.currentTarget.dataset.index
    let table:any = this.data.table
    table[index][name]=parseInt(e.detail.value)
    table[index].totalAmount=app.debol_mul(table[index].checkNum,table[index].price)
    this.setData({
      "table": table
    })
    this.RefreshTotal()
  },
  toInspection() {
    let table = this.data.table;
    let that=this;
    wx.navigateTo({
      url: '/pages/InventoryCheckCode/InventoryCheckCode',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function (data: any) {
          let table=data.data;
          that.daohuo(table)
          that.RefreshTotal();
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
    let oring:any=this.data.table;
    let add_arr:any[]=[];
    for(let j=0;j<data.length;j++){
      let ele:any=data[j],now_ok:any=true;
      for(let i=0;i<oring.length;i++){
        let row:any=oring[i];
        if(row.skuId==ele.id){
          now_ok=false;
          row.checkNum=ele.scanCode.length
          row.totalAmount=row.checkNum*row.price
          row.differenceNum=row.checkNum-row.inventoryNum
          row.differencePrice=row.differenceNum*row.price
        }
      }
      if(now_ok){
        console.log(ele.scanCode.length)
        let obj={
          skuId:ele.id,
          checkId:this.data.id,
          goodsName:ele.goodsName,
          skuImage:ele.skuImage,
          unitName:ele.unitName,
          inventoryNum:ele.inventoryNum,
          price:ele.price,
          checkNum:ele.scanCode.length,
          totalAmount:app.debol_mul(ele.scanCode.length,ele.price),
          differenceNum:ele.scanCode.length-ele.inventoryNum,
          differencePrice:app.debol_mul((ele.scanCode.length-ele.inventoryNum),ele.price),
          speValueList:ele.speValueList
        }
        add_arr.push(obj)
      }
    }
    if(add_arr!=[]){
      oring=oring.concat(add_arr)
    }
    this.setData({
      table:oring
    })
  },
  save(){
    wx.showLoading({
      title:'保存中'
    })
    let that=this
    ApiPost('/flcInventoryCheckDetail/update',that.data.table)
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