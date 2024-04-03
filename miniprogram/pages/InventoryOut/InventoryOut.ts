// pages/InventoryOut/InventoryOut.ts
import {ApiPost} from '../../utils/request'
import timeFormat from '../../utils/formatDate'
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oringTime:'2024-01-01 00:00',
    endTime:'2024-04-07 00:00',
    radio:'0',
    search:'',
    procureDate:[],
    DateShow:false,
    empty:false,
    push_bool:true,
    page:1,
    pageSize:10,
    search_bool:false,


    minDate: '',
    maxDate: '',
    currentDate: new Date().getTime(),
    checkDateName:'',
  },
  onChange(e:any){
    this.setData({
      radio:e.detail,
      page:1,
      push_bool:true,
      procureDate:[]
    })
    this.handleQuery()
  },
  search(){
    this.setData({
      search_bool:true
    })
    this.handleQuery();
  },
  handleQuery(){
    let that=this;
    ApiPost("/flcInventoryOut/miniPage",{
      OutTimeRange:[
        that.data.oringTime,
        that.data.endTime
      ],
      state:that.data.radio,
      searchKey:that.data.search,
      page:that.data.page,
      pageSize:that.data.pageSize,
      uid:app.globalData.userInfo.id
    }).then((res:any)=>{
      if(res.code==200){
        let data=that.data.procureDate;
        if(!this.data.search_bool){
          data=data.concat(res.result.items)
        }else{
          data=res.result.items
        }
        that.setData({
          procureDate:data,
          search_bool:false
        })
        if(res.result.items.length<=0){
          that.setData({
            push_bool:false
          })
        }
        if(!that.data.procureDate){
          that.setData({
            empty:true
          })
        }
      }else{
        that.setData({
          empty:true
        })
      }
    })
  },
  tolower(){
    if(this.data.push_bool){
      this.setData({
        page:this.data.page+1
      })
      this.handleQuery()
    }
  },
  checkDate(e:any){
    let name=app.getDateName(e,"name")
    this.setData({
      DateShow:true,
      checkDateName:name
    })
  },
  onClose(){
    this.setData({
      DateShow:false
    })
  },
  onInput(event:any) {
    this.setData({
      currentDate: event.detail,
    });
    if(this.data.checkDateName=="oringTime"){
      this.setData({
        oringTime:timeFormat.timeFormat(event.detail)
      })
    }else if(this.data.checkDateName=="endTime"){
      this.setData({
        endTime:timeFormat.timeFormat(event.detail)
      })
    }
  },
  cancel_picker(){
    this.setData({
      DateShow:false
    })
  },
  toDetail(e:any){
    console.log(e)
    let id=app.getDateName(e,"id")
    wx.navigateTo({
      url:'/pages/InventoryOutDetail/InventoryOutDetail?id='+id
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({
      endTime:timeFormat.timeFormat(new Date)
    })
    this.handleQuery()
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