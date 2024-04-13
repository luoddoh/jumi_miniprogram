// pages/ProcureInspection/ProcureInspection.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    table: [],
    oringDate: [],
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
        oringDate: data.data
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
  async successScan(e: any) {
    let table: any = this.data.table;
    let code = e.detail.result;
    console.log(code)
    if (code) {
      wx.showLoading({
        title: '处理中'
      })
      let code_row: any =await this.getRowInfo(code)
        if (code_row) {
          let push_ok:any=true;
          await this.getRowbool(code).then(res=>{
              push_ok=res
          })
          if(push_ok){
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
              scanEnabled: true
            })
            wx.showToast({
              title:'识别成功！',
              icon:'success',
              duration:500
            })
          }else{
            wx.hideLoading()
          }
          
        } else {
          wx.hideLoading()
          this.setData({
            scanEnabled: true
          })
          await this.module_error()
          // wx.showToast({
          //   title: '条码识别错误，请重试！',
          //   icon: 'none'
          // })
        }
    }
    setTimeout(()=>{
      this.call_scan()
    },800)
    
  },
  // async successScan(e: any) {
  //   if (this.data.scanEnabled) {
  //     this.setData({
  //       scanEnabled: false
  //     })
  //     let table: any = this.data.table;
  //     let code = e.detail.result;
  //     console.log(code)
  //     if (code) {
  //       wx.showLoading({
  //         title: '处理中'
  //       })
  //       setTimeout(async() => {
  //         let code_row: any = this.getRowInfo(code)
  //         if (code_row) {
  //           if (table.length > 0) {
  //             let index=-1;
  //             for (let i = 0; i < table.length; i++) {
  //               let row: any = table[i]
  //               if (code_row.id == row.id) {
  //                 index=i;
  //               }
  //             }
  //             if(index!=-1){
  //               let row: any = table[index]
  //               let add_scan = true
  //                 for (let j = 0; (j < row.scanCode.length && add_scan); j++) {
  //                   if (row.scanCode[j] == code) {
  //                     await this.module().then((res: any) => {
  //                       if (!res) {
  //                         add_scan = false
  //                       }
  //                     })
  //                   }
  //                 }
  //                 if (add_scan) {
  //                   row.scanCode.push(code)
  //                 }
  //             }else{
  //               code_row.scanCode = [code]
  //             table.push(code_row)
  //             }
  //           } else {
  //             code_row.scanCode = [code]
  //             table.push(code_row)
  //           }
  //           wx.hideLoading()
  //           this.setData({
  //             table: table,
  //             scanEnabled: true
  //           })

  //         } else {
  //           wx.hideLoading()
  //           this.setData({
  //             scanEnabled: true
  //           })
  //           wx.showToast({
  //             title: '条码识别错误，请重试！',
  //             icon: 'none'
  //           })
  //         }
  //       }, 1000)
  //     }
  //   }
  // },
  async module(text?:any) {
    return new Promise((resolve: any, reject: any) => {
      wx.showModal({
        title: '提示',
        content: text?text:'重复扫码是否确定添加？',
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
   getRowInfo(code: any) {
    let oring: any = this.data.oringDate;
    let add_item: any;
    let oring_ok = false
    for (let j = 0; (j < oring.length && !oring_ok); j++) {
      let barCodeList = JSON.parse(oring[j].barCodeList)
      let return_ok = false
      for (let i = 0; (i < barCodeList.length && !return_ok); i++) {
        if (barCodeList[i] == code) {
          add_item = oring[j];
          return_ok = true
        }
      }
    }
    return add_item
  },
  async getRowbool(code: any) {
    let that=this;
    let oring: any = this.data.oringDate;
    return new Promise(async (resolve: any, reject: any)=>{
      let result=true;
      let oring_ok = false
      for (let j = 0; (j < oring.length && !oring_ok); j++) {
        let OkCodeList = JSON.parse(oring[j].okCodeList)
        let show_ok=false
        if(OkCodeList){
          for (let i = 0; (i < OkCodeList.length && !show_ok); i++) {
            if (OkCodeList[i] == code) {
              await that.module("该条码已入库是否继续？").then(res=>{
                if(!res){
                  result=false
                }
              })
              show_ok = true
              oring_ok=true
            }
          }
        }
      }
      resolve(result)
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