// pages/songDetail/songDetail.js
import moment from 'moment'//用于处理日期时间格式化
import PubSub from 'pubsub-js'//实现页面之间通信的包，分消息的发布方和订阅方，订阅方接受消息，发布方发送消息。不仅要install相关的包，还要再构建一下npm后，引入后才能使用。
import request from '../../../utils/request'
//获取全局实例
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,//标识音乐是否在播放以控制摇杆起落
    song: {},//歌曲详情对象
    musicId: '',//歌曲id
    musicLink: '',//歌曲链接，记录下来是为了优化，以实现不用每次点击播放都发请求，如果musicLink中有值的话就不用发请求了，直接用就好了，这样做优化了小程序的性能。
    currentTime: '00:00',//当前播放的时长
    durationTime: '00:00',//歌曲总时长
    currentWidth: 0,//记录当前进度条应该的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {//option专门用于接收路由跳转的query参数
    //原生小程序中对路由传参的参数长度有限制，如果参数长度过长，会自动截取掉，所以如果json对象很长的话，会被截断，无法再转换为js对象。song的json对象太长，所以不能直接传过来，考虑可以先传个id过来，到这边来之后再利用这个id请求后端返回歌曲的详细信息。
    let musicId = options.musicId;
    this.setData({
      musicId,
    });
    this.getMusicInfo(musicId);
    /*
    问题：如果用户操作了系统的控制音乐播放/暂停的按钮，这种情况下页面是不知道要进行的操作的，导致页面显示的音乐播放/暂停的状态和实际上音乐播放/暂停的状态不一致。
    解决方案：
    1、通过控制音频的实例backgroundAudioManager去监视音乐播放/暂停
    */

    //利用全局变量判断当前页面的音乐是否正在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      //修改当前页面的音乐播放状态isPlay为true
      this.setData({
        isPlay: true,
      });
    }

   //创建控制音乐播放的实例对象，并将起绑定到this页面对象中。
   this.backgroundAudioManager = wx.getBackgroundAudioManager();
   //监视音乐播放/暂停(系统操作和页面操作都能监听到，覆盖范围比较广)
   this.backgroundAudioManager.onPlay(()=>{//音乐播放的监听
     //修改音乐为播放
     this.changePlayState(true);
     appInstance.globalData.musicId = musicId;
   });
   this.backgroundAudioManager.onPause(()=>{//音乐暂停的监听
     //修改音乐为暂停
     this.changePlayState(false);
   });
   this.backgroundAudioManager.onStop(()=>{//音乐停止的监听（就是直接叉掉了）
    //修改音乐为暂停
    this.changePlayState(false);
  });
  //监听音乐播放自然结束
  this.backgroundAudioManager.onEnded(()=>{
    //自动切换至下一首音乐并自动播放
    PubSub.publish('switchType','next');
    //将实时进度条的长度还原为0
    this.setData({
      currentWidth: 0,
      currentTime: '00:00',
    });
  });
  //监听音乐实时播放的进度
  this.backgroundAudioManager.onTimeUpdate(()=>{
    //格式化实时的播放时间
    let currentTime = moment(this.backgroundAudioManager.currentTime*1000).format('mm:ss');//由于moment中的参数单位是ms，而获取的currentTime的单位是s，所以要进行单位转换之后再使用。
    //计算实时的进度条宽度
    let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.durationTime*450;
    this.setData({currentTime,currentWidth});//更新播放时间状态
  });
  },
  //封装一个修改播放状态的功能函数
  changePlayState(isPlay){
    this.setData({
      isPlay,
     });
     //修改全局音乐播放的状态，这个是用来解决，关闭音乐详情界面后，isPlay被销毁，但是音乐还在播放，再次打开的时候由于isPlay是默认值false，因此和音乐播放的状态相反的类似这样的情况。
     appInstance.globalData.isMusicPlay = isPlay;
  },
  async getMusicInfo(musicId){//获取音乐详细信息的功能函数
    let songData = await request('/song/detail',{ids:musicId});
    //let durationTime = moment(songData.songs[0].dt).format('mm:ss');//格式化总时间，参数单位是ms，由于拉取不到数据，所以先随便写一个数据进行测试。
    let durationTime = moment(114514).format('mm:ss');//格式化总时间，参数单位是ms，由于拉取不到数据，所以先随便写一个数据进行测试。
    //this.setData({durationTime});
    if(songData.code === 200){
      this.setData({//更新数据
        song: songData.songs[0],
        durationTime,
      });
      wx.setNavigationBarTitle({//动态修改窗口标题为歌名
        title: this.data.song.name,
      });
    }else return;
  },
  async musicControl(isPlay,musicId,musicLink){//控制音乐播放/暂停的功能函数
    if(isPlay){//音乐播放
      if(!musicLink){//如果音乐播放链接不存在，就要发送新的请求。
        //获取音乐的播放链接
        let musicLinkData = await request('/song/url',{id:musicId});
        musicLink = musicLinkData.data[0].url;
        this.setData({
          musicLink,
        });
      }

      this.backgroundAudioManager.src = musicLink;//给backgroundAudioManager设置src属性，设置歌曲链接，设置后歌曲会自动播放，src默认为空串。
      this.backgroundAudioManager.title = this.data.song.name;//backgroundAudioManager的title属性也是必填的。

    }else{//音乐暂停
      this.backgroundAudioManager.pause();
    }
  },
  handleMusicPlay(){//点击播放按钮的回调函数
    let isPlay = !this.data.isPlay;
    // this.setData({
    //   isPlay,
    // });//在onLoad方法中已经设置了监听了，这个就不需要了
    let {musicId,musicLink} = this.data;
    this.musicControl(isPlay,musicId,musicLink);//控制音乐播放/暂停
  },
  handleSwitch(event){//点击切歌的回调
    //获取切歌的类型
    let type = event.currentTarget.id;

    //关闭当前播放的音乐
    this.backgroundAudioManager.stop();
    
    //订阅来自recommendSong页面发布的musicId消息，这个操作按理说只执行一次，但是如果把这个操作放到像这个可能调用多次的函数中也有解决方法，就是每次执行完相关操作后都进行一次取消订阅，这样做的原理是：每次订阅都会在底层给对应消息名后面的回调函数数组中添加回调函数，而每次取消订阅会删除对应消息名回调函数数组中的回调函数。当然还是最好放到只执行一次的函数中进行操作。
    PubSub.subscribe('musicId',(msg,musicId)=>{
      //获取音乐的详情信息并更新数据
      this.getMusicInfo(musicId);
      //自动播放当前的音乐
      this.musicControl(true,musicId);
      //取消订阅
      PubSub.unsubscribe('musicId');
    });
    //发布消息数据给recommendSong页面，第一个参数是想要发送给的事件名称，第二个参数是要发送的数据。
    PubSub.publish('switchType',type);
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