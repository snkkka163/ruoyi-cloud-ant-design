<template>
  <div>
    <!-- <a-button type="primary" @click="showDrawer">
      Open
    </a-button> -->
    <a-drawer
      title="Multi-level drawer"
      width="520"
      :closable="false"
      :visible="visible"
      @close="() => { $emit('onClose') }"
    >
      <div
        :style="{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e8e8e8',
          padding: '10px 16px',
          textAlign: 'right',
          left: 0,
          background: '#fff',
          borderRadius: '0 0 4px 4px',
        }"
      >
        <a-button style="marginRight: 8px" @click="() => { $emit('onClose') }">
          取消
        </a-button>
        <a-button type="primary" @click="() => { $emit('onClose') }">
          确认修改
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>
<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: () => false
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data () {
    return {
      // visible: false,
      childrenDrawer: false
    }
  }
}
</script>
