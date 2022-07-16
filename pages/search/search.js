// pages/search/search.js
import request from '../../utils/request'
let isSend = false;//函数节流使用
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '',//placeholder的内容
    hotList: [],//热搜榜数据
    searchContent: '',//用户输入的表单项数据
    searchList: [],//关键字模糊匹配得到的数据
    historyList: [],//搜索历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //获取初始化数据
    this.getInitData();
    //获取历史记录数据
    this.getSearchHistory();
  },
  //获取初始化的数据
  async getInitData(){
    let placeholderData = await request('/search/default');
    let hotListData = await request('/search/hot/detail');
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList: hotListData.data,
    });
  },
  handleInputChange(event){
    this.setData({//更新用于模糊搜索的文本内容
      searchContent: event.detail.value.trim(),//trim方法用于去空格。
    });
    if(isSend){//如果还没到发请求的时候，就直接return出去
      return;
    }
    isSend = true;//到了发请求的时候了，设置isSend为true，使距离时间过近的函数调用不会发请求，用后面的定时器来决定下一次发请求的时间。

    //发请求进行模糊查询
    this.getSearchList();

    //函数节流
    setTimeout(() => {
      isSend = false;
    }, 300);//每隔300ms执行一次函数参数，每隔300ms将isSend设为false，代表又可以发请求进行模糊查询了，写这个计时器的时候注意不要重复开启多次，重复开启多次定时器会让性能下降。
  },
  //获取搜索数据的功能函数
  async getSearchList(){
    if(!this.data.searchContent){
      this.setData({//当搜索框为空时，将搜索数据置空以优化用户体验。
        searchList: [],
      });
      return;
    }
    let {searchContent,historyList} = this.data;
    //发请求获取关键字模糊匹配数据，为了提高性能，肯定不能每次改变文本都发一次请求，可以使用函数节流的方式来进行优化，这种优化方式可以使得每隔规定的时间再发请求，大大优化性能。还有个啥防抖，不是很懂。放到函数节流前面是为了能够第一次直接发请求，从第二次开始进行节流。为了避免这里的await，需要再将这一步骤进行封装。好像这里用防抖比较好，搜索框用防抖，上拉下拉刷新用节流。
    let searchListData = await request('/search',{keywords:searchContent,limit:10});
    this.setData({//更新模糊搜索结果
      searchList: searchListData.result.songs,
    });

    //将搜索的关键字添加到搜索历史记录中
    //如果当前关键字存在的话就先在历史记录中删掉当前的关键字，这样在后面unshift的时候能让当前关键字放到最前面。
    if(historyList.indexOf(searchContent) !== -1){//indexOf可以返回参数元素所在的下标，如果没找到返回-1
      historyList.splice(historyList.indexOf(searchContent),1);//未指定第三个功能参数时，splice的功能是删除，删除从下标处开始的第二个参数个数据。
    }
    historyList.unshift(searchContent);//将新项添加到数组的开头，并返回新的长度，这一操作会改变原数组的长度。
    this.setData({//更新状态，使得搜索记录可以即时显示完全。
      historyList,
    });
    //将历史记录存在本地
    wx.setStorageSync('searchHistory', historyList);
  },
  //获取本地缓存中历史记录数据的方法
  getSearchHistory(){
    let historyList = wx.getStorageSync('searchHistory');
    if(historyList){
      this.setData({//更新历史记录数据
        historyList,
      });
    }
  },
  //清空搜索内容
  clearSearchContent(){
    this.setData({
      searchContent: '',
      searchList: [],
    });
  },
  //删除搜索历史记录
  deleteSearchHistory(){
    //弹出提示信息
    wx.showModal({//显示模态对话框，模态框（Modal Dialog）指代中断用户操作，用户必须完成对话框内任务（或主动关闭对话框后）才能够继续主窗口操作的弹框。
      content: '确认删除吗？',
      success: (res)=>{//这个是模态对话框显示成功的回调，而非点击确认的回调,点击的信息包含在了参数中，res.confirm代表了按了什么按钮。
        if(res.confirm){//如果点击了确认
          //清空data中的historyList
          this.setData({
            historyList: [],
          });
          //移除本地的历史记录缓存
          wx.removeStorageSync('searchHistory');
        }
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