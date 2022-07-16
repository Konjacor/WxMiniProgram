// pages/recommendSong/recommendSong.js
import PubSub from 'pubsub-js'//实现页面之间通信的包，分消息的发布方和订阅方，订阅方接受消息，发布方发送消息。不仅要install相关的包，还要再构建一下npm后，引入后才能使用。
import request from '../../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '',//日期
    month: '',//月份
    recommendList: [],//推荐列表数据
    index: 0,//点击的音乐在列表数据中的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo');
    if(!userInfo){//如果没登录
      wx.showToast({//弹出提示框
        title: '请先登录',
        icon: 'none',
        success: ()=>{
          //跳转至登录界面
          wx.reLaunch({
            url: '/pages/login/login.js',
          })
        },
      });
    }
    //更新日期的状态数据
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
    });
    //获取每日推荐的数据
    this.getRecommendList();
    //订阅来自songDetail页面发布的消息,第一个参数是自定义的事件名称，第二个是事件回调。一般来说一个消息只订阅一次，不然会有重复的回调。
    PubSub.subscribe('switchType',(msg,type)=>{//回调函数第一个参数是消息名称，第二个参数是发送过来的消息。
      let {recommendList,index} = this.data;//获得歌曲数组和当前点击歌曲在列表中的下标
      //注意处理边界情况
      if(type === 'pre'){//上一首
        (index === 0) && (index = recommendList.length);//加小括号避免歧义，这个语法很有意思，以后可以常用，可以一定程度上代替if语句。
        index--;
      }else{//下一首
        index++;
        (index === recommendList.length) && (index = 0);
      }

      //更新下标
      this.setData({
        index,
      });

      let musicId = recommendList[index].id;//获取上一首或下一首歌曲的id
      //回传musicId给songDetail页面
      PubSub.publish('musicId',musicId);
    });
  },
  //获取用户每日推荐的数据
  async getRecommendList(){
    let recommendListData = await request('/recommend/songs');
    this.setData({
      recommendList: recommendListData.recommend,
    });
  },
  toSongDetail(event){
    let index = event.currentTarget.dataset.index;//取出当前歌曲在列表中的下标，方便之后进行切歌操作
    let song = event.currentTarget.dataset.song;//id可以在currentTarget后面直接取，但是别的需要在dataset中取。
    //路由跳转传参：query参数（在url后面写问号传参）
    this.setData({
      index,
    });
    wx.navigateTo({
      //url: '/pages/songDetail/songDetail?song='+JSON.stringify(song),//注意这里，query参数是不能出现js对象的，如果传了js对象，那么会自动调用toString方法，如果没有重写，那么调用的就是Object类中的toString方法，这样传过去的参数就是一个列表字符串，里面每个元素是对应元素的类型，这样的数据根本没法使用，因此query参数应该用json格式传。但是这里json对象太长了，小程序对路由传参的长度有限制，所以不能直接这样传，考虑只传过去id，到那边之后再用id请求后端返回歌曲详情。
      url: '/pages/songDetail/songDetail?musicId='+song.id,
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