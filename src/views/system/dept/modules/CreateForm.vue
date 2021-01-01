<template>
  <a-modal
    ref="createModal"
    :title="readOnly ? '详情' : (form.deptId ? '部门编辑' : '新增操作')"
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
        <a-row>
          <a-col :span="24" :pull="3">
            <a-form-model-item label="上级部门" prop="parentId">
              <a-tree-select
                v-model="form.parentId"
                :tree-data="deptOptions"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="Please select"
                tree-default-expand-all
                :replaceFields="treeReplaceFields"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="部门名称" prop="deptName">
              <a-input v-model="form.deptName" placeholder="请输入部门名称" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="显示排序" prop="orderNum">
              <a-input-number v-model="form.orderNum" :min="0" :max="100" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="负责人" prop="leader">
              <a-input v-model="form.leader" placeholder="请输入负责人" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="联系电话" prop="phone">
              <a-input v-model="form.phone" placeholder="请输入联系电话" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="邮箱" prop="email">
              <a-input v-model="form.email" placeholder="请输入邮箱" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="部门状态" prop="status">
              <a-radio-group button-style="solid" v-model="form.status">
                <a-radio-button
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :value="dict.dictValue">
                  {{ dict.dictLabel }}
                </a-radio-button>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { listDept, addDept, updateDept } from '@/api/system/dept'
// 表单字段
export default {
  data () {
    return {
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
      // 状态数据字典
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
      // 表单属性:
      form: {},
      // 表单校验
      rules: {
        parentId: [
          { required: true, message: '上级部门不能为空', trigger: 'blur' }
        ],
        deptName: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' }
        ],
        orderNum: [
          { required: true, message: '菜单顺序不能为空', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      },
      treeReplaceFields: {
        children: 'children',
        title: 'deptName',
        key: 'deptId',
        value: 'deptId'
      }
    }
  },
  created () {
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
    listDept().then(response => {
      this.deptOptions = this.handleTree(response.data, 'deptId')
      const dept = { deptId: 0, deptName: '主类目', children: [] }
      this.deptOptions.push(dept)
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
        this.reset()
      }
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
          if (this.form.deptId > 0) {
            // 暂时在本处处理若依最高级菜单下无子菜单情况下children是个字符串的bug
            if (this.form.children === '') {
              this.form.children = []
            }
            this.filterStrArrary(this.form.children)
            // 刷新表格
            updateDept(this.form).then(response => {
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
            addDept(this.form).then(response => {
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
    },
    filterStrArrary (list) {
      for (let index = 0; index < list.length; index++) {
        if (list[index].children === '') {
          list[index].children = []
        }
        if (list[index].children) {
          this.filterStrArrary(list[index].children)
        }
      }
    }
  }
}
</script>
