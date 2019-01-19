var express = require('express');
var router = express.Router();
let User = require('./../models/user')
require('./../utils/date')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function (req, res, next) { // 登陆
  let param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  User.findOne(param, function (err, userDoc) {
    if (err) {
      res.json({
        status: 1,
        msg: '服务器繁忙，请稍后重试!'
      })
    } else {
      if (userDoc) {
        res.cookie("userId", userDoc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        })
        res.json({
          status: 0,
          msg: '登陆成功!',
          result: {
            userName: userDoc.userName,
            userPwd: userDoc.userPwd
          }
        })
      } else {
        res.json({
          status: 1,
          msg: '用户名或密码不正确!'
        })
      }
    }
  })
})

router.post('/logout', function (req, res, next) { // 退出
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  })
  res.json({
    status: 1,
    msg: '退出成功',
    result: ''
  })
})

router.get("/checkLogin", function (req, res, next) { // 检查是否登陆
  if (req.cookies.userId) {
    res.json({
      status: 0,
      msg: '已登录',
      result: req.cookies.userName || ''
    });
  } else {
    res.json({
      status: 1,
      msg: '未登录',
      result: ''
    });
  }
});

router.get('/cartList', function (req, res, next) { // 查询用户购物车数据
  let userId = req.cookies.userId
  User.findOne({
    'userId': userId
  }, function (err, data) {
    if (err) {
      return res.json({
        status: 1,
        msg: '服务器错误',
        result: ''
      })
    }
    res.json({
      status: 0,
      msg: '获取商品列表成功',
      result: data.cartList
    })
  })
})

router.post('/cartDel', function (req, res, next) { // 删除购物车
  let userId = req.cookies.userId
  let productId = req.body.productId
  User.update({
    userId: userId
  }, {
    $pull: {
      'cartList': {
        'productId': productId
      }
    }
  }, function (err, data) {
    if (err) {
      res.json({
        status: 1,
        msg: '服务器错误',
        result: ''
      })
    }
    res.json({
      status: 0,
      msg: '删除成功',
      result: 'success'
    })
  })

})

router.post('/cartEdit', function (req, res, next) { // 更新商品数量
  let userId = req.cookies.userId
  let productId = req.body.productId
  let productNum = req.body.productNum
  let checked = req.body.checked
  User.update({
    "userId": userId,
    "cartList.productId": productId
  }, {
    "cartList.$.productNum": productNum,
    "cartList.$.checked": checked
  }, function (err, data) {
    if (err) {
      res.json({
        status: 1,
        msg: '服务器错误',
        result: ''
      })
    } else {
      res.json({
        status: 0,
        msg: '更新成功',
        result: 'success'
      })
    }
  })

})

router.post('/editCheckAll', function (req, res, next) { // 全选
  let userId = req.cookies.userId
  let checkAll = req.body.checkAll ? 1 : 0
  User.findOne({
    "userId": userId
  }, function (err, user) {
    if (err) {
      res.json({
        status: 1,
        msg: '服务器错误',
        result: ''
      })
    } else {
      if (user) {
        user.cartList.forEach((item) => {
          item.checked = checkAll
        })
        user.save(function (err1, doc) {
          if (err1) {
            res.json({
              status: 1,
              msg: '服务器错误',
              result: ''
            })
          } else {
            res.json({
              status: 0,
              msg: '成功',
              result: ''
            })
          }
        })
      }
    }
  })
})

router.get('/addressList', function (req, res, next) {
  let userId = req.cookies.userId
  User.findOne({
    "userId": userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: '服务器错误',
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: 0,
          msg: '获取地址成功',
          result: doc.addressList
        })
      }
    }
  })
})

router.post('/setDefault', function (req, res, next) {
  let userId = req.cookies.userId
  let addressId = req.body.addressId
  // return res.json({
  //   data: addressId
  // })
  User.findOne({
    'userId': userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: '服务器错误',
        result: ''
      })
    } else {
      let addressList = doc.addressList
      addressList.forEach((item) => {
        if (item.addressId == addressId) {
          item.isDefault = true
        } else {
          item.isDefault = false
        }
      })
      doc.save(function (err1, doc1) {
        if (err1) {
          res.json({
            status: 1,
            msg: '服务器错误',
            result: ''
          })
        } else {
          res.json({
            status: 0,
            msg: 'success',
            result: 'success'
          })
        }
      })
    }
  })
})

router.post('/delAddress', function (req, res, next) {
  let userId = req.cookies.userId
  let addressId = req.body.addressId
  User.update({
    'userId': userId
  }, {
    $pull: {
      'addressList': {
        'addressId': addressId
      }
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: '服务器错误',
        result: ''
      })
    } else {
      res.json({
        status: 0,
        msg: 'success',
        result: 'success'
      })
    }
  })
})

router.post('/payMent', function (req, res, next) {
  let userId = req.cookies.userId
  let addressId = req.body.addressId
  let orderTotal = req.body.orderTotal
  User.findOne({
    'userId': userId
  }, function (err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: '服务器错误',
        result: ''
      })
    } else {
      let address = ''
      let goodsList = []
      doc.addressList.forEach((item) => {
        if (addressId == item.addressId) {
          address = item
        }
      })
      doc.cartList.filter((item) => {
        if (item.checked == 1) {
          goodsList.push(item)
        }
      })

      let platform = 'cc'
      let r1 = Math.floor(Math.random() * 10)
      let r2 = Math.floor(Math.random() * 10)

      let sysDate = new Date().Format('yyyyMMddhhmmss')
      let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
      let orderId = platform + r1 + sysDate + r2
      let order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate: createDate
      }

      doc.orderList.push(order)
      doc.save(function (err1, doc2) {
        if (err1) {
          res.json({
            status: 1,
            msg: '服务器错误',
            result: ''
          })
        } else {
          res.json({
            status: 0,
            msg: 'success',
            result: {
              orderId: order.orderId,
              orderTotal: order.orderTotal
            }
          })
        }
      })
    }
  })
})

router.get('/orderDetail', function (req, res, next) {
  let userId = req.cookies.userId
  let orderId = req.query.userId
  // retu
  User.findOne({
    userId: userId
  }, function (err, userInfo) {
    if (err) {
      res.json({
        status: 1,
        msg: '服务器错误',
        result: ''
      })
    } else {
      let orderList = userInfo.orderList
      if (orderList.length > 0) {
        let orderTotal = 0
        orderList.forEach((item) => {
          if (item.orderId == orderId) {
            orderTotal = item.orderTotal
          }
        })
        if (orderTotal) {
          res.json({
            status: 0,
            msg: 'success',
            result: {
              orderId: orderId,
              orderTotal: orderTotal
            }
          })
        } else {
          res.json({
            status: 2,
            msg: '无此订单',
            result: ''
          })
        }
      } else {
        res.json({
          status: 2,
          msg: '当前用户为创建订单',
          result: ''
        })
      }
    }
  })
})
module.exports = router;
