<template>
  <a-modal
    ref="createModal"
    :title="readOnly ? '详情' : (form.userId ? '用户编辑' : '新增操作')"
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
          <a-col :span="12">
            <a-form-model-item ref="nickName" label="用户昵称" prop="nickName">
              <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.nickName" placeholder="请输入用户昵称" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="归属部门" prop="deptId">
              <a-tree-select
                v-model="form.deptId"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :tree-data="treeData"
                placeholder="Please select"
                tree-default-expand-all
              >
              <!-- <span v-if="key === '0-0-1'" slot="title" slot-scope="{ key, value }" style="color: #08c">
                Child Node1 {{ value }}
              </span> -->
              </a-tree-select>
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12">
            <a-form-model-item label="手机号" prop="phonenumber">
              <a-input v-model="form.phonenumber" placeholder="请输入手机号" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="邮箱地址" prop="email">
              <a-auto-complete
                v-model="form.email"
                placeholder="请输入邮箱地址"
              />
              <!-- @change="handleEmailChange" -->
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12">
            <a-form-model-item v-if="form.userId == undefined" label="用户名称" prop="userName">
              <a-input v-model="form.userName" placeholder="请输入用户名称" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item v-if="form.userId == undefined" label="用户密码" prop="password">
              <a-input v-model="form.password" placeholder="请输入用户密码" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12">
            <a-form-model-item label="用户性别" prop="sex">
              <!-- <a-input v-model="form.sex" placeholder="请输入用户性别" /> -->
              <a-radio-group v-model="form.sex">
                <a-radio
                  v-for="dict in sexOptions"
                  :key="dict.dictValue"
                  :value="dict.dictValue">
                  {{ dict.dictLabel }}
                </a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="状态" prop="status">
              <a-radio-group button-style="solid" v-model="form.status">
                <a-radio-button
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :value="dict.dictValue">
                  {{ dict.dictLabel }}
                </a-radio-button>
              </a-radio-group>
              <!-- <a-input v-model="form.status" placeholder="请输入状态" /> -->
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12">
            <a-form-model-item label="岗位" prop="postIds">
              <a-select mode="multiple" v-model="form.postIds" placeholder="请选择">
                <a-select-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :value="item.postId">
                  {{ item.postName }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="角色" prop="roleIds">
              <a-select mode="multiple" v-model="form.roleIds" placeholder="请选择">
                <a-select-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :value="item.roleId">
                  {{ item.roleName }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24" :pull="3">
            <a-form-model-item label="备注" prop="remark">
              <!-- <a-input v-model="form.mobile" placeholder="请输入用户性别" /> -->
              <a-textarea v-model="form.remark" placeholder="Basic usage" :rows="4" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
// import pick from 'lodash.pick'
import { treeselect } from '@/api/system/dept'
import { getUser, updateUser, addUser } from '@/api/system/user'
// 表单字段
export default {
  data () {
    return {
      // 部门树选择
      treeData: [],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 默认密码
      initPassword: undefined,
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
      form: {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: '0',
        remark: undefined,
        postIds: [],
        roleIds: []
      },
      // 输入框校验:
      rules: {
        nickName: [
          { required: true, message: '用户昵称为必填', trigger: 'blur' },
          { max: 20, message: '最多输入20个字符', trigger: 'change' }
        ],
        deptId: [
          { required: true, message: '归属部门为必填', trigger: 'change' }
        ],
        phonenumber: [{ required: true, pattern: new RegExp(/^1[3|4|5|6|7|8|9][0-9]\d{8}$/), message: '格式不合法', trigger: 'change' }],
        email: [{ required: true, type: 'email', message: '格式不合法', trigger: 'change' }],
        userName: [
          { required: true, message: '用户名称为必填', trigger: 'change' }
        ],
        password: [
          { required: true, message: '用户密码为必填', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    // 初始化树菜单
    treeselect()
    .then(res => {
      // 层级遍历赋值给treeData
      this.treeData = res.data
      this.getTreeSelectChildren(this.treeData)
    })
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_user_sex').then(response => {
      this.sexOptions = response.data
    })
    this.getConfigKey('sys.user.initPassword').then(response => {
      this.initPassword = response.msg
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
      if (data) {
        // 修改行为
        this.form = Object.assign({}, data) || {}
        getUser(data.userId).then(response => {
          this.postOptions = response.posts
          this.roleOptions = response.roles
          this.form.postIds = response.postIds
          this.form.roleIds = response.roleIds
          this.form.password = ''
        })
      } else {
        // 新增行为
        getUser().then(response => {
          this.postOptions = response.posts
          this.roleOptions = response.roles
          this.form.password = this.initPassword
        })
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
          if (this.form.userId > 0) {
            // 刷新表格
            updateUser(this.form).then(response => {
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
            addUser(this.form).then(response => {
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
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: '0',
        remark: undefined,
        postIds: [],
        roleIds: []
      }
    }
  }
}
</script>
