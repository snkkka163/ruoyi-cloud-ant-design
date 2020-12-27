<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <a-tabs default-active-key="2">
          <a-tab-pane key="1" tab="基本信息" force-render>
            <basic-info-form ref="basicInfo" :info="info" />
          </a-tab-pane>
          <a-tab-pane key="2" tab="字段信息" force-render>
            <!-- 表格 -->
            <a-table
              ref="table"
              :columns="columns"
              :loading="tableLoading"
              :data-source="tableList"
              row-key="columnId"
              :scroll="{ y: tableHeight }"
              :pagination="false"
            >
              <!-- 字段描述 -->
              <template slot="columnComment" slot-scope="text, record">
                <a-input v-model="record.columnComment"></a-input>
              </template>
              <!-- Java类型 -->
              <template slot="javaType" slot-scope="text, record">
                <a-select v-model="record.javaType">
                  <a-select-option value="Long">Long</a-select-option>
                  <a-select-option value="String">String</a-select-option>
                  <a-select-option value="Integer">Integer</a-select-option>
                  <a-select-option value="Double">Double</a-select-option>
                  <a-select-option value="BigDecimal">BigDecimal</a-select-option>
                  <a-select-option value="Date">Date</a-select-option>
                </a-select>
              </template>
              <!-- Java属性 -->
              <template slot="javaField" slot-scope="text, record">
                <a-input v-model="record.javaField"></a-input>
              </template>
              <!-- 插入 -->
              <template slot="isInsert" slot-scope="text, record">
                <a-checkbox :checked="(record.isInsert === '1' ? true : false)"></a-checkbox>
              </template>
              <!-- 编辑 -->
              <template slot="isEdit" slot-scope="text, record">
                <a-checkbox :checked="(record.isEdit === '1' ? true : false)"></a-checkbox>
              </template>
              <!-- 列表 -->
              <template slot="isList" slot-scope="text, record">
                <a-checkbox :checked="(record.isList === '1' ? true : false)"></a-checkbox>
              </template>
              <!-- 查询 -->
              <template slot="isQuery" slot-scope="text, record">
                <a-checkbox :checked="(record.isQuery === '1' ? true : false)"></a-checkbox>
              </template>
              <!-- 查询方式 -->
              <template slot="queryType" slot-scope="text, record">
                <a-select v-model="record.queryType">
                  <a-select-option value="EQ">=</a-select-option>
                  <a-select-option value="NE">!=</a-select-option>
                  <a-select-option value="GT">></a-select-option>
                  <a-select-option value="GTE">>=</a-select-option>
                  <a-select-option value="LT">&lt;</a-select-option>
                  <a-select-option value="LTE">&lt;=</a-select-option>
                  <a-select-option value="LIKE">LIKE</a-select-option>
                  <a-select-option value="BETWEEN">BETWEEN</a-select-option>
                </a-select>
              </template>
              <!-- 必填 -->
              <template slot="isRequired" slot-scope="text, record">
                <a-checkbox :checked="(record.isRequired === '1' ? true : false)"></a-checkbox>
              </template>
              <!-- 显示类型 -->
              <template slot="htmlType" slot-scope="text, record">
                <a-select v-model="record.htmlType">
                  <a-select-option value="input">文本框</a-select-option>
                  <a-select-option value="textarea">文本域</a-select-option>
                  <a-select-option value="select">下拉框</a-select-option>
                  <a-select-option value="radio">单选框</a-select-option>
                  <a-select-option value="checkbox">复选框</a-select-option>
                  <a-select-option value="datetime">日期控件</a-select-option>
                  <a-select-option value="uploadImage">上传控件</a-select-option>
                  <a-select-option value="editor">富文本控件</a-select-option>
                </a-select>
              </template>
              <!-- 字典类型 -->
              <template slot="dictType" slot-scope="text, record">
                <a-select v-model="record.dictType" placeholder="请选择">
                  <a-select-option
                    v-for="item in dictOptions"
                    :key="item.dictType"
                    :value="item.dictType">
                    {{ item.dictName }}
                  </a-select-option>
                </a-select>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="3" tab="生成信息" force-render>
            <gen-info-form ref="genInfo" :info="info" :menus="menus"/>
          </a-tab-pane>
        </a-tabs>
        <a-form label-width="100px">
          <a-form-item style="text-align: center;margin-left:-100px;margin-top:10px;">
            <a-button type="primary" @click="submitForm()" style="margin-right:10px;">提交</a-button>
            <a-button @click="close()">返回</a-button>
          </a-form-item>
        </a-form>
      </div>
    </template>
  </page-header-wrapper>
