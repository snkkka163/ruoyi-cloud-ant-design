<template>
  <div :class="wrpCls">
    <!-- 全屏模式 -->
    <a-icon v-if="monitorFullScreen === 0" type="fullscreen" @click="toggleFullScreen" />
    <a-icon v-if="monitorFullScreen === 1" type="fullscreen-exit" @click="toggleFullScreen" />
    <avatar-dropdown :menu="showMenu" :current-user="currentUser" :class="prefixCls" />
    <select-lang :class="prefixCls" />
  </div>
</template>

<script>
import AvatarDropdown from './AvatarDropdown'
import SelectLang from '@/components/SelectLang'
import { mapState } from 'vuex'
export default {
  name: 'RightContent',
  components: {
    AvatarDropdown,
    SelectLang
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-global-header-index-action'
    },
    isMobile: {
      type: Boolean,
      default: () => false
    },
    topMenu: {
      type: Boolean,
      required: true
    },
    theme: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      showMenu: true,
      currentUser: {},
      monitorFullScreen: 0
    }
  },
  methods: {
    // 切换全屏图标
    // 全屏切换
    toggleFullScreen () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
      this.monitorFullScreen = this.monitorFullScreen === 0 ? 1 : 0
    }
  },
  computed: {
    wrpCls () {
      return {
        'ant-pro-global-header-index-right': true,
        [`ant-pro-global-header-index-${(this.isMobile || !this.topMenu) ? 'light' : this.theme}`]: true
      }
    },
    ...mapState({
      name: (state) => state.user.name,
      avatar: (state) => state.avatar
    })
  },
  mounted () {
    setTimeout(() => {
      this.currentUser = {
        name: this.name
      }
    }, 1500)
  }
}
</script>
