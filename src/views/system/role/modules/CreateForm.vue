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
          <a-radio-group button-style="solid" v-model="form.status">
            <a-radio-button
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :value="dict.dictValue">
              {{ dict.dictLabel }}
            </a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item ref="menuIds" label="菜单权限" prop="menuIds">
          <!-- <a-tree-select
            :showCheckedStrategy="'SHOW_ALL'"
            :multiple="true"
            v-model="form.menuIds"
            style="width: 100%"
            :tree-data="menuOptions"
            tree-checkable
            search-placeholder="Please select"
            :replaceFields="treeReplaceFields"
            allow-clear
          /> -->
          <a-tree
            v-model="menuCheckedKeys"
            checkable
            :checkStrictly="!form.menuCheckStrictly"
            :expanded-keys="menuExpandedKeys"
            :auto-expand-parent="autoExpandParent"
            :tree-data="menuOptions"
            @check="onCheck"
            @expand="onExpandMenu"
            :replaceFields="defaultProps"
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
import { addRole, updateRole } from '@/api/system/role'
import { treeselect as menuTreeselect, roleMenuTreeselect } from '@/api/system/menu'
import { treeselect as deptTreeselect, roleDeptTreeselect } from '@/api/system/dept'
// 表单字段
export default {
  data () {
    return {
      menuExpandedKeys: [],
      autoExpandParent: false,
      menuCheckedKeys: [],
      halfCheckedKeys: [],
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
      },
      defaultProps: {
        children: 'children',
        title: 'label',
        key: 'id'
      }
    }
  },
  created () {
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询菜单树结构 */
    getMenuTreeselect () {
      menuTreeselect().then(response => {
        this.menuOptions = response.data
      })
    },
    /** 查询部门树结构 */
    getDeptTreeselect () {
      deptTreeselect().then(response => {
        this.deptOptions = response.data
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
      if (data) {
        // 修改行为
        this.form = Object.assign({}, data) || {}
        this.getMenuTreeselect()
        const roleMenu = this.getRoleMenuTreeselect(this.form.roleId)
        roleMenu.then(response => {
          this.menuCheckedKeys = response.checkedKeys
          // 过滤回显时的半选中node(父)
          if (this.form.menuCheckStrictly) {
            this.selectNodefilter(this.menuOptions, [])
          }
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
      this.confirmLoading = true
      this.$refs.ruleForm.validate(valid => {
        // 解决ant design vue选择树的弊端(半选中的节点没有被考虑进来，与若依菜单树规则不匹配)
        // 给每个节点加parentId 方便后面使用
        this.insertTreeParentId()
        // 判断每一项的父节点是否存在，不存在则补充
        // this.insertParentIdToMenus()
        if (valid) {
          // 进行新增/修改行为:
          if (this.form.roleId > 0) {
            // 修改
            this.form.menuIds = this.getMenuAllCheckedKeys()
            updateRole(this.form).then(response => {
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
            this.form.menuIds = this.getMenuAllCheckedKeys()
            addRole(this.form).then(response => {
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
      if (this.$refs.menu !== undefined) {
        this.menuCheckedKeys = []
        this.halfCheckedKeys = []
      }
      this.menuExpand = false
      this.menuNodeAll = false
      this.menuExpandedKeys = []
      this.autoExpandParent = false
      this.menuCheckedKeys = []
      this.halfCheckedKeys = []
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
    },
    insertTreeParentId () {
      this.menuOptions = this.menuOptions.map((element) => {
          element = Object.assign({}, element, { parentId: 0 })
          if (element.children) {
            element.children = this.insertTreeParentIdSub(element, element.children)
         }
         return element
      })
    },

    insertTreeParentIdSub (parent, data) {
      const parendId = parent.id
      data = data.map((element) => {
        element = Object.assign({}, element, { parentId: parendId })
        if (element.children) {
         element.children = this.insertTreeParentIdSub(element, element.children)
        }
        return element
      })
      return data
    },
    getParentIdByMenuId (data, menuId) {
      let result = -1
      data.forEach(element => {
        const loop = loopData => {
          if (menuId === loopData.id && loopData.parentId !== 0) {
            // return element.parentId
            result = loopData.parentId
            return loopData.parentId
          }
          if (loopData.children) {
            for (let i = 0; i < loopData.children.length; i++) {
              loop(loopData.children[i], menuId)
            }
          }
        }
        loop(element)
      })
      return result
    },
    insertParentIdToMenus (menuId) {
      // 判断是否都已经符合条件
      let flag = true
      this.form.menuIds.forEach(element => {
        const parentId = this.getParentIdByMenuId(this.menuOptions, element)
        const isExist = this.isExisMenusItem(parentId)
        if (isExist === -1) {
          flag = false
        }
      })
      if (flag) {
        return
      }
      if (menuId) {
        this.form.menuIds.forEach(element => {
          const loop = loopData => {
            // 获取其父节点id判断是否存在 不存在补充进去
            const parentId = this.getParentIdByMenuId(this.menuOptions, loopData)
            const isExist = this.isExisMenusItem(parentId)
            if (isExist === -1) {
              this.form.menuIds.push(parentId)
            }
            if (parentId !== 0) {
              // 说明还不是最终节点,继续找
              this.insertParentIdToMenus(parentId)
            }
          }
          loop(element)
        })
      } else {
        const parentId = this.getParentIdByMenuId(this.menuOptions, menuId)
        const isExist = this.isExisMenusItem(parentId)
        if (isExist === -1) {
          this.form.menuIds.push(parentId)
        }
        if (parentId !== 0) {
          // 说明还不是最终节点,继续找
          this.insertParentIdToMenus(parentId)
        }
      }
    },
    isExisMenusItem (data) {
      let flag = -1
      for (let index = 0; index < this.form.menuIds.length; index++) {
        const element = this.form.menuIds[index]
        if (element === data || element === 0) {
          flag = 1
          return flag
        }
      }
      return flag
    },
    onExpandMenu (expandedKeys) {
      this.menuExpandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    // 所有菜单节点数据
    getMenuAllCheckedKeys () {
      // 全选与半选
      return this.menuCheckedKeys.concat(this.halfCheckedKeys)
    },
    getAllMenuNode (nodes) {
      if (!nodes || nodes.length === 0) {
        return []
      }
      nodes.forEach(node => {
        this.menuCheckedKeys.push(node.id)
        return this.getAllMenuNode(node.children)
      })
    },
    // 回显过滤
    selectNodefilter (nodes, parentIds) {
      if (!nodes || nodes.length === 0) {
        return []
      }
      nodes.forEach(node => {
        // 父子关联模式且当前元素有父级
        const currentIndex = this.menuCheckedKeys.indexOf(node.id)
        // 当前节点存在,且父节点不存在，则说明父节点应是半选中状态
        if (currentIndex !== -1) {
          parentIds.forEach(parentId => {
            if (this.halfCheckedKeys.indexOf(parentId) === -1) {
              this.halfCheckedKeys.push(parentId)
            }
          })
          parentIds = []
        }
        // 防重
        const isExist = this.halfCheckedKeys.indexOf(node.id)
        const isExistParentIds = parentIds.indexOf(node.id)
        if (isExist === -1 && isExistParentIds === -1 && currentIndex === -1) {
          parentIds.push(node.id)
        }
        return this.selectNodefilter(node.children, parentIds)
      })
    },
    handleCheckedTreeNodeAll (value) {
      if (value.target.checked) {
        this.getAllMenuNode(this.menuOptions)
      } else {
        this.menuCheckedKeys = []
        this.halfCheckedKeys = []
      }
    },
    handleCheckedTreeExpand (value) {
      if (value.target.checked) {
        const treeList = this.menuOptions
        for (let i = 0; i < treeList.length; i++) {
          this.menuExpandedKeys.push(treeList[i].id)
        }
      } else {
        this.menuExpandedKeys = []
      }
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect (value) {
      this.form.menuCheckStrictly = !this.form.menuCheckStrictly
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect (roleId) {
      return roleMenuTreeselect(roleId).then(response => {
        this.menuOptions = response.menus
        return response
      })
    },
    onCheck (checkedKeys, info) {
      if (!this.form.menuCheckStrictly) {
        let currentCheckedKeys = []
        if (this.menuCheckedKeys.checked) {
          currentCheckedKeys = currentCheckedKeys.concat(this.menuCheckedKeys.checked)
        }
        if (this.menuCheckedKeys.halfChecked) {
          currentCheckedKeys = currentCheckedKeys.concat(this.menuCheckedKeys.halfChecked)
        }
        this.menuCheckedKeys = currentCheckedKeys
      } else {
        // 半选节点
        this.halfCheckedKeys = info.halfCheckedKeys
        this.menuCheckedKeys = checkedKeys
      }
    }
  }
}
</script>
