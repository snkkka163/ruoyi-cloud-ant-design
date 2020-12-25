<template>
  <div>
    <a-drawer
      title="定时任务详细"
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
              <a-form-model-item label="任务编号">
                {{ data.jobId }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="任务分组">
                {{ jobGroupFormat(data.jobGroup) }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="任务名称">
                {{ data.jobName }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="创建时间">
                {{ data.createTime }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="cron表达式">
                {{ data.cronExpression }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="执行时间">
                {{ data.nextValidTime }}
              </a-form-model-item>
            </a-col>
            <a-col :span="24" :pull="3">
              <a-form-model-item label="调用目标方法">
                {{ data.invokeTarget }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="任务状态">
                <a-badge v-if="data.status === '0'" :status="'processing'" :text="'运行中'" />
                <a-badge v-if="data.status === '1'" :status="'default'" :text="'暂停'" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="是否并发">
                <a-badge v-if="data.concurrent == 0" status="processing" text="允许" />
                <a-badge v-if="data.concurrent == 1" status="default" text="禁止" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="执行策略">
                <a-badge v-if="data.misfirePolicy == 0" status="processing" text="默认策略" />
                <a-badge v-if="data.misfirePolicy == 1" status="processing" text="立即执行" />
                <a-badge v-if="data.misfirePolicy == 2" status="processing" text="执行一次" />
                <a-badge v-if="data.misfirePolicy == 3" status="processing" text="放弃执行" />
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
      // 任务组名字典
      jobGroupOptions: [],
      visible: false,
      loading: false,
      // 模态框数据
      data: {},
      labelCol: {
        xs: { span: 12, push: 1 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24, push: 1 },
        sm: { span: 18 }
      }
    }
  },
  created () {
    this.getDicts('sys_job_group').then(response => {
      this.jobGroupOptions = response.data
    })
  },
  methods: {
    // 关闭模态框
    close () {
      this.visible = false
    },
    // 打开抽屉(由外面的组件调用)
    show (data) {
      console.log(data)
      if (data) {
        this.data = data
      }
      this.visible = true
    },
    // 任务分组翻译
    jobGroupFormat (jobGroup) {
      return this.selectDictLabel(this.jobGroupOptions, jobGroup)
    }
  }
}
</script>
