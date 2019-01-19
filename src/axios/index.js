import axios from 'axios'
axios.defaults.timeout = 10000
// axios.defaults.header.post['Content-type'] = 'application/json;charset=UTF-8';
const api = axios.create()

export default {
  getGoodsList(data){ // 获取商品列表
    let {page = 1, pageSize = 5, sort = true, priceLevel = 'all'} = data
    return api.get(`/api/goods/list?page=${page}&pageSize=${pageSize}&sort=${sort}&priceLevel=${priceLevel}`)
  },

  addCart(data){ // 添加购物车
    return api.post(`/api/goods/addCart`, data)
  },

  userLogin(data){ // 登陆
    return api.post(`/api/users/login`, data)
  },

  userLogout(){ // 退出
    return api.post(`/api/users/logout`)
  },

  userCheckedLogin() { // 检查用户是否登录
    return api.get(`/api/users/checkLogin`)
  },

  getCartList() { // 获取购物车列表
    return api.get(`/api/users/cartList`)
  },

  delCart(data) { // 删除购物车
    return api.post(`/api/users/cartDel`, data)
  },

  editCart(data) { // 编辑购物车
    return api.post(`/api/users/cartEdit`, data)
  },

  toggleCheckedAll(data){ // 全选
    return api.post('/api/users/editCheckAll', data)
  },

  getAddressList() { // 获取地址
    return api.get(`/api/users/addressList`)
  },

  setDefault(data) { // 设置默认地址
    return api.post(`/api/users/setDefault`, data)
  },

  delAddress(data) { // 删除地址
    return api.post(`/api/users/delAddress`, data)
  },

  payMent(data) {
    return api.post(`/api/users/payMent`, data)
  },

  orderDetail(data) {
    let {orderId} = data
    return api.get(`/api/users/orderDetail?orderId=${orderId}`)
  }
}