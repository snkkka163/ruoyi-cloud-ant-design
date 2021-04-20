<template>
  <div>
    <a-drawer
      title="调度日志详细"
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
              <a-form-model-item label="日志序号">
                {{ data.jobLogId }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="任务分组">
                {{ jobGroupFormat(data) }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="任务名称">
                {{ data.jobName }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="执行时间">
                {{ data.createTime }}
              </a-form-model-item>
            </a-col>
            <a-col :span="24" :pull="2">
              <a-form-model-item label="调用目标方法">
                {{ data.invokeTarget }}
              </a-form-model-item>
            </a-col>
            <a-col :span="24" :pull="3">
              <a-form-model-item label="日志信息">
                {{ data.jobMessage }}
              </a-form-model-item>
            </a-col>
            <a-col :span="24" :pull="3">
              <a-form-model-item label="执行状态">
                <a-badge v-if="data.status == 0" status="processing" text="正常" />
                <a-badge v-if="data.status == 1" status="warning" text="失败" />
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
      jobGroupOptions: []
    }
  },
  created () {
    this.getDicts('sys_job_group').then(response => {
      this.jobGroupOptions = response.data
    })
  },
  methods: {
    jobGroupFormat (row) {
      return this.selectDictLabel(this.jobGroupOptions, row.jobGroup)
    },
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
