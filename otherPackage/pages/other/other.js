// pages/other/other.js
import request from '../../../utils/request';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    person: {
      username: 'curry',
      age: 33,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  //获取用户openId的回调
  handleGetOpenId(){
    //获取登录凭证
    wx.login({
      success: async (res)=>{
        let code = res.code;
        //将登录凭证发送给服务器
        let result = await request('/getOpenId',{code});
      },
    });
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