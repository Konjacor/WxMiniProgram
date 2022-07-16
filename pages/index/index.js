// pages/index/index.js
import request from "../../utils/request"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],//轮播图数据
    recommendList: [],//推荐歌单数据
    topList: [],//排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    // wx.request({
    //   url: 'http://localhost:3000/banner',
    //   data: {type: 2},
    //   success: (res)=>{
    //     console.log("请求成功：",res);
    //   },
    //   fail: (err)=>{
    //     console.log("请求失败:",err);
    //   }
    // })
    //获取轮播图数据
    let bannerListData = await request('/banner',{type:2});//type不同，返回的数据里面属性的名称有所不同,第二个参数是url后面加问号后面的参数
    this.setData({
      bannerList: bannerListData.banners
    })
    //获取推荐歌单数据
    let recommendListData = await request("/personalized",{limit:10});
    this.setData({
      recommendList: recommendListData.result
    })
    //获取排行榜数据
    let topListData = [];
    for(var i=0;i<=4;++i){
      let result;
      result=await request("/top/list",{idx:i});
      //console.log(result);
      topListData.push({
        name:result.playlist.name,
        tracks:result.playlist.tracks.slice(0,3)//切割列表,用这个方法不会对原数据产生影响
      });//push方法用于向列表中添加元素
      this.setData({
        topList: topListData
      })
    }
    // console.log(topListData);
    //不建议获取完所有数据后再更新数据，因为这样会导致长时间的白屏，用户体验并不好，最好是每次获取完信息都进行一次更新，优化用户体验；但是这样做又会导致渲染次数变多，性能会变差，因此还是要具体情况具体分析做好取舍。
    // this.setData({
    //   bannerList: bannerListData.banners,
    //   recommendList: recommendListData.result,
    //   topList: topListData,
    // })
  },
  //跳转至recommendSong页面的回调
  toRecommendSong(){
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong',
    });
  },
  //跳转至other模板测试及登录认证页面
  toOther(){
    wx.navigateTo({
      url: '/otherPackage/pages/other/other',
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