<template>
  <v-table
    v-if="headcountTableData"
    density="compact"
  >
    <thead>
      <tr>
        <th
          v-for="columnHeader in headcountTableData?.headers"
          :id="'tableHeader'+columnHeader"
          :key="columnHeader + generateKey()"
        >
          {{ columnHeader==="title"?'':columnHeader }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in headcountTableData?.rows"
        :key="row?.title?.currentValue + generateKey()"
        :class="row?.title?.currentValue === row?.section?.currentValue ?'section-header':''"
      >
        <td
          v-for="columnHeader in headcountTableData?.headers"
          :key="row?.title?.currentValue + columnHeader + generateKey()"
          :class="getClassForCell(columnHeader, row)"
        >
          <div :class="row[columnHeader]?.currentValue==='0'?'zero-cell':''">
            <span
              v-if="columnHeader === 'Total' && row[columnHeader]?.comparisonValue !== null"
              class="compare-text"
            >
              {{ row[columnHeader]?.comparisonValue }}
            </span>
            <span
              v-if="columnHeader === 'Total' && row[columnHeader] !== undefined && row[columnHeader]?.comparisonValue !== null"
              class="compare-text"
            >
              <v-icon
                size="x-small"
                :color="getStatusColor(row[columnHeader]?.comparisonValue, row[columnHeader]?.currentValue)"
              >
                {{ getComparisonIcon(row[columnHeader]?.comparisonValue, row[columnHeader]?.currentValue) }}
              </v-icon>
            </span>
            <span>{{ row[columnHeader]?.currentValue }}</span>
          </div>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
import alertMixin from '../../mixins/alertMixin';
import {v4 as uuidv4} from 'uuid';
import {getComparisonIcon, getStatusColor} from '../../utils/common';
 
export default {
  name: 'HeadCountReportComponent',
  components: {
  },
  mixins: [alertMixin],
  props: {
    headcountTableData: {
      type: Object,
      required: true
    }
  },
  methods: {
    getComparisonIcon,
    getStatusColor,
    getClassForCell(columnHeader, row) {
      if(row.section && row.title.currentValue===row.section.currentValue) {
        if(columnHeader==='title') {
          return 'section-header-title';
        } else if(row[columnHeader]?.currentValue==='0') {
          return 'table-cell';
        } else {
          return 'section-header-cell';
        }
      } else if(columnHeader==='title') {
        return 'pl-12';
      } else {
        return 'table-cell';
      }
    },
    generateKey() {
      return uuidv4();
    }
  }
};
</script>
       
<style scoped>
.section-header {
  background-color: #FAFBFC;
}
.section-header-cell {
  font-weight: bold;
  text-align: center;
}
.section-header-title {
  color: #38598a;
  font-weight: bold;
}
.table-cell {
  text-align: center;
}
th {
  color: #38598a !important;
  text-align: center !important;
}
.zero-cell {
  color: gray;
}

.compare-text {
  color: gray;
}
</style>
       
       
     
   
