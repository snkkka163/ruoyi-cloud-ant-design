<template>
  <div class="tabs-view">
    <a-tabs
      v-if="panes.length !== 0"
      @change="changePage"
      v-model="activeKey"
      hide-add
      type="editable-card"
      @edit="onEdit">
      <a-tab-pane v-for="pane in panes" :key="pane.fullPath" :tab="pane.title" :closable="pane.closable">
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
export default {
  name: 'TabsView',
  data () {
    const panes = [
      { title: '工作台', key: '/dashboard/workplace', fullPath: '/dashboard/workplace' }
    ]
    return {
      activeKey: panes[0].key,
      panes,
      newTabIndex: 0
    }
  },
  created () {},
  // 监听,当路由发生变化的时候执行
  watch: {
    $route: {
      handler: function (val, oldVal) {
        const title = val.meta.title
        const fullPath = val.fullPath
        const routerObj = Object.assign({
          'title': title,
          'fullPath': fullPath,
          'key': fullPath
        })
        // 先判断标签路由中是否已经存在相同的,如果存在相同的跳转后不push
        let flag = true
        this.panes.forEach(item => {
          if (item.fullPath === fullPath) {
            flag = false
          }
        })
        if (flag) {
          this.panes.push(routerObj)
        }
        this.activeKey = fullPath
        console.log('现在的全路由')
        console.log(this.panes)
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    callback (key) {
      console.log(key)
    },
    onEdit (targetKey, action) {
      this[action](targetKey)
    },
    add () {
      const panes = this.panes
      const activeKey = `newTab${this.newTabIndex++}`
      panes.push({
        title: `New Tab ${activeKey}`,
        content: `Content of new Tab ${activeKey}`,
        key: activeKey
      })
      this.panes = panes
      this.activeKey = activeKey
    },
    remove (targetKey) {
      let activeKey = this.activeKey
      let lastIndex
      this.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1
        }
      })
      const panes = this.panes.filter(pane => pane.key !== targetKey)
      if (panes.length && activeKey === targetKey) {
        if (lastIndex >= 0) {
          activeKey = panes[lastIndex].key
        } else {
          activeKey = panes[0].key
        }
      }
      this.panes = panes
      this.activeKey = activeKey
    },
    changePage (key) {
      console.log('切换页面')
      console.log(key)
      this.activeKey = key
      this.$router.push({ path: key })
    }
  }
}
</script>

// <style lang="scss" scoped>
// .tabs-view {
//   border-top: 1px solid #eee;

//   ::v-deep(.tabs) {
//     .ant-tabs-bar {
//       padding: 4px 20px 0 10px;
//       margin: 0;
//       background-color: white;
//       user-select: none;
//     }

//     .ant-tabs-tabpane {
//       display: none;
//     }
//   }

//   .tabs-view-content {
//     padding: 20px 14px 0;
//     height: calc(100vh - 110px);
//     overflow: auto;
//   }
// }
// </style>
