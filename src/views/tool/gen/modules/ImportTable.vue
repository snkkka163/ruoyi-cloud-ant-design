<template>
    <a-modal
        ref="createModal"
        :title="'导入代码'"
        :width="900"
        :visible="visible"
        @cancel="close"
        @ok="confirm"
        :confirmLoading="confirmLoading"
    >
    <div class="table-page-search-wrapper">
        <a-form layout="inline">
            <a-row :gutter="48">
            <a-col :md="8" :sm="24">
                <a-form-item label="表名称">
                <a-input placeholder="请输入" v-model="queryParams.tableName"/>
                </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
                <a-form-item label="表描述">
                <a-input placeholder="请输入" v-model="queryParams.tableComment"/>
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
    <div class="page-header-content">
        <a-card :bordered="false" class="content">
        <!-- 表格 -->
        <a-table
            ref="table"
            :columns="columns"
            :loading="tableLoading"
            :data-source="dbTableList"
            :row-selection="rowSelection"
            row-key="tableName"
            :scroll="{ y: tableHeight }"
            :pagination="false"
        >
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
        </a-card>
        </div>
    </a-modal>
</template>
<script>
import { listDbTable, importTable } from '@/api/tool/gen'
export default {
  name: 'ImportTable',
  props: {
    info: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
        // 表格的高度
      tableHeight: document.documentElement.scrollHeight - 500 + 'px',
      // 分页数据(默认第一页):
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      current: 1,
      pageSize: 10,
      total: 0,
      // 当前控件配置:
      confirmLoading: false,
      visible: false,
      // 表格数据
      dbTableList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined
      },
      // 表格加载事件
      tableLoading: false,
      // 表格属性
      columns: [
        {
          title: '表名称',
          dataIndex: 'tableName',
          align: 'center'
        },
        {
          title: '表描述',
          dataIndex: 'tableComment',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          scopedSlots: { customRender: 'createTime' },
          align: 'center'
        },
        {
          title: '更新时间',
          dataIndex: 'updateTime',
          scopedSlots: { customRender: 'updateTime' },
          align: 'center'
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
  created () {
    this.getList()
  },
  methods: {
    // 查询表数据
    getList () {
      this.tableLoading = true
      listDbTable(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dbTableList = res.rows
          this.total = res.total
          this.tableLoading = false
        }
      })
    },
    // 关闭模态框
    close () {
      this.visible = false
    },
    // 打开抽屉(由外面的组件调用)
    show (data) {
      if (data) {
        this.data = data
      }
      this.visible = true
    },
    // 确认导入
    confirm () {
      importTable({ tables: this.selectedRowKeys.join(',') }).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.visible = false
          // 调用外部刷新列表方法
          this.$emit('handle-success')
        } else {
          this.$message.error(res.msg)
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
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined
      }
      this.handleQuery()
    }
  }
}
</script>
