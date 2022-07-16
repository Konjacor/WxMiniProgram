// pages/video/video.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],//导航标签数据
    navId: '',//导航的标识
    videoList: [],//视频的列表数据
    videoContext: {},//video标签控制器
    vid: '',//视频id
    videoId: '',//视频标识，用在优化video标签步骤中
    videoUpdataTime: [],//记录video播放的时长
    isTriggered: false,//标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //获取导航数据
    this.getVideoGroupListData();
    // //获取视频列表数据,因为上面的调用是异步的，所以可能会导致数据还没获取到，下面的方法就进行了调用，会出现问题，所以应该把下面的操作放到上面的方法体中，以确保调用下面的方法时数据已经获取到了。
    // this.getVideoList(this.data.navId);
  },
  //跳转到音乐搜索界面
  toSearch(){
    wx.navigateTo({
      url: '../../pages/search/search',
    })
  },
  //获取导航数据
  async getVideoGroupListData() {
    let videoGroupListData = await request("/video/group/list");
    // console.log(videoGroupListData);
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0,14),//获取前14个数据
      navId: videoGroupListData.data[0].id,//获取数据后第一时间更新navId的默认值，使得刚进页面时有相关显示
    });
    //获取视频列表数据
    this.getVideoList(this.data.navId);
  },
  //获取视频列表数据
  async getVideoList(navId){
    if(!navId) return;
    let videoListData = await request("/video/group",{id:navId});
    //关闭消息提示框
    wx.hideLoading();
    //如果没有加载到数据，则关闭下拉刷新后直接return
    if(videoListData.code !== 200){
      this.setData({
        isTriggered: false,
      });
      return;
    }
    //加工数据使得后面的wx:key有东西写
    let index = 0;
    let videoList = videoListData.datas.map(item =>{
      item.id = index++;
      return item;
    });
    this.setData({//更新数据，关闭下拉刷新
      videoList,
      isTriggered:false,
    });
  },
  changeNav(event){//点击切换导航的回调函数
    let navId = event.currentTarget.id;//通过id向event传参的时候如果id是number，会被自动转换为string
    //let navId = event.currentTarget.dataset.id;//走dataset的话类型就不会被自动转换
    this.setData({
      navId: navId*1,//把string转换为number，方便之后用全等（===）来进行判断
      //navId: navId>>>0,//这样也能实现将string转换为number
      videoList: [],//清空当前视频数组内容，优化用户体验
    });
    //显示消息提示框
    wx.showLoading({
      title: '正在加载中...',
    })
    //动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId);
  },
  handlePlay(event){//点击播放/继续播放的回调函数，我们要实现同一时间只能有一个视频在播放的效果。
    /*
    问题：多个视频会同时播放
    需求：
      1、找到上一个播放的视频
      2、在播放新视频之前关闭上一个播放的视频
    关键：
      1、如何找到上一个视频的实例对象
      2、如何确认点击播放的视频和正在播放的视频不是同一个视频
    js单例模式：
      1、需要创建多个对象的场景下，通过一个变量接受，始终保持只有一个对象
      2、节省内存空间
    最终解决：
      蚌埠住了，实际上只需要让整个界面同时只有一个video即可，也就是说下面除了用图片代替视频的优化外的优化都可以删掉了，最后做的性能优化实际上就解决了这一点，因为整个页面全是图片，看着好像是全是视频，实际上全是图片，当点击图片时，video才会被加载进来，而且只会加载进来一个，这也是对单例模式的一种应用。
     */
      let vid = event.currentTarget.id;//获取当前视频id
      //关掉上一个视频
      // if(this.data.videoContext){
      //   this.data.videoContext.stop();
      // }
      this.data.vid !== vid && this.data.videoContext && this.data.videoContext.stop();//这样写更简便,vid是为了确认上一个视频不是当前视频
      //创建控制video标签的实例对象videoContext
      let videoContext = wx.createVideoContext(vid);
      //判断当前视频是否之前被播放过，如果有则跳转到之前播放到的位置，如果没有则从头播放。
      let {videoUpdataTime} = this.data;//解析数据，拿到videoUpdateTime
      videoItem = videoUpdataTime.find(item => item.vid === vid);//寻找当前视频之前是否被播放过
      if(videoItem){//如果当前视频之前被播放过
        videoContext.seek(videoItem.currentTime);//定位到之前播放到的位置,但是不会播放，需要再调用play方法来进行播放
      }
      videoContext.play();//开始播放
      this.setData({
        videoContext,
        vid,
        videoId: vid,//点击图片后将相关视频id更新到videoId中，方便在视图层用wx:if来找到对应的视频来显示。
      });
  },
  handleTimeUpdate(event){//监听视频播放进度的回调,通过记录当前视频的进度，来实现当从别的视频切换到该视频的时候，从之前的进度开始播放
    let videoTimeObj = {vid:event.currentTarget.id,currentTime:event.detail.currentTime};
    let {videoUpdataTime} = this.data;//js的解构语法，一般来讲在前面写上要结构的类型的标识符，比如对象就是大括号，列表就是中括号，字符串也是中括号，然后在里面写的变量都会被赋值为从后面的变量中解析出来的内容，中括号是按顺序解析，大括号是按照变量名称解析，比如这里就是将后面this.data中的videoUpdateTime解析到前面的同名变量中，接下来就可以操作前面大括号里声明的变量了，详细语法百度。
    /*思路：判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
    1、如果有，则更新时间
    2、如果没有，则push进一个新的播放进度的对象
    */
    let videoItem = videoUpdataTime.find(item => item.vid === videoTimeObj.vid);//用列表的find函数找之前有无当前视频的播放记录，find函数工作的原理是，每遍历到一个列表元素就跑一遍参数中给出的函数，如果返回值为true则代表已经找到指定元素，返回那个元素。注意这个地方videoItem是个对引用类型，因此拿到的是列表元素的地址。
    if(videoItem){//如果存在当前视频的播放记录则更新
      videoItem.currentTime = videoTimeObj.currentTime;//直接修改就好，因为videoItem是引用类型，和列表中的那个元素共享内存空间。
      // videoUpdataTime = videoUpdataTime.map(item => item.vid === videoItem.vid?videoItem:item);//更新videoUpdateTime中的相关内容。注意，直接上一步修改就好了，因为videoItem是引用类型，所以它和刚才找到的列表元素指向同一内存空间。
    }else{//如果当前视频没有播放记录，那就直接push进去
      videoUpdataTime.push(videoTimeObj);
    }
    this.setData({//更新videoUpdateTime的状态
      videoUpdataTime,
    });
  },
  handleEnded(){//视频播放结束的回调函数,为了让视频播放结束后，再次点击时从头开始播放，我们需要删除当前视频播放的播放时长记录
    //移除记录播放时长数组中当前视频的播放时长对象
    let {videoUpdataTime} = this.data;
    videoUpdataTime.splice(videoUpdataTime.findIndex(item => item.vid === this.data.vid),1);//只有两个参数的时候splice会删除原列表中的元素，第一个参数是要删除的起始元素，第二个参数是要删除几个元素。初次之外如果加上第三个类型参数，splice可以做到在原列表中插入元素等功能。
    this.setData({//别忘了删除后更新状态
      videoUpdataTime,
    });
  },
  handleRefresher(){//scroll-view自定义下拉刷新的回调函数
    this.getVideoList(this.data.navId);
  },
  handleToLower(){//上拉/左滑触底的回调函数
    //利用数据分页来做到下拉触底更新数据
    //数据分页：1、前端分页，发一次请求，在前端进行分页 2、后端分页，发多次请求，后端进行分页
    //用模拟数据先实现一下
    let newVideoList = [];//获取到的要追加的更新数据
    let videoList = this.data.videoList;//获取之前的数据
    videoList.push(...newVideoList);//在之前的数据中放入要追加的更新数据，三个点是js的展开语法，用来将对象或者是列表等东西进行展开，比如这里就是将newVideoList这个列表展开后一个个push进videoList中。
    this.setData({//更新数据
      videoList,
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
   * 需要在json中设置"enablePullDownRefresh": true才能正常使用。
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享，或者点击了类型为share的按钮
   */
  onShareAppMessage({from}) {//解构一下参数，得到从哪里调用的该方法
    if(from === 'button'){
      return {
        title: '来自button的转发内容',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvsheng.jpg',
      };
    }else{
      return {
        title: '来自menu的转发内容',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvsheng.jpg',
      };
    }
  },
})