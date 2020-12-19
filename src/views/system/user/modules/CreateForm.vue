<template>
  <a-modal
    ref="createModal"
    :title="readOnly ? '详情' : (form.userId ? '用户编辑' : '新增操作')"
    :width="640"
    :visible="visible"
    @ok="() => { $emit('ok') }"
    @cancel="close"
  >
    <a-spin :spinning="loading">
      <a-form-model
      ref="ruleForm"
      :model="form"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
        <a-form-model-item ref="username" label="用户名" prop="username">
          <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.username" placeholder="请输入菜单名称" />
        </a-form-model-item>
        <a-form-model-item label="昵称" prop="nickname">
          <a-input v-model="form.nickname" placeholder="请输入昵称或真实姓名" />
        </a-form-model-item>
        <a-form-model-item label="邮箱地址" prop="email">
          <a-auto-complete
            v-model="form.email"
            placeholder="请输入邮箱地址"
          />
           <!-- @change="handleEmailChange" -->
        </a-form-model-item>
        <a-form-model-item label="手机号" prop="mobile">
          <a-input v-model="form.mobile" placeholder="请输入手机号" />
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
// import pick from 'lodash.pick'
import { getTreeSelect } from '@/api/system/dept'
// 表单字段
export default {
  data () {
    this.formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      }
    }
    return {
      readOnly: false,
      visible: false,
      loading: false,
      // form: this.$form.createForm(this),
      treeData: [],
      value: undefined,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      form: {
        username: '',
        nickname: '',
        resourceIds: [],
        status: undefined,
        roleIds: []
      },
      rules: {
        username: [
          { required: true, message: '此项为必输项', trigger: 'blur' },
          { max: 20, message: '最多输入20个字符', trigger: 'change' }
        ],
        nickname: [
          { required: true, message: '此项为必输项', trigger: 'blur' },
          { max: 50, message: '最多输入50个字符', trigger: 'change' }
        ],
        status: [
          { required: true, message: '此项为必选项', trigger: 'change' }
        ],
        mobile: [{ pattern: new RegExp('^[1][3-8][0-9]{9}$'), message: '格式不合法', trigger: 'change' }],
        email: [{ type: 'email', message: '格式不合法', trigger: 'change' }]
        // pattern: new RegExp('^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\\.[a-zA-Z0-9_-]{2,3}){1,2})$')
        // ,resourceIds: [{ required: true, message: '此项为必选项', trigger: 'select' }]
      }
    }
  },
  created () {
    // 初始化树菜单
    getTreeSelect()
    .then(res => {
      // 层级遍历赋值给treeData
      this.treeData = res.data
      this.getTreeSelectChildren(this.treeData)
      console.log(this.treeData)
    })
  },
  methods: {
    getTreeSelectChildren (treeData) {
      treeData.forEach(element => {
        element.value = element.id
        element.key = element.label
        if (element.hasOwnProperty('children') === true) {
          this.getTreeSelectChildren(element.children)
        }
      })
    },
    // 由于要用传进来的值做判断,将显示和隐藏放在内部做处理
    show (data, readOnly) {
      console.log('调用成功')
      console.log(data)
      console.log(readOnly)
      console.log('================================')
      console.log(this.form)
      if (data) {
        this.form = Object.assign({}, data) || {}
      } else {
        console.log('data是空的')
      }
      // if (data) this.form = Object.assign({}, data) || {}
      this.readOnly = typeof readOnly !== 'undefined' ? readOnly === true : false
      // this.defaultExpandedKeys = this.form.resourceIds
      this.visible = true
      // this.visible = true
      // this.visible = true
    },
    // 关闭模态框
    close () {
      // this.form = {
      //   name: '',
      //   resourceIds: [],
      //   nickname: '',
      //   status: undefined,
      //   roleIds: []
      // }
      this.visible = false
      // this.confirmLoading = false
      // this.form.resetFields()
    }
  }
}
</script>
