import config from "./config"
//发送ajax请求
export default (url,data={},method="GET") => {
  return new Promise((resolve,reject) => {
      wx.request({
        url: config.host + url,
        data,
        method,
        header:{//携带cookie的写法，但是后端登录接口有点问题，所以先注释掉了
          cookie:wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):'',//查找cookies中含有MUSIC_U字符串的cookie赋值给cookie,用三目运算符来实现空安全
        },
        success: (res)=>{
          console.log("请求成功：",res);
          if(data.isLogin){//判断如果是登录请求
            //将cookie存储到本地
            wx.setStorage({key:"cookies",data:res.cookies});
          }
          resolve(res.data);//修改promise的状态为成功状态resolved
        },
        fail: (err)=>{
          console.log("请求失败:",err);
          reject(err);//修改promise的状态为失败状态rejected
        }
      })
    }
  )
}