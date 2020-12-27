<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
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
                <template v-if="advanced">
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
            <a-button @click="handleGenTableBatch(selectedRows)" type="primary" ghost>生成</a-button>
            <a-button @click="handleDeleteBatch(selectedRowKeys)" :disabled="selectedRowKeys.length === 0">删除</a-button>
            <a-dropdown>
              <a-menu slot="overlay">
                <a-menu-item key="export-data" @click="$refs.importtable.show()">导入</a-menu-item>
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
            :data-source="tableList"
            :row-selection="rowSelection"
            row-key="tableId"
            :pagination="false"
          >
            <!-- 更多选择 -->
            <span slot="action" slot-scope="text, record">
              <a @click="handleGenTable(record)">生成代码</a>
              <a-divider type="vertical" />
              <a-dropdown>
                <a class="ant-dropdown-link">
                  更多 <a-icon type="down" />
                </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a href="javascript:;" @click="$refs.previewcode.show(record)">预览</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;" @click="handleEditTable(record)">编辑</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;" @click="handleDelete(record)">删除</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;" @click="handleSynchDb(record)">同步</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </span>
          </a-table>
          <!-- 预览 -->
          <preview-code ref="previewcode" />
          <!-- 导入 -->
          <import-table ref="importtable" @handle-success="handleOk" />
        </a-card>
      </div>
    </template>
  </page-header-wrapper>
</template>

<script>
import { delTable, listTable, synchDb } from '@/api/tool/gen'
import PreviewCode from './modules/PreviewCode'
import ImportTable from './modules/ImportTable'
import { downLoadZip } from '@/utils/zipdownload'
export default {
  name: 'Gen',
  components: {
    PreviewCode,
    ImportTable
  },
  data () {
    return {
      // 展开/收起搜索框
      advanced: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined
      },
      // 表数据
      tableList: [],
      // 加载变量
      tableLoading: false,
      // 日期选择:
      dateRange: [],
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: 'tableId',
          scopedSlots: { customRender: 'tableId' },
          align: 'center'
        },
        {
          title: '表名称',
          dataIndex: 'tableName'
        },
        {
          title: '表描述',
          dataIndex: 'tableComment',
          scopedSlots: { customRender: 'tableComment' }
        },
        {
          title: '实体',
          dataIndex: 'className',
          scopedSlots: { customRender: 'className' }
        },
        {
          title: '创建时间',
          width: '150',
          dataIndex: 'createTime'
        },
        {
          title: '更新时间',
          width: '150',
          dataIndex: 'updateTime'
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
  created () {
    this.getList()
  },
  methods: {
    /** 查询表集合 */
    getList () {
      this.tableLoading = true
      listTable(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.tableList = response.rows
          this.total = response.total
          this.tableLoading = false
        }
      )
    },
    // 搜索框中的日期选择
    rangePicker (date, dateString) {
      this.dateRange = dateString
    },
    // 搜索框展开、收起
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined
      }
      this.handleQuery()
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const tableId = row.tableId
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 数据表编号为${tableId}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delTable(tableId).then(response => {
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
      const tableIds = ids
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 表编号为${tableIds}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delTable(tableIds).then(response => {
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
    /** 同步数据库操作 */
    handleSynchDb (row) {
      const tableName = row.tableName
      const that = this
      this.$confirm({
        title: '警告',
        content: `确定要强制同步表名为${tableName}的数据项吗?`,
        okText: '同步',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          synchDb(tableName).then(response => {
            if (response.code === 200) {
              that.$message.success('同步成功!')
              that.getList()
            } else {
              that.$message.error(response.msg)
            }
          })
        }
      })
    },
    /** 修改按钮操作 */
    handleEditTable (row) {
      const tableId = row.tableId || this.ids[0]
      this.$router.push({
        path: '/gen/edit/' + tableId
      })
    },
    /** 生成代码操作 */
    handleGenTable (row) {
      if (row) {
        downLoadZip('/code/gen/batchGenCode?tables=' + row.tableName, 'ruoyi')
      }
    },
    /** 生成代码操作 */
    handleGenTableBatch (row) {
      if (row.length === 0) {
        this.$message.error('请最少选择一张表')
      } else {
        const tableNames = []
        row.forEach(element => {
          tableNames.push(element.tableName)
        })
        downLoadZip('/code/gen/batchGenCode?tables=' + tableNames, 'ruoyi')
      }
    },
    handleOk () {
      this.getList()
    }
  }
}
</script>
