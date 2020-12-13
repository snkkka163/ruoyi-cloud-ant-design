<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="用户名/昵称">
                    <a-input placeholder="请输入" v-model="queryParam.userName"/>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-form-item label="状态">
                    <a-select placeholder="请选择" v-model="queryParam.status">
                      <a-select-option value="-1">全部</a-select-option>
                      <a-select-option value="0">禁用</a-select-option>
                      <a-select-option value="1">正常</a-select-option>
                      <a-select-option value="2">锁定</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <span class="table-page-search-submitButtons">
                    <a-button @click="search" type="primary">查询</a-button>
                    <a-button @click="reset" style="margin-left: 8px">重置</a-button>
                  </span>
                </a-col>
              </a-row>
            </a-form>
          </div>
        </a-card>
      </div>
      <div class="table-page-operator-wrapper">
        <a-button @click="handleAdd" type="primary" ghost>新增</a-button>
        <a-button @click="batchDelete(selectedRowKeys)" :disabled="selectedRowKeys.length === 0">删除</a-button>
        <a-dropdown>
          <a-menu slot="overlay">
            <a-menu-item key="export-data" @click="exprotExcel">导出Excel</a-menu-item>
          </a-menu>
          <a-button>
            更多操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <s-table
        ref="table"
        :columns="columns"
        :data="loadData"
        :row-selection="rowSelection"
        row-key="userId"
      >

        <!-- <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
          <role-panel @add-action="$refs.editPanel.show(record)" :role-ids="record.roleIds || []" action-name="sys:user:update"/>
          <a-divider type="horizontal" :dashed="true" style="margin-bottom: 6px; margin-top: 6px;"/>
          <resource-panel @add-action="$refs.editPanel.show(record)" :resourceIds="record.resourceIds || []" action-name="sys:user:update"/>
        </div>
        <template slot="status" slot-scope="text">
          <a-tag color="red" v-if="text === 2">{{ text|getLabel('sys_user_state') }}</a-tag>
          <a-tag color="green" v-else-if="text === 1">{{ text|getLabel('sys_user_state') }}</a-tag>
          <a-tag v-else>{{ text|getLabel('sys_user_state') }}</a-tag>
        </template>
        <span slot="action" slot-scope="text, record">
          <a @click="$refs.editPanel.show(record)" v-hasPermission="'sys:user:update'">编辑</a>
          <a-divider type="vertical" v-hasPermission="'sys:user:update'"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="$refs.editPanel.show(record, true)">详情</a>
              </a-menu-item>
              <a-menu-item v-if="record.status === 0" v-hasPermission="'sys:user:useable'">
                <a href="javascript:;" @click="updateStatus(record, 1)">启用</a>
              </a-menu-item>
              <a-menu-item v-if="record.status === 1" v-hasPermission="'sys:user:disabled'">
                <a href="javascript:;" @click="updateStatus(record, 0)">禁用</a>
              </a-menu-item>
              <a-menu-item v-if="record.status === 1" v-hasPermission="'sys:user:locked'">
                <a href="javascript:;" @click="updateStatus(record, 2)">锁定</a>
              </a-menu-item>
              <a-menu-item v-if="record.status === 2" v-hasPermission="'sys:user:unlock'">
                <a href="javascript:;" @click="updateStatus(record, 1)">解锁</a>
              </a-menu-item>
              <a-menu-item v-hasPermission="'sys:role:delete'">
                <a href="javascript:;" @click="deleteRecord(record)">删除</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span> -->
      </s-table>
      <create-form
        ref="createModal"
        :visible="visible"
        :columns="columns"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />
      <!-- <user-edit-panel ref="editPanel" @handle-success="formHandleSuccess"/> -->
    </template>
  </page-header-wrapper>
</template>

