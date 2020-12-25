<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="角色名称">
                    <a-input placeholder="请输入" v-model="queryParams.roleName"/>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-form-item label="权限字符">
                    <a-input placeholder="请输入" v-model="queryParams.roleKey"/>
                  </a-form-item>
                </a-col>
                <template v-if="advanced">
                  <a-col :md="8" :sm="24">
                    <a-form-item label="状态">
                      <a-select placeholder="请选择" v-model="queryParams.status">
                        <a-select-option value="0">正常</a-select-option>
                        <a-select-option value="1">禁用</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="创建时间">
                      <a-range-picker @change="rangePicker" />
                    </a-form-item>
                  </a-col>
                </template>
                <a-col :md="8" :sm="24">
                  <span class="table-page-search-submitButtons">
                    <a-button @click="handleQuery" type="primary">查询</a-button>
                    <a-button @click="resetQuery" style="margin-left: 8px">重置</a-button>
                    <a @click="toggleAdvanced" style="margin-left: 8px">
                      {{ advanced ? '收起' : '展开' }}
                      <a-icon :type="advanced ? 'up' : 'down'"/>
                    </a>
                  </span>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <div class="table-page-operator-wrapper">
            <a-button @click="$refs.createModal.show()" type="primary" ghost>新增</a-button>
            <a-button @click="handleDeleteBatch(selectedRowKeys)" :disabled="selectedRowKeys.length === 0">删除</a-button>
            <a-dropdown>
              <a-menu slot="overlay">
                <a-menu-item key="export-data" @click="handleExport">导出Excel</a-menu-item>
              </a-menu>
              <a-button>
                更多操作 <a-icon type="down" />
              </a-button>
            </a-dropdown>
          </div>
          <!-- 表格 -->
          <a-table
            ref="table"
            :columns="columns"
            :loading="tableLoading"
            :data-source="roleList"
            :row-selection="rowSelection"
            row-key="roleId"
            :pagination="false"
          >
            <!-- 插槽指向状态 -->
            <span slot="status" slot-scope="text, record">
              <a-popconfirm
                ok-text="是"
                cancel-text="否"
                @confirm="confirmHandleStatus(record)"
                @cancel="cancelHandleStatus(record)"
              >
                <span slot="title">确认<b>{{ record.status === '1' ? '启用' : '停用' }}</b>{{ record.roleName }}的角色吗?</span>
                <a-switch checked-children="开" un-checked-children="关" :checked="record.status == 0" />
              </a-popconfirm>
            </span>
            <!-- 更多选择 -->
            <span slot="action" slot-scope="text, record">
              <a @click="$refs.createModal.show(record)">编辑</a>
              <a-divider type="vertical" />
              <a-dropdown>
                <a class="ant-dropdown-link">
                  更多 <a-icon type="down" />
                </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a href="javascript:;" @click="handleDelete(record)">删除</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </span>
          </a-table>
          <!-- 底部分页按钮 -->
          <a-pagination
            class="ant-table-pagination"
            v-model="current"
            :page-size-options="pageSizeOptions"
            :total="total"
            show-size-changer
            :page-size="pageSize"
            @showSizeChange="onShowSizeChange"
            @change="currentPageChange"
          >
            <template slot="buildOptionText" slot-scope="props">
              <span v-if="props.value !== '50'">{{ props.value }}条/页</span>
              <span v-if="props.value === '50'">全部</span>
            </template>
          </a-pagination>
          <!-- 创建/编辑角色,单独封装了组件 -->
          <create-form
            ref="createModal"
            @handle-success="handleOk"
          />
        </a-card>
      </div>
    </template>
  </page-header-wrapper>
</template>

<script>
import { listRole, delRole, changeRoleStatus } from '@/api/system/role'
import CreateForm from './modules/CreateForm'

export default {
  name: 'Role',
  components: {
    CreateForm
  },
  data () {
    return {
      // 分页数据(默认第一页):
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      current: 1,
      pageSize: 10,
      total: 0,
      // 表头
      columns: [
        {
          title: '角色编号',
          dataIndex: 'roleId',
          scopedSlots: { customRender: 'roleId' }
        },
        {
          title: '角色名称',
          dataIndex: 'roleName'
        },
        {
          title: '权限字符',
          dataIndex: 'roleKey'
        },
        {
          title: '显示顺序',
          dataIndex: 'roleSort'
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
      // table加载绑定
      tableLoading: false,
      // 表格数据
      roleList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      // 表格多选
      selectedRowKeys: [],
      selectedRows: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        onSelect: (record, selected, selectedRows) => {},
        onSelectAll: (selected, selectedRows, changeRows) => {}
      },
      // 高级搜索 展开/关闭
      advanced: false,
      // 筛选日期
      dateRange: []
    }
  },
  created () {
    this.getList()
  },
  methods: {
    /** 查询角色列表 */
    getList () {
      this.tableLoading = true
      listRole(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.roleList = response.rows
          this.total = response.total
          this.tableLoading = false
        }
      )
    },
    // 搜索框中的日期选择
    rangePicker (date, dateString) {
      this.dateRange = dateString
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      }
      this.handleQuery()
    },
    // 搜索框展开、收起
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const roleIds = row.roleId || this.ids
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 角色编号为${roleIds}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delRole(roleIds).then(response => {
            if (response.code === 200) {
              that.$message.success('删除成功!')
              that.getList()
            } else {
              that.$message.error(response.msg)
            }
          })
        }
      })
    },
    /** 批量删除按钮操作 */
    handleDeleteBatch (ids) {
      const roleIds = ids
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 角色编号为${roleIds}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delRole(roleIds).then(response => {
            if (response.code === 200) {
              that.$message.success('删除成功!')
              that.getList()
            } else {
              that.$message.error(response.msg)
            }
          })
        }
      })
    },
    // 导入导出excel
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/role/export', {
        ...this.queryParams
      }, `user_${new Date().getTime()}.xlsx`)
    },
    // 新增/修改框事件
    handleOk () {
      this.getList()
    },
    /** pageSize 变化的回调 */
    onShowSizeChange (current, pageSize) {
      this.current = current
      this.pageSize = pageSize
      this.queryParams.pageSize = pageSize
      this.queryParams.pageNum = current
      this.getList()
    },
    /** 页码改变的回调 */
    currentPageChange (current, pageSize) {
      this.current = current
      this.pageSize = pageSize
      this.queryParams.pageSize = pageSize
      this.queryParams.pageNum = current
      this.getList()
    },
    /* 任务状态修改 */
    confirmHandleStatus (row) {
      row.status = row.status === '0' ? '1' : '0'
      const text = row.status === '0' ? '启用' : '停用'
      changeRoleStatus(row.roleId, row.status)
      .then(() => {
        this.$message.success(
          text + '成功',
          3
        )
      }).catch(function () {
        this.$message.error(
          text + '发生异常',
          3
        )
      })
    },
    cancelHandleStatus (row) {
    }
  }
}
</script>
