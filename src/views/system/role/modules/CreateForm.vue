<template>
  <a-modal
    ref="createModal"
    :title="readOnly ? '详情' : (form.roleId ? '角色编辑' : '新增操作')"
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
        <a-form-model-item ref="roleName" label="角色名称" prop="roleName">
          <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.roleName" placeholder="请输入用户昵称" />
        </a-form-model-item>
        <a-form-model-item ref="roleKey" label="权限字符" prop="roleKey">
          <a-input :disabled="!readOnly && typeof form.id !== 'undefined'" v-model="form.roleKey" placeholder="请输入用户昵称" />
        </a-form-model-item>
        <a-form-model-item ref="roleSort" label="排序" prop="roleSort">
          <a-input-number v-model="form.roleSort" :min="0" :max="100" />
        </a-form-model-item>
        <a-form-model-item ref="status" label="状态" prop="status">
          <a-radio-group name="radioGroup" v-model="form.status">
            <a-radio :value="'0'">
              正常
            </a-radio>
            <a-radio :value="'2'">
              停用
            </a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item ref="menuIds" label="菜单权限" prop="menuIds">
          <a-tree-select
            v-model="form.menuIds"
            style="width: 100%"
            :tree-data="menuOptions"
            tree-checkable
            search-placeholder="Please select"
            :replaceFields="treeReplaceFields"
          />
        </a-form-model-item>
        <a-form-model-item ref="remark" label="备注" prop="remark">
          <a-textarea v-model="form.remark" placeholder="Basic usage" :rows="4" />
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
// import pick from 'lodash.pick'
import { addRole, updateRole } from '@/api/system/role'
import { treeselect as menuTreeselect, roleMenuTreeselect } from '@/api/system/menu'
import { treeselect as deptTreeselect, roleDeptTreeselect } from '@/api/system/dept'
// 表单字段
export default {
  data () {
    return {
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
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
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: '0',
        menuIds: [],
        deptIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined
      },
      // 输入框校验:
      rules: {
        roleName: [
          { required: true, message: '角色名称为必填', trigger: 'blur' },
          { max: 20, message: '最多输入20个字符', trigger: 'change' }
        ],
        roleKey: [
          { required: true, message: '角色标识符为必填', trigger: 'change' }
        ],
        roleSort: [
          { required: true, message: '角色顺序为必填', trigger: 'change' }
        ]
        // pattern: new RegExp('^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\\.[a-zA-Z0-9_-]{2,3}){1,2})$')
        // ,resourceIds: [{ required: true, message: '此项为必选项', trigger: 'select' }]
      },
      treeReplaceFields: {
        children: 'children',
        title: 'label',
        key: 'id',
        value: 'id'
      }
    }
  },
  // created () {
  // },
  methods: {
    /** 查询菜单树结构 */
    getMenuTreeselect () {
      menuTreeselect().then(response => {
        this.menuOptions = response.data
        console.log('菜单树结构:')
        console.log(this.menuOptions)
      })
    },
    /** 查询部门树结构 */
    getDeptTreeselect () {
      deptTreeselect().then(response => {
        this.deptOptions = response.data
      })
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect (roleId) {
      return roleMenuTreeselect(roleId).then(response => {
        this.menuOptions = response.menus
        return response
      })
    },
    /** 根据角色ID查询部门树结构 */
    getRoleDeptTreeselect (roleId) {
      return roleDeptTreeselect(roleId).then(response => {
        this.deptOptions = response.depts
        return response
      })
    },
    // 由于要用传进来的值做判断,将显示和隐藏放在内部做处理
    show (data, readOnly) {
      console.log(data)
      if (data) {
        // 修改行为
        this.form = Object.assign({}, data) || {}
        console.log('此时的值')
        console.log(this.form)
        this.getMenuTreeselect()
        const roleMenu = this.getRoleMenuTreeselect(this.form.roleId)
        roleMenu.then(response => {
           this.form.menuIds = response.checkedKeys
        })
      } else {
        // 新增行为
        // 刷新表单,查询角色树
        this.reset()
        this.getMenuTreeselect()
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
      console.log('点击确定了')
      this.confirmLoading = true
      this.$refs.ruleForm.validate(valid => {
        const params = Object.assign({}, this.form)
        if (valid) {
          (this.form.roleId ? this.$http.put : this.$http.post)('user', params).then(res => {
            // 进行新增行为:
            if (this.form.roleId > 0) {
              // 刷新表格
              updateRole(this.form).then(response => {
                if (response.code === 200) {
                  this.$message.success('修改成功')
                  // 关闭本组件
                  this.visible = false
                  // 调用外部刷新列表方法
                  this.$emit('handle-success')
                  // 刷新表单
                  this.reset()
                } else {
                  this.$message.error(response.msg)
                  this.confirmLoading = false
                }
              })
            } else {
              // 新增
              addRole(this.form).then(response => {
                if (response.code === 200) {
                  this.$message.success('新增成功')
                  // 关闭本组件
                  this.visible = false
                  // 调用外部刷新列表方法
                  this.$emit('handle-success')
                  // 刷新表单
                  this.reset()
                } else {
                  this.$message.error(response.msg)
                  this.confirmLoading = false
                }
              })
            }
          }).catch(e => {
            this.confirmLoading = false
          })
        } else {
          return (this.confirmLoading = false)
        }
      })
    },
    // 表单重置
    reset () {
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: '0',
        menuIds: [],
        deptIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined
      }
    }
  }
}
</script>
