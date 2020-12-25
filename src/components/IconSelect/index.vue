<!-- @author zhengjie -->
<template>
  <div class="icon-body">
    <a-input
      v-model="name"
      style="position: relative;"
      clearable
      placeholder="请输入图标名称"
      @clear="filterIcons"
      @change="filterIcons">
      <i slot="suffix" class="el-icon-search el-input__icon" />
    </a-input>
    <div class="icon-list">
      <div v-for="(item, index) in iconList" :key="index" @click="selectedIcon(item)">
        <a-icon :component="all[item + 'Icon']" :style="{height: '30px', width: '16px', position: 'relative', bottom: '6px'}" />
        <span>{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import icons from './requireIcons'
import all from '@/core/icons'
export default {
  name: 'IconSelect',
  data () {
    return {
      name: 'code',
      iconList: icons,
      all
    }
  },
  methods: {
    filterIcons () {
      this.iconList = icons
      if (this.name) {
        this.iconList = this.iconList.filter(item => item.includes(this.name))
      }
    },
    selectedIcon (name) {
      this.$emit('selected', name)
      document.body.click()
      // this.reset()
    },
    reset () {
      this.name = 'code'
      this.iconList = icons
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .icon-body {
    width: 100%;
    padding: 10px;
    .icon-list {
      height: 200px;
      overflow-y: scroll;
      div {
        height: 30px;
        line-height: 30px;
        margin-bottom: -5px;
        cursor: pointer;
        width: 33%;
        float: left;
      }
      span {
        display: inline-block;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
      }
    }
  }
</style>
