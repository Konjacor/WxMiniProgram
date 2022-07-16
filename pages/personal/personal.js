// pages/personal/personal.js
//主要实现了手指拖动时部分页面跟着动的功能。

import request from "../../utils/request"

//定义变量用来处理手指移动的事件
let startY = 0;//手指的起始坐标
let moveY = 0;//手指移动后的坐标
let moveDistance = 0;//手指移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: "translateY(0)",//用于做位置变换
    coverTransition: "",//用于回弹时控制回弹速度
    userInfo: {},
    recentPlayList: [],
  },

  /**
   * 生命周期函数--监听页面加载   只执行一次，即页面加载时执行一次
   */
  onLoad(options) {//生命周期函数最好不要是async的，防止出现一些问题
    //读取用户的基本信息，放到onShow方法里会导致性能不佳，因为每次显示这个页面都要重新加载一遍信息
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo){
      this.setData({
        userInfo: JSON.parse(userInfo),//ES6的特性，同名参数赋值，等号及后面的内容可以省略不写,这里本来能用到这个特性的，但是因为本地存储中是json对象数据，想要转为js对象数据要用JSON.parse方法进行转换。
      });
      //获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId);
    }
  },
  //获取用户播放记录的方法
  async getUserRecentPlayList(userId){
    let recentPlayListData = await request("/user/record",{uid: userId,type:0});
    //手动为每一条数据添加唯一标识
    let index = 0;
    let recentPlayList = recentPlayListData.allData.slice(0,10).map(item => {
      item.id = index++;
      return item;
    });//用到了map方法，是指定对每个数组元素要做的操作，每个数组元素由item代替，记得最后返回item
    this.setData({
      recentPlayList//ES6特性，同名参数赋值可以省略等号及后面的内容
    });
  },
  handleTouchStart(event){//定义手指开始点击的行为
    this.setData({
      coverTransition: ""//防止滑动的时候套用下面设置的变换样式
    });
    startY = event.touches[0].clientY;
  },
  handleTouchMove(event){//定义手指开始点击后移动的行为
    moveY = event.touches[0].clientY;
    moveDistance = moveY - startY;//向上滑就是小于零，向下滑就是大于零
    if(moveDistance<=0) return;//防止向上滑动，要求是只能向下滑动到某个位置
    if(moveDistance>=80) moveDistance=80;
    //动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`,//用模板字符串，里面可以写变量
    });
    //console.log(moveDistance);
  },
  handleTouchEnd(){//定义手指结束点击的行为
    this.setData({
      coverTransform: "translateY(0rpx)",//回到原处
      coverTransition: "transform 0.2s linear"//0.2秒平滑变换到目标位置
    });
  },
  toLogin(){//点击头像后跳转至登录界面的回调函数
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成   只执行一次，页面初次渲染完成时执行一次
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示   可执行多次，每次页面显示的时候都会执行一次
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