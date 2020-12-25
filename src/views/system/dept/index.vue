<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="部门名称">
                    <a-input placeholder="请输入" v-model="queryParams.deptName"/>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-form-item label="状态">
                    <a-select placeholder="请选择" v-model="queryParams.status">
                      <a-select-option
                        v-for="dict in statusOptions"
                        :key="dict.dictValue"
                        :value="dict.dictValue">
                        {{ dict.dictLabel }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <span class="table-page-search-submitButtons">
                    <a-button @click="handleQuery" type="primary">查询</a-button>
                    <a-button @click="resetQuery" style="margin-left: 8px">重置</a-button>
                  </span>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <div class="table-page-operator-wrapper">
            <a-button @click="$refs.createModal.show()" type="primary" ghost>新增</a-button>
          </div>
          <!-- 表格 -->
          <a-table
            ref="table"
            :columns="columns"
            :loading="tableLoading"
            :data-source="deptList"
            :row-selection="rowSelection"
            row-key="deptId"
            :pagination="false"
          >
            <!-- 插槽指向状态 -->
            <span slot="status" slot-scope="text">
              <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
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
          <!-- 创建/编辑部门,单独封装了组件 -->
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
// import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import { listDept, delDept } from '@/api/system/dept'
import CreateForm from './modules/CreateForm'
const statusMap = {
  0: {
    status: 'processing',
    text: '正常'
  },
  1: {
    status: 'default',
    text: '停用'
  }
}
export default {
  name: 'Dept',
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
      statusMap: [],
      tableLoading: false,
      // 表格树数据
      deptList: [],
      // 部门树选项
      deptOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        deptName: undefined,
        status: undefined
      },
      // 表头
      columns: [
        {
          title: '部门名称',
          dataIndex: 'deptName',
          scopedSlots: { customRender: 'deptName' }
        },
        {
          title: '排序',
          dataIndex: 'orderNum'
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
      }
    }
  },
  // 状态过滤
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    }
  },
  created () {
    this.getList()
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询部门列表 */
    getList () {
      this.tableLoading = true
      listDept(this.queryParams).then(response => {
        this.deptList = this.handleTree(response.data, 'deptId')
        this.total = response.total
        this.tableLoading = false
      })
    },
    /** 转换部门数据结构 */
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      }
    },
    // 字典状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 新增/修改框事件
    handleOk () {
      this.getList()
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const deptId = row.deptId
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 部门编号为${deptId}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delDept(deptId).then(response => {
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
    }
  }
}
</script>
