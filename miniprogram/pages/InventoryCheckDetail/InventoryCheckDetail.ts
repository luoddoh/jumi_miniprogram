import { ApiGet, ApiPost } from '../../utils/request'
const app = getApp();
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
      differencePrice: 0,
      oneCheckNum: 0
    },
    update_number: false
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
      update_number: app.Power('CheckChanges')
    })
    this.initData();
  },
  async initData() {
    let that = this;
    // ApiGet("/flcInventoryCheck/miniDetail", {
    //   id: that.data.id
    // }).then((res: any) => {
    //   if (res.code == 200) {
    //     that.setData({
    //       detailInfo: res.result
    //     })
    //   }
    // })
    // ApiGet("/flcInventoryCheckDetail/list", {
    //   CheckId: that.data.id
    // }).then((res: any) => {
    //   if (res.code == 200) {
    //     that.setData({
    //       table: res.result
    //     })
    //     that.RefreshTotal()
    //   }
    // })
    wx.showLoading({
      title:"数据加载中",
      mask:true
    })
    let info: any = await ApiGet("/flcInventoryCheck/miniDetail", {
      id: that.data.id
    })
    if (info.code == 200) {
      that.setData({
        detailInfo: info.result
      })
    }
    let list: any = await ApiGet("/flcInventoryCheckDetail/list", {
      CheckId: that.data.id
    })
    if (list.code == 200) {
      that.setData({
        table: list.result
      })
    }
    wx.hideLoading()
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
    let differencePrice = 0
    let oneCheckNum = 0
    data.forEach((item: any) => {
      inventoryNum += item.inventoryNum
      checkNum += item.checkNum
      oneCheckNum += item.oneCheckNum
      totalAmount = accAdd(totalAmount, item.totalAmount)
      differenceNum += item.differenceNum
      differencePrice = accAdd(differencePrice, item.differencePrice)
    })

    this.setData({
      Total: {
        inventoryNum,
        checkNum,
        totalAmount,
        differenceNum,
        differencePrice,
        oneCheckNum
      }
    })
  },
  onInputChange(e: any) {
    const name = app.getDateName(e, "name")
    const index = e.currentTarget.dataset.index
    let table: any = this.data.table
    table[index][name] = parseInt(e.detail.value)
    table[index].totalAmount = app.debol_mul(table[index].checkNum, table[index].price)
    this.setData({
      "table": table
    })
    this.RefreshTotal()
  },
  toInspection() {
    let table = this.data.table;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '请选择扫码方式！',
      cancelText: '摄像头',
      confirmText: '扫码枪',
      success: (res: any) => {
        if (res.confirm) {
          console.log('用户点击扫码枪')
          wx.navigateTo({
            url: '/pages/InventoryCheckCodeQiang/InventoryCheckCodeQiang',
            events: {
              // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
              acceptDataFromOpenedPage: function (data: any) {
                let table = data.data;
                that.daohuo(table)
                that.RefreshTotal();
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
            url: '/pages/InventoryCheckCode/InventoryCheckCode',
            events: {
              // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
              acceptDataFromOpenedPage: function (data: any) {
                let table = data.data;
                that.daohuo(table)
                that.RefreshTotal();
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
      title: '提示',
      content: '是否确定操作！',
      success(res) {
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
  daohuo(data: any) {
    let oring: any = this.data.table;
    let add_arr: any[] = [];
    for (let j = 0; j < data.length; j++) {
      let ele: any = data[j], now_ok: any = true;
      for (let i = 0; i < oring.length; i++) {
        let row: any = oring[i];
        if (row.skuId == ele.id) {
          now_ok = false;
          row.oneCheckNum = ele.scanCode.length
          row.oneCodeList = JSON.stringify(ele.scanCode)
          row.differenceNum = (row.checkNum + row.oneCheckNum) - row.inventoryNum
          row.differencePrice = row.differenceNum * row.price
        }
      }
      if (now_ok) {
        console.log(ele.scanCode.length)
        let obj = {
          skuId: ele.id,
          checkId: this.data.id,
          goodsName: ele.goodsName,
          skuImage: ele.skuImage,
          unitName: ele.unitName,
          inventoryNum: ele.inventoryNum,
          price: ele.price,
          checkNum: 0,
          oneCheckNum: ele.scanCode.length,
          oneCodeList: JSON.stringify(ele.scanCode),
          totalAmount: app.debol_mul(ele.scanCode.length, ele.price),
          differenceNum: ele.scanCode.length - ele.inventoryNum,
          differencePrice: app.debol_mul((ele.scanCode.length - ele.inventoryNum), ele.price),
          speValueList: ele.speValueList
        }
        add_arr.push(obj)
      }
    }
    if (add_arr != []) {
      oring = oring.concat(add_arr)
    }
    this.setData({
      table: oring
    })
  },
  save() {
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否确定操作！',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '保存中'
          })

          ApiPost('/flcInventoryCheckDetail/update_mini', that.data.table)
            .then((res: any) => {
              wx.hideLoading()
              if (res.code == 200) {
                wx.showToast({
                  title: '保存成功',
                  icon: 'success'
                })
                wx.navigateBack({
                  delta: 1
                })
              } else {
                wx.showToast({
                  title: '保存失败',
                  icon: 'error'
                })
              }
            })
            .catch(() => {
              wx.hideLoading()
              wx.showToast({
                title: '系统错误',
                icon: 'error'
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