<template>
  <div>
    <!-- 顶部的搜索框和按钮 -->
    <div style="margin-bottom: 20px;">
      <el-input
        v-model="searchQuery"
        placeholder="请输入关键字进行搜索"
        style="width: 200px; margin-right: 10px;"
      />
      <el-button type="primary" @click="handleAdd">添加</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedRows.length">批量删除</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      ref="filterTable"
      :data="filteredTableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <!-- 添加多选框 -->
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>

      <el-table-column
        prop="phone"
        label="phone"
        sortable
        width="180"
        column-key="phone"
        :filters="[{text: '2016-05-01', value: '2016-05-01'}, {text: '2016-05-02', value: '2016-05-02'}, {text: '2016-05-03', value: '2016-05-03'}, {text: '2016-05-04', value: '2016-05-04'}]"
        :filter-method="filterHandler"
      >
      </el-table-column>
      <el-table-column
        prop="name"
        label="name"
        width="180">
      </el-table-column>
      <el-table-column
        prop="address"
        label="address"
        :formatter="formatter">
      </el-table-column>
      <el-table-column
        prop="tag"
        label="tag"
        width="100"
        filter-placement="bottom-end">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.tag === 'home' ? 'primary' : 'success'"
            disable-transitions>{{scope.row.tag}}</el-tag>
        </template>
      </el-table-column>
      <!-- 编辑和删除按钮 -->
      <el-table-column
        label="操作"
        align="center">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
            type="text"
            size="small"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '', // 搜索框的内容
      selectedRows: [], // 存储选中的行
      tableData: [{
        phone: '1784561234856',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        tag: 'home'
      }, {
        phone: '1784561234856',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄',
        tag: 'companies'
      }, {
        phone: '1784561234856',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄',
        tag: 'home'
      }, {
        phone: '21784561234856',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄',
        tag: 'companies'
      }]
    };
  },
  computed: {
    filteredTableData() {
      if (this.searchQuery) {
        return this.tableData.filter(row => {
          return Object.keys(row).some(key =>
            String(row[key]).toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        });
      }
      return this.tableData;
    }
  },
  methods: {
    formatter(row, column) {
      return row.address;
    },
    filterTag(value, row) {
      return row.tag === value;
    },
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    },
    handleSelectionChange(val) {
      this.selectedRows = val;
    },
    handleAdd() {
      // 添加功能的逻辑
      this.$message('添加功能未实现');
    },
    handleBatchDelete() {
      // 批量删除功能的逻辑
      this.selectedRows.forEach(row => {
        const index = this.tableData.indexOf(row);
        if (index !== -1) {
          this.tableData.splice(index, 1);
        }
      });
      this.selectedRows = [];
      this.$message('批量删除成功');
    },
    handleEdit(index, row) {
      // 编辑功能的逻辑
      this.$message(`编辑功能未实现: ${row.name}`);
    },
    handleDelete(index, row) {
      this.tableData.splice(index, 1);
      this.$message('删除成功');
    }
  }
};
</script>
