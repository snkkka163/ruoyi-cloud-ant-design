<template>
  <div>
    <!-- <a-button type="primary" @click="showDrawer">
      Open
    </a-button> -->
    <!-- <a-drawer
      title="安全设置-修改密码"
      width="520"
      :closable="false"
      :visible="visible"
      @close="() => { $emit('close') }"
      @ok="() => { $emit('ok') }"
    > -->
    <a-drawer
      title="安全设置-修改密码"
      :width="640"
      :visible="visible"
      :confirmLoading="loading"
      @close="() => { $emit('cancel') }"
      @ok="() => { $emit('ok') }"
    >
    <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
      <a-form-item label="新密码">
        <a-input
          v-decorator="['password', { rules: [{ required: true, message: '新密码不能为空!' }] }]"
        />
      </a-form-item>
    </a-form>

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
        <a-button style="marginRight: 8px" @click="() => { $emit('cancel') }">
          取消
        </a-button>
        <a-button type="primary" @click="() => { $emit('ok') }">
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
      required: true
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
      childrenDrawer: false,
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' })
    }
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
    },
    handleSelectChange (value) {
      console.log(value)
      this.form.setFieldsValue({
        note: `Hi, ${value === 'male' ? 'man' : 'lady'}!`
      })
    },
    onClose () {
      this.visible = false
    }
  }
}
</script>
