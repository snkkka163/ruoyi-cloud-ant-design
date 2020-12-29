<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-card :bordered="false" class="content">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="登录地址">
                    <a-input placeholder="请输入" v-model="queryParams.ipaddr"/>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-form-item label="用户名称">
                    <a-input placeholder="请输入" v-model="queryParams.userName"/>
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
          <!-- 表格 -->
          <a-table
            ref="table"
            :columns="columns"
            :loading="tableLoading"
            :data-source="list"
            row-key="tokenId"
            :pagination="false"
          >
            <span slot="loginTime" slot-scope="record">
              {{ parseTime(record) }}
            </span>

            <!-- 更多选择 -->
            <span slot="action" slot-scope="text, record">
              <a @click="handleForceLogout(record)" v-hasPermi="['monitor:online:forceLogout']">强退</a>
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
        </a-card>
      </div>
    </template>
  </page-header-wrapper>
</template>

<script>
import { list, forceLogout } from '@/api/monitor/online'
export default {
  name: 'Online',
  data () {
    return {
      // 分页数据(默认第一页):
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      current: 1,
      pageSize: 10,
      total: 0,
      // 表格等待
      tableLoading: false,
      // 表格数据
      list: [],
      // 查询参数
      queryParams: {
        ipaddr: undefined,
        userName: undefined
      },
      columns: [
        {
          title: '序号',
          dataIndex: 'indexId',
          scopedSlots: { customRender: 'indexId' },
          align: 'center'
        },
        {
          title: '会话编号',
          dataIndex: 'tokenId',
          align: 'center'
        },
        {
          title: '登录名称',
          dataIndex: 'userName',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '主机',
          dataIndex: 'ipaddr',
          scopedSlots: { customRender: 'ipaddr' },
          align: 'center'
        },
        {
          title: '登录时间',
          dataIndex: 'loginTime',
          scopedSlots: { customRender: 'loginTime' },
          align: 'center'
        },
        {
          title: '操作',
          width: '150',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },
  created () {
    this.getList()
  },
  methods: {
    /** 查询登录日志列表 */
    getList () {
      this.tableLoading = true
      list(this.queryParams).then(response => {
        this.list = response.rows
        this.total = response.total
        this.tableLoading = false
        this.list = this.list.map((item, index) => {
            return Object.assign(item, { 'indexId': (index + 1) })
        })
      })
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.current = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.queryParams = {
        ipaddr: undefined,
        userName: undefined
      }
      this.handleQuery()
    },
    /** 强退按钮操作 */
    handleForceLogout (row) {
      const that = this
      this.$confirm({
        title: '警告',
        content: `是否确认强退名称为${row.userName}的用户?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          forceLogout(row.tokenId).then(response => {
            if (response.code === 200) {
              that.$message.success('强退成功!')
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
