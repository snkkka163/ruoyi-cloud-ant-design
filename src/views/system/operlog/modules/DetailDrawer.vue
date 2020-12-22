<template>
  <div>
    <a-drawer
      title="操作日志详细"
      :width="640"
      :visible="visible"
      :confirmLoading="loading"
      @close="close"
    >
    <a-spin :spinning="loading">
      <a-form-model
        ref="ruleForm"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-row>
          <a-col :span="12">
            <a-form-model-item label="操作模块">
              {{ data.title }} / {{ typeFormat(data) }}
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="请求地址">
              {{ data.operUrl }}
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="登录信息">
              {{ data.operName }} / {{ data.operIp }}
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="请求方式">
              {{ data.requestMethod }}
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item label="操作方法">
              {{ data.method }}
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item label="请求参数">
              {{ data.operParam }}
            </a-form-model-item>
          </a-col>
          <a-col :span="24" :pull="3">
            <a-form-model-item label="返回参数">
              {{ data.jsonResult }}
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="操作状态">
              <a-badge v-if="data.status === 0" :status="'success'" :text="'正常'" />
              <a-badge v-if="data.status === 1" :status="'error'" :text="'错误'" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="操作时间">
              {{ data.operTime }}
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>

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
        <a-button style="marginRight: 8px" @click="close">
          关闭
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      loading: false,
      // 模态框数据
      data: {},
      labelCol: {
        xs: { span: 12 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      },
      // 类型数据字典
      typeOptions: [],
      // 类型数据字典
      statusOptions: []
    }
  },
  created () {
    this.getDicts('sys_oper_type').then(response => {
      this.typeOptions = response.data
    })
    this.getDicts('sys_common_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    // 关闭模态框
    close () {
      this.visible = false
    },
    // 打开抽屉(由外面的组件调用)
    show (data) {
      if (data) {
        this.data = data
      }
      this.visible = true
    },
    // 操作日志状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 操作日志类型字典翻译
    typeFormat (row, column) {
      return this.selectDictLabel(this.typeOptions, row.businessType)
    }
  }
}
</script>
