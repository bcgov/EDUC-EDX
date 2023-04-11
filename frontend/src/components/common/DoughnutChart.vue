<template>
  <Doughnut
    id="steps-complete-indicator"
    :options="chartOptions"
    :data="chartData"
  />
</template>
  
<script>
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
  
ChartJS.register(ArcElement, Tooltip);
  
export default {
  name: 'DoughnutChart',
  components: { Doughnut },
  props: {
    incomingChartData: {
      type: Array,
      required: true,
      default: () => [0, 5]
    }
        
  },
  data() {
    return {
      chartData: {
        datasets: [ { 
          backgroundColor: ['#FCBA19', 'grey'],
          data: this.incomingChartData
        } ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      }
    };
  },
  mounted() {
  },
  methods: {
       
  }
};
</script>
