let express = require('express')
let router = express.Router()
let mongoose = require('mongoose')
let Goods = require('../models/goods')
let User = require('../models/user')
mongoose.connect('mongodb://localhost/dumall')

// mongoose.connection.on('connected', () => { // 监听数据库是否连接成功
//   console.log('mongodb connected success')
// })
// mongoose.connection.on('error', () => { // 监听数据库是否连接成功
//   console.log('mongodb connected err')
// })
// mongoose.connection.on('disconnected', () => { // 监听数据库是否连接成功
//   console.log('mongodb connected disconnected')
// })

router.get('/list', function (req, res, next) {
  let page = parseInt(req.param("page"))
  let pageSize = parseInt(req.param("pageSize"))
  let priceLevel = req.param("priceLevel")
  let sort = parseInt(req.param("sort"))
  let skip = (page - 1) * pageSize
  let params = {}
  let priceGt  = ''
  let priceLte = ''
  if (priceLevel !== 'all') {
    switch (priceLevel) {
      case '0':
        priceGt = 0;
        priceLte = 100;
        break;
      case '1':
        priceGt = 100;
        priceLte = 500;
        break;
      case '2':
        priceGt = 500;
        priceLte = 1000;
        break;
      case '3':
        priceGt = 1000;
        priceLte = 5000;
        break;
      default:
        break;
    }
    params = {
      productPrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize)
  goodsModel.sort({
    'productPrice': sort
  })
  goodsModel.exec(function (err, doc) {
    if (err) {
      return res.json({
        status: 1,
        msg: err.message
      })
    }
    res.json({
      status: 0,
      msg: '获取商品列表成功',
      result: {
        count: doc.length,
        list: doc
      }
    })
  })
})

router.post('/addCart', function (req, res, next) {
  let userId = '123'
  let productId = req.body.productId
  let User = require('./../models/user')
  User.findOne({"userId": userId}, function (err, userDoc) {
    if (err) {
      res.json({
        status: 1,
        msg: err.message
      })
    }else{
      // console.log(userDoc)
      if (userDoc) {
        let goodsItem = ''
        userDoc.cartList.forEach( (item)=>{
          if (item.productId == productId) {
            goodsItem = item
            item.productNum++
          }
        });
        if (goodsItem) {
          userDoc.save( (err2, doc2) => {
            if (err2) {
              res.json({
                status: 1,
                msg: err2.message
              })
            }else{
              res.json({
                status: 0,
                msg: 'success',
                result: 'success'
              })
            }
          })
        }else{
          Goods.findOne({productId:productId}, function (err1, doc) {
            if (err1) {
              res.json({
                status: 1,
                msg: err1.message
              })
            }else{
              if (doc) {
                console.log(doc,1)
                doc.productNum = 1
                doc.checked = 1
                userDoc.cartList.push(doc);
                userDoc.save( function (err2, doc2) {
                  if (err2) {
                    res.json({
                      status: 1,
                      msg: err2.message
                    })
                  }else{
                    res.json({
                      status: 0,
                      msg: 'success',
                      result: 'success'
                    })
                  }
                })
              }
            }
          })
        }
      }
    }
  })
  // User.findOne({'userId': userId})
  //   .then( (userDoc, err) => {
  //     if (err) {
  //       res.json({
  //         status: 1,
  //         msg: '服务器错误'
  //       })
  //     }
  //   })
})

module.exports = router
