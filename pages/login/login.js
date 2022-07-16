// pages/login/login.js
import request from "../../utils/request"//引入发送请求的方法
//主要实现登录功能
/*
  登录流程：
    1、收集表单项数据
    2、前端验证（用户信息是否合法），通过了再发请求给后端
    3、后端验证（用户是否存在，用户密码是否正确），反馈相关信息给前端
*/
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',//收集手机号信息
    password: ''//收集密码信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  handleInput(event){//表单项内容发生改变的回调函数,讲了讲js事件委托,相当于手动实现了数据的双向绑定
    let type = event.currentTarget.id;//取到事件调用者的类型
    this.setData({
      [type]: event.detail.value,//这个语法有点意思，根据type的值来灵活给对应的属性赋值，在对象里面操作属性的变量，要加中括号。
    });
    //console.log(this.data.phone,this.data.password);
  },
  async login(){//要设置成异步方法，因为后面要发请求接收数据
    //收集表单项数据
    let {phone,password} = this.data;
    //前端验证 手机号：1、为空2、格式不正确3、格式正确
    if(!phone){//手机号判空
      //提示用户,由于环境不是windows因此没有windows的全局对象，不能用windows提供的alert，全局对象是wx，所以要用wx的api来实现相应功能。
      wx.showToast({//是个异步方法，但是我们需要同步，因此最好是在调用完异步方法后直接return，防止在调用异步方法时后面的代码执行。
        title: '手机号不能为空！',
        icon: 'none'
      });
      return;
    }
    //判断手机号格式是否正确，用到正则表达式
    let phoneReg = /^1[3-9]\d{9}$/; //编写正则表达式，注意js中定义正则表达式的语法：/正则表达式/
    if(!phoneReg.test(phone)){//判断phone是否符合正则表达式的格式,符合为true，不符合为false
      wx.showToast({//是个异步方法，但是我们需要同步，因此最好是在调用完异步方法后直接return，防止在调用异步方法时后面的代码执行。
        title: '手机号格式错误！',
        icon: 'none'
      });
      return;
    }
    //密码判空
    if(!password){
      //提示用户,由于环境不是windows因此没有windows的全局对象，不能用windows提供的alert，全局对象是wx，所以要用wx的api来实现相应功能。
      wx.showToast({//是个异步方法，但是我们需要同步，因此最好是在调用完异步方法后直接return，防止在调用异步方法时后面的代码执行。
        title: '密码不能为空！',
        icon: 'none'
      });
      return;
    }
    // wx.showToast({
    //   title: '前端验证通过！',
    // })
    
    //后端验证
    let result = await request("/login/cellphone",{phone,password,isLogin:true});//对象参数的数据在该方法的最前面已经抽离,携带isLogin参数，方便判断是否为登录请求
    //建议先判断成功，因为成功只有一种状态码，而失败有很多种状态码，先判断成功可以消除一些不必要的判断。
    if(result.code === 200){//===是先判断类型再比较，如果类型不相同直接false，==是进行类型转换后再进行比较，=是赋值
      wx.showToast({
        title: '登录成功！',
      });
      //想要实现各页面之间信息的交流，可以走本地存储，通过本地存储来实现各个页面之间的信息交流
      //将用户的信息存储至本地,信息最好用json格式存储，所以尽量先用JSON.stringify转换信息为json格式，然后再存储至本地
      wx.setStorageSync('userInfo', JSON.stringify(result.profile));//这是个同步方法，还有个异步版本，就是去掉sync

      //登录成功后跳转到个人中心页面
      // wx.switchTab({//用这个方式跳转的话，原页面不会被销毁，因此原页面的onLoad方法并不会被执行
      //   url: '/pages/personal/personal',
      // });
      wx.reLaunch({//这个方法是销毁所有页面后，跳转到指定页面，这意味的所有以后要显示的页面都会调用一遍onLoad方法
        url: '/pages/personal/personal',
      })
    }else if(result.code === 400){
      wx.showToast({
        title: '手机号错误！',
        icon: 'none'
      });
    }else if(result.code === 502){
      wx.showToast({
        title: '密码错误！',
        icon: 'none'
      });
    }else {
      wx.showToast({
        title: '登录失败，请重新登录！',
        icon: 'none'
      });
    }
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