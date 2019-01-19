<template>
  <div>
    <nav-header></nav-header>
    <nav-bread>
      <span>Goods</span>
    </nav-bread>
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">Sort by:</span>
          <a href="javascript:void(0)" class="default cur">Default</a>
          <!-- <a href="javascript:void(0)" class="price" @click="sortGoods">Price <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a> -->
          <a href="javascript:void(0)" class="price" v-bind:class="{'sort-up':sortFlag}" @click="sortGoods()">
            Price 
            <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg>
          </a>
          <a href="javascript:void(0)" class="filterby stopPop" @click.stop="showFilterPop">Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" :class="{'filterby-show':filterBy}">
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd><a href="javascript:void(0)" @click="setPriceFilter('all')" :class="{'cur': priceChecked === 'all'}">All</a></dd>
              <dd v-for="(item,index) in priceFilter" :key="item.id">
                <a href="javascript:void(0)" @click="setPriceFilter(index)" :class="{'cur': priceChecked === index}">{{ item.startPrice }} - {{ item.endPrice }}</a>
              </dd>
            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="item in goodsList" :key="item._id">
                  <div class="pic">
                    <a href="javascript:void(0)"><img v-lazy="'./../static/'+item.prodcutImg" alt=""></a> <!-- 懒加载 -->
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{ item.productPrice | currency('￥') }}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="view-more-normal"
                   v-infinite-scroll="loadMore"
                   infinite-scroll-disabled="busy"
                   infinite-scroll-distance="20">
                <img src="./../../static/loading-svg/loading-spinning-bubbles.svg" v-show="loading">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="md-overlay" v-show="overLayFlag" @click.stop="closePop"></div>
    <nav-footer></nav-footer>
  </div>
</template>

<script>
import "@/assets/css/base.css";
import "@/assets/css/product.css";
// import axios from "axios";
// import axios from "@/axios/index"
import NavHeader from "@/components/NavHeader";
import NavFooter from "@/components/NavFooter";
import NavBread from "@/components/NavBread";
import Modal from "@/components/Modal"
import axios from 'axios'
export default {
  data() {
    return {
      goodsList: "",
      priceChecked: "all",
      filterBy: false,
      overLayFlag: false,
      mdShowCart: true,
      page: 1,
      pageSize: 4,
      sortFlag: true,
      busy: true,
      loading: false,
      priceFilter: [
        {
          id: 0,
          startPrice: "0.00",
          endPrice: "100.00"
        },
        {
          id: 1,
          startPrice: "100.00",
          endPrice: "500.00"
        },
        {
          id: 2,
          startPrice: "500.00",
          endPrice: "1000.00"
        },
        {
          id: 3,
          startPrice: "1000.00",
          endPrice: "5000.00"
        }
      ]
    };
  },
  methods: {
    async getGoodsList(flag = false) { // 获取商品列表
      let param = {
        page: this.page,
        pageSize: this.pageSize,
        sort: this.sortFlag ? 1 : -1,
        priceLevel: this.priceChecked
      };
      this.loading = true
      let { data, status } = await this.axios.getGoodsList(param);
      this.loading = false
      if (status === 200) {
        if (flag) {
          this.goodsList = this.goodsList.concat(data.result.list);
          if (data.result.count === 0) {
            this.busy = true; // 没有数据了 禁用滚动加载数据
            this.loading = false;
          } else {
            this.busy = false;
            this.loading = false;
          }
        } else {
          this.goodsList = data.result.list;
          this.busy = false;
          this.loading = false;
        }
      }
    },
    sortGoods() { // 按照价格排序
      this.sortFlag = !this.sortFlag;
      this.page = 1;
      this.getGoodsList();
    },
    setPriceFilter(index) { // 选择价格区间
      this.priceChecked = index;
      this.closePop();
      this.page = 1;
      this.getGoodsList();
    },
    showFilterPop() { // 显示遮罩层
      this.filterBy = true;
      this.overLayFlag = true;
    },
    closePop() { // 关闭遮罩层
      this.filterBy = false;
      this.overLayFlag = false;
      this.mdShowCart = false;
    },
    loadMore() { // 加载更多数据
      this.loading = true;
      this.busy = true;
      setTimeout(() => {
        this.page++;
        this.getGoodsList(true);
      }, 500);
    },
    async addCart(productId) { // 加入购物车
      let {data, status} = await this.axios.addCart({productId:productId})
      if (status == 200) {
        alert(data.msg)
      }
    }
  },
  components: {
    NavHeader,
    NavFooter,
    NavBread,
    Modal
  },
  mounted: function() {
    this.getGoodsList();
  }
};
</script>

<style>
</style>