<script>
import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import { getUserList } from '@/api/system/user'
import { STable, DescriptionList } from '@/components'
import CreateForm from './modules/user/CreateForm'
// import ResourcePanel from '@/views/common/ResourcePanel'
export default {
  name: 'User',
  components: {
    PageHeaderWrapper,
    STable,
    DescriptionList,
    CreateForm
    // ResourcePanel
  },
  data () {
    return {
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      user: {},
      routes: [
        {
          path: 'index',
          breadcrumbName: 'First-level Menu'
        },
        {
          path: 'first',
          breadcrumbName: 'Second-level Menu'
        },
        {
          path: 'second',
          breadcrumbName: 'Third-level Menu'
        }
      ],
      // 表单
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      form: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {
        status: '-1'
      },
      // 表头
      columns: [
        {
          title: '用户编号',
          dataIndex: 'userId'
        },
        {
          title: '用户名',
          dataIndex: 'userName'
        },
        {
          title: '用户名称',
          dataIndex: 'nickName'
        },
        {
          title: '部门',
          dataIndex: 'dept'
        },
        {
          title: '手机号码',
          dataIndex: 'phonenumber'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '创建时间',
          width: '150',
          dataIndex: 'createTime'
        },
        {
          title: '操作',
          width: '150',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const params = Object.assign({}, this.queryParam)
        console.log('加载数据的方法')
        console.log(params)
        if (params.status === '-1') {
          delete params.status
        }
        return getUserList(Object.assign(parameter, params))
          .then(res => {
            return {
              data: res.rows,
              pageSize: 20,
              pageNo: res.rows.size / 20,
              totalCount: res.total
            }
          })
      },

      selectedRowKeys: [],
      selectedRows: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        onSelect: (record, selected, selectedRows) => {},
        onSelectAll: (selected, selectedRows, changeRows) => {}
      }
    }
  },
  created () {
    setTimeout(() => {
      this.loading = !this.loading
    }, 1000)
  },
  methods: {
    search () {
      this.$refs.table.refresh(true)
    },
    reset () {
      this.queryParam = {
        status: '-1'
      }
      this.$refs.table.refresh(true)
    },
    // updateStatus (record, status) {
    //   console.log('更新操作')
    //   console.log(record)
    //   this.$http.put('/user/updateStatus', {
    //     id: record.id,
    //     status: status
    //   }).then(res => {
    //     console.log(res)
    //     if (res.data) {
    //       this.$refs.table.refresh()
    //     }
    //   })
    // },
    // deleteRecord (record) {
    //   const that = this
    //   this.$confirm({
    //     title: '警告',
    //     content: `真的要删除 ${record.nickname} 吗?`,
    //     okText: '删除',
    //     okType: 'danger',
    //     cancelText: '取消',
    //     onOk () {
    //       that.handleDelete([record.id], {
    //         success () {},
    //         done () {}
    //       })
    //     }
    //   })
    // },
    batchDelete (ids) {
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除这 ${ids.length} 位用户吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          that.handleDelete(ids, {
            success () {},
            done () {}
          })
        }
      })
    },
    // handleDelete (ids, callback) {
    //   if (ids.length > 0) {
    //     this.$http.delete('user/' + ids.join(',')).then(res => {
    //       this.$message.success('已成功删除')
    //       this.$refs.table.refresh()
    //       if (callback) {
    //         (typeof callback.done === 'function') && callback.done.call(this)
    //         if (typeof callback.success === 'function') { callback.success.call(this, res) }
    //       }
    //     }).catch(e => {
    //       if (callback) {
    //         (typeof callback.done === 'function') && callback.done.call(this)

    //         if (typeof callback.fail === 'function') { callback.fail.call(this, e) }
    //       }
    //     })
    //   }
    // },
    exprotExcel () {
       console.log('导出excel')
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    formHandleSuccess () {
      console.log('1')
      this.$refs.table.refresh()
    },
    // 动态操作(打开模态框)
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
    },
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.id > 0) {
            // 修改 e.g.
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('修改成功')
            })
          } else {
            // 新增
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('新增成功')
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      this.visible = false

      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    }
  }
}
</script>
