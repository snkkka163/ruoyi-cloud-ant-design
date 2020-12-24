<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
                <a-row :gutter="48">
                  <a-col :md="8" :sm="24">
                    <a-form-item label="参数名称">
                      <a-input placeholder="请输入" v-model="queryParams.configName"/>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="参数键名">
                      <a-input placeholder="请输入" v-model="queryParams.configKey"/>
                    </a-form-item>
                  </a-col>
                  <template v-if="advanced">
                    <a-col :md="8" :sm="24">
                      <a-form-item label="系统内置">
                        <a-radio-group button-style="solid" v-model="queryParams.configType">
                          <a-radio-button
                            v-for="dict in typeOptions"
                            :key="dict.dictValue"
                            :value="dict.dictValue">
                              {{ dict.dictLabel }}
                          </a-radio-button>
                        </a-radio-group>
                      </a-form-item>
                    </a-col>
                    <a-col :md="8" :sm="24">
                      <a-form-item label="创建时间">
                        <!--  @change="onChange" -->
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
                <a-menu-item key="export-data1" @click="handleExport">导出Excel</a-menu-item>
                <a-menu-item key="export-data2" @click="handleClearCache">清除缓存</a-menu-item>
              </a-menu>
              <a-button>
                更多操作 <a-icon type="down" />
              </a-button>
            </a-dropdown>
          </div>
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
            <!-- 表格 -->
            <a-table
              ref="table"
              :columns="columns"
              :loading="tableLoading"
              :data-source="configList"
              :row-selection="rowSelection"
              row-key="configId"
              :pagination="false"
            >
              <!-- 插槽指向状态 -->
              <span slot="configType" slot-scope="text, record">
                {{ typeFormat(record) }}
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
            <!-- 创建/编辑配置,单独封装了组件 -->
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
import { listConfig, clearCache, delConfig } from '@/api/system/config'
import CreateForm from './modules/CreateForm'
export default {
  name: 'Config',
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
      // 高级搜索 展开/关闭
      advanced: false,
      // 时间选择器
      dateRange: [],
      // 类型数据字典
      typeOptions: [],
      // 参数表格数据
      configList: [],
      // 表格等待
      tableLoading: false,
      // 表格字段
      columns: [
        {
          title: '参数主键',
          dataIndex: 'configId',
          align: 'center'
        },
        {
          title: '参数名称',
          dataIndex: 'configName',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '参数键名',
          dataIndex: 'configKey',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '参数键值',
          dataIndex: 'configValue',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '系统内置',
          dataIndex: 'configType',
          scopedSlots: { customRender: 'configType' },
          align: 'center'
        },
        {
          title: '备注',
          dataIndex: 'remark',
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
          title: '操作',
          width: '150',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        configName: undefined,
        configKey: undefined,
        configType: undefined
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
      }
    }
  },
  created () {
    this.getList()
    this.getDicts('sys_yes_no').then(response => {
      this.typeOptions = response.data
    })
  },
  methods: {
    // 新增/修改框事件
    handleOk () {
      this.getList()
    },
    // 搜索框展开、收起
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    /** 查询定时任务列表 */
    getList () {
      this.tableLoading = true
      listConfig(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.configList = response.rows
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
        configName: undefined,
        configKey: undefined,
        configType: undefined
      }
      this.handleQuery()
    },
    // 参数系统内置字典翻译
    typeFormat (row) {
      return this.selectDictLabel(this.typeOptions, row.configType)
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/config/export', {
        ...this.queryParams
      }, `config_${new Date().getTime()}.xlsx`)
    },
    /** 清理缓存按钮操作 */
    handleClearCache () {
      clearCache().then(response => {
        this.$message.success('清除成功!')
      })
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const configId = row.configId
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 部门编号为${configId}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delConfig(configId).then(response => {
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
      const configIds = ids
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 角色编号为${configIds}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delConfig(configIds).then(response => {
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
