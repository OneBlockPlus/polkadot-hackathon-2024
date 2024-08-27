<template>
  <el-container style="flex-direction: column; width: 100%; overflow-y: auto;">
    <!-- User Type Module -->
<!--    <el-card style="margin-bottom: 20px; width: 100%;">-->
<!--      <h3>User Type</h3>-->
<!--      <el-radio-group v-model="userType">-->
<!--        <el-radio-button label="Regular User" />-->
<!--        <el-radio-button label="Artist" />-->
<!--      </el-radio-group>-->
<!--    </el-card>-->

    <!-- Total Income, Monthly Income, Pending Settlement Module -->
    <el-card style="margin-bottom: 20px; width: 100%;">
      <el-row :gutter="20">
        <el-col :span="8">
          <div>
            <h3>Total Income</h3>
            <div class="font-bold" style="color:red">{{ totalIncome }} DOT</div>
            <div>≈ $9,914.70 USD </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div>
            <h3>Monthly Income</h3>
            <div class="font-bold" style="color:green">{{ monthlyIncome }} DOT</div>
            <div>Compared to last month
              <span style="color:green">+12%</span>
              </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div>
            <h3>Pending Settlement</h3>
            <div class="font-bold" style="color:blue">{{ pendingSettlement }} DOT</div>
            <div>Expected to arrive in 3 days</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- Income Trend Module -->
    <el-card style="margin-bottom: 20px; width: 100%;">
      <v-chart :option="incomeTrendOption" style="height: 400px; width: 100%;" />
    </el-card>

    <!-- NFT Sales Analysis Module -->
    <el-card style="margin-bottom: 20px; width: 100%;">
      <v-chart :option="nftSalesOption" style="height: 400px; width: 100%;" />
    </el-card>

    <!-- Fan Support Module -->
    <el-card style="margin-bottom: 20px; width: 100%;">
      <v-chart :option="fanSupportOption" style="height: 400px; width: 100%;" />
    </el-card>

    <!-- Recent Transactions Module -->
    <el-card style="margin-bottom: 20px; width: 100%;">
      <h3>Recent Transactions</h3>
      <el-table :data="recentTransactions" style="width: 100%;">
        <el-table-column prop="date" label="Date" />
        <el-table-column prop="description" label="Description" />
        <el-table-column prop="amount" label="Amount" />
      </el-table>
    </el-card>
  </el-container>
</template>

<script>
import { defineComponent } from 'vue';
import 'element-plus/dist/index.css';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';

use([CanvasRenderer, BarChart, LineChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

export default defineComponent({
  components: {
    VChart,
  },
  data() {
    return {
      userType: 'Regular User',
      totalIncome: 50000,
      monthlyIncome: 8000,
      pendingSettlement: 2000,
      recentTransactions: [
        { date: '2024-08-10', description: 'Product Sales', amount: 3000 },
        { date: '2024-08-11', description: 'Service Income', amount: 2500 },
        { date: '2024-08-12', description: 'NFT Sales', amount: 1500 },
      ],
      incomeTrendOption: {
        title: { text: 'Income Trend' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: 'Income',
            type: 'line',
            data: [5000, 8000, 6000, 12000, 15000, 10000],
          },
        ],
      },
      nftSalesOption: {
        title: { text: 'NFT Sales Analysis' },
        tooltip: { trigger: 'item' },
        legend: { top: '5%', left: 'center' },
        series: [
          {
            name: 'Sales',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: { show: false, position: 'center' },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold',
              },
            },
            labelLine: { show: false },
            data: [
              { value: 1048, name: 'Art' },
              { value: 735, name: 'Collectibles' },
              { value: 580, name: 'Virtual Items' },
              { value: 484, name: 'Others' },
            ],
          },
        ],
      },
      fanSupportOption: {
        title: { text: 'Fan Support Analysis' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [120, 200, 150, 80, 70, 110],
            type: 'bar',
          },
        ],
      },
    };
  },
});
</script>

<style scoped>
.el-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto;
}

.el-card {
  padding: 20px;
  width: 100%;
}
.font-bold {
  font-weight: 700;
  font-size: 1.875rem;
  line-height: 2.25rem;
}
</style>
