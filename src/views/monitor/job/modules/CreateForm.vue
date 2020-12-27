<template>
  <a-modal
    ref="createModal"
    :title="readOnly ? '详情' : (form.jobId ? '任务编辑' : '新增操作')"
    :width="640"
    :visible="visible"
    @cancel="close"
    @ok="confirm"
    :confirmLoading="confirmLoading"
  >
    <a-spin :spinning="loading">
      <a-form-model
        ref="ruleForm"
        :model="form"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-model-item ref="jobName" label="任务名称" prop="jobName">
          <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.jobName" placeholder="请输入任务名称" />
        </a-form-model-item>
        <a-form-model-item ref="jobGroup" label="任务分组" prop="jobGroup">
          <a-select button-style="solid" v-model="form.jobGroup">
            <a-select-option
              v-for="dict in jobGroupOptions"
              :key="dict.dictValue"
              :value="dict.dictValue">
              {{ dict.dictLabel }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item ref="invokeTarget" prop="invokeTarget">
          <span slot="label">
            调用方法
            <a-tooltip>
              <template slot="title" placement="top">
                Bean调用示例：ryTask.ryParams('ry')
                <br />Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.invokeTarget" placeholder="请输入调用方法" />
        </a-form-model-item>
        <a-form-model-item ref="cronExpression" label="cron表达式" prop="cronExpression">
          <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.cronExpression" placeholder="请输入cron表达式" />
        </a-form-model-item>

        <a-form-model-item ref="concurrent" label="是否并发" prop="concurrent">
          <a-radio-group button-style="solid" v-model="form.concurrent">
            <a-radio-button :value="'0'">允许</a-radio-button>
            <a-radio-button :value="'1'">禁止</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item ref="misfirePolicy" label="错误策略" prop="misfirePolicy">
          <a-radio-group button-style="solid" v-model="form.misfirePolicy">
            <a-radio-button :value="'1'">立即执行</a-radio-button>
            <a-radio-button :value="'2'">执行一次</a-radio-button>
            <a-radio-button :value="'3'">放弃执行</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item ref="status" label="状态" prop="status">
          <a-radio-group v-model="form.status">
            <a-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :value="dict.dictValue">
              {{ dict.dictLabel }}
            </a-radio>
          </a-radio-group>
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
// import pick from 'lodash.pick'
import IconSelect from '@/components/IconSelect'
import { addJob, updateJob } from '@/api/monitor/job'
// 表单字段
export default {
  components: {
    IconSelect
  },
  data () {
    return {
      // 任务组名字典
      jobGroupOptions: [],
      // 状态字典
      statusOptions: [],
      // 当前控件配置:
      confirmLoading: false,
      readOnly: false,
      visible: false,
      loading: false,
      // form: this.$form.createForm(this),
      // value: undefined,
      labelCol: {
        xs: { span: 12 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        jobName: [
          { required: true, message: '任务名称不能为空', trigger: 'blur' }
        ],
        invokeTarget: [
          { required: true, message: '调用目标字符串不能为空', trigger: 'blur' }
        ],
        cronExpression: [
          { required: true, message: 'cron执行表达式不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getDicts('sys_job_group').then(response => {
      this.jobGroupOptions = response.data
    })
    this.getDicts('sys_job_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    // 由于要用传进来的值做判断,将显示和隐藏放在内部做处理
    show (data, readOnly) {
      if (data) {
        // 修改行为
        this.form = Object.assign({}, data) || {}
      } else {
        // 新增行为
        // 刷新表单,查询角色树
        this.reset()
      }
      // if (data) this.form = Object.assign({}, data) || {}
      this.readOnly = typeof readOnly !== 'undefined' ? readOnly === true : false
      this.visible = true
    },
    // 关闭模态框
    close () {
      this.visible = false
      this.reset()
    },
    confirm () {
      this.confirmLoading = true
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          // 进行新增行为:
          if (this.form.jobId > 0) {
            // 刷新表格
            updateJob(this.form).then(response => {
              if (response.code === 200) {
                this.$message.success('修改成功')
                // 关闭本组件
                this.visible = false
                // 调用外部刷新列表方法
                this.$emit('handle-success')
                // 刷新表单
                this.reset()
                this.confirmLoading = false
              } else {
                this.$message.error(response.msg)
                this.confirmLoading = false
              }
            })
          } else {
            // 新增
            addJob(this.form).then(response => {
              if (response.code === 200) {
                this.$message.success('新增成功')
                // 关闭本组件
                this.visible = false
                // 调用外部刷新列表方法
                this.$emit('handle-success')
                // 刷新表单
                this.reset()
                this.confirmLoading = false
              } else {
                this.$message.error(response.msg)
                this.confirmLoading = false
              }
            })
          }
        } else {
          return (this.confirmLoading = false)
        }
      })
    },
    // 表单重置
    reset () {
      this.form = {}
    }
  }
}
</script>