</template>

<script>
import { getGenTable, updateGenTable } from '@/api/tool/gen'
import { optionselect as getDictOptionselect } from '@/api/system/dict/type'
import { listMenu as getMenuTreeselect } from '@/api/system/menu'
import BasicInfoForm from './BasicInfoForm'
import GenInfoForm from './GenInfoForm'
export default {
  name: 'GenEdit',
  components: {
    BasicInfoForm,
    GenInfoForm
  },
  data () {
    return {
      // 表格的高度
      tableHeight: document.documentElement.scrollHeight - 245 + 'px',
      // 表格加载
      tableLoading: false,
      // 字典信息
      dictOptions: [],
      // 菜单信息
      menus: [],
      // 表详细信息
      info: {},
      // 表数据
      tableList: [],
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: 'columnId',
          scopedSlots: { customRender: 'columnId' },
          align: 'center',
          width: '5%'
        },
        {
          title: '字段列名',
          dataIndex: 'columnName',
          width: '10%'
        },
        {
          title: '字段描述',
          dataIndex: 'columnComment',
          scopedSlots: { customRender: 'columnComment' },
          width: '10%'
        },
        {
          title: '物理类型',
          dataIndex: 'columnType',
          scopedSlots: { customRender: 'columnType' },
          width: '10%'
        },
        {
          title: 'Java类型',
          dataIndex: 'javaType',
          scopedSlots: { customRender: 'javaType' },
          width: '11%'
        },
        {
          title: 'java属性',
          dataIndex: 'javaField',
          scopedSlots: { customRender: 'javaField' },
          width: '10%'
        },
        {
          title: '插入',
          dataIndex: 'isInsert',
          scopedSlots: { customRender: 'isInsert' },
          width: '5%'
        },
        {
          title: '编辑',
          dataIndex: 'isEdit',
          scopedSlots: { customRender: 'isEdit' },
          width: '5%'
        },
        {
          title: '列表',
          dataIndex: 'isList',
          scopedSlots: { customRender: 'isList' },
          width: '5%'
        },
        {
          title: '查询',
          dataIndex: 'isQuery',
          scopedSlots: { customRender: 'isQuery' },
          width: '5%'
        },
        {
          title: '查询方式',
          dataIndex: 'queryType',
          scopedSlots: { customRender: 'queryType' },
          width: '10%'
        },
        {
          title: '必填',
          dataIndex: 'isRequired',
          scopedSlots: { customRender: 'isRequired' },
          width: '5%'
        },
        {
          title: '显示类型',
          dataIndex: 'htmlType',
          scopedSlots: { customRender: 'htmlType' },
          width: '12%'
        },
        {
          title: '字典类型',
          dataIndex: 'dictType',
          scopedSlots: { customRender: 'dictType' },
          width: '12%'
        }
      ]
    }
  },
  created () {
    const tableId = this.$route.params && this.$route.params.tableId
    this.tableLoading = true
    if (tableId) {
      // 获取表详细信息
      getGenTable(tableId).then(res => {
        this.tableList = res.data.rows
        this.info = res.data.info
        this.tableLoading = false
      })
      /** 查询字典下拉列表 */
      getDictOptionselect().then(response => {
        this.dictOptions = response.data
      })
      /** 查询菜单下拉列表 */
      getMenuTreeselect().then(response => {
        this.menus = this.handleTree(response.data, 'menuId')
      })
    }
  },
  methods: {
      /** 提交按钮 */
    submitForm () {
      const basicForm = this.$refs.basicInfo.info
      const genForm = this.$refs.genInfo.info

      if (basicForm && genForm) {
          const genTable = Object.assign({}, basicForm, genForm)
          genTable.columns = basicForm.columns
          genTable.params = {
            treeCode: genTable.treeCode,
            treeName: genTable.treeName,
            treeParentCode: genTable.treeParentCode,
            parentMenuId: genTable.parentMenuId
          }
          updateGenTable(genTable).then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg)
              this.close()
            } else {
              this.$message.error(res.msg)
            }
          })
        } else {
          this.msgError('表单校验未通过，请重新检查提交内容')
        }
    },
    /** 关闭按钮 */
    close () {
      this.$router.push({ path: '/tool/gen' })
    }
  }
}
</script>
