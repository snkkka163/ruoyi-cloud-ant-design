<template>
  <div
  :parendDictId="parendDictId"
  :visible="true">
      <div class="page-header-content">
        <div class="table-page-operator-wrapper">
          <a-button @click="$refs.dataCreateModal.show(Object.assign({}),defaultDictType)" type="primary" ghost>新增</a-button>
          <a-button @click="handleDeleteBatch(selectedRowKeys)" :disabled="selectedRowKeys.length === 0">删除</a-button>
          <a-dropdown>
            <a-menu slot="overlay">
              <a-menu-item key="export-data1" @click="handleExport">导出Excel</a-menu-item>
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
          :data-source="dataList"
          :row-selection="rowSelection"
          row-key="dictCode"
          :pagination="false"
        >
          <!-- 更多选择 -->
          <span slot="action" slot-scope="text, record">
            <a @click="$refs.dataCreateModal.show(record,defaultDictType)">编辑</a>
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
          <!-- 插槽指向状态 -->
          <span slot="status" slot-scope="text, record">
            {{ statusFormat(record) }}
          </span>
          <!-- 插槽指向状态 -->
          <span slot="dictType" slot-scope="text, record">
            <router-link :to="'/dict/type/data/' + record.dictId" class="link-type">
              <span>{{ record.dictType }}</span>
            </router-link>
          </span>
        </a-table>
        <!-- 创建/编辑字典,单独封装了组件 -->
        <data-create-form
          ref="dataCreateModal"
          @handle-success="handleOk"
        />
      </div>
  </div>
</template>

<script>
import { delData, listData } from '@/api/system/dict/data'
import { getType, listType } from '@/api/system/dict/type'
import DataCreateForm from './dataCreateForm'
export default {
  name: 'SubDataTable',
  props: {
    parendDictId: {
      type: Number,
      required: true
    }
  },
  components: {
    DataCreateForm
  },
  data () {
    return {
      // 默认字典类型
      defaultDictType: '',
      // 字典表格数据
      dataList: [],
      // 状态数据字典
      statusOptions: [],
      // 类型数据字典
      typeOptions: [],
      tableLoading: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined
      },
      // 表格字段
      columns: [
        {
          title: '字典编码',
          dataIndex: 'dictCode',
          align: 'center'
        },
        {
          title: '字典标签',
          dataIndex: 'dictLabel',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '字典键值',
          dataIndex: 'dictValue',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '字典排序',
          dataIndex: 'dictSort',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '状态',
          dataIndex: 'status',
          ellipsis: true,
          scopedSlots: { customRender: 'status' },
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
    const dictId = this.parendDictId
    this.getTypeData(dictId)
    this.getTypeList()
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询字典类型详细 */
    getTypeData (dictId) {
      getType(dictId).then(response => {
        this.queryParams.dictType = response.data.dictType
        this.defaultDictType = response.data.dictType
        console.log(this.defaultDictType)
        this.getList()
      })
    },
    /** 查询字典类型列表 */
    getTypeList () {
      listType().then(response => {
        this.typeOptions = response.rows
      })
    },
    /** 查询字典数据列表 */
    getList () {
      this.tableLoading = true
      listData(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.tableLoading = false
      })
    },
    // 数据状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/dict/data/export', {
        ...this.queryParams
      }, `data_${new Date().getTime()}.xlsx`)
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const dictCode = row.dictCode
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 字典编号为${dictCode}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delData(dictCode).then(response => {
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
      const dictCodes = ids
      const that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 字典项编号为${dictCodes}的数据项吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          delData(dictCodes).then(response => {
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
    // 新增/修改框事件
    handleOk () {
      this.getList()
    }
  }
}
</script>
