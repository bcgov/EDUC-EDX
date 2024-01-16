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
        :key="row.title + generateKey()"
        :class="row.title===row.section?'section-header':''"
      >
        <td
          v-for="columnHeader in headcountTableData?.headers"
          :key="row.title + columnHeader + generateKey()"
          :class="getClassForCell(columnHeader, row)"
        >
          <span :class="row[columnHeader]==='0'?'zero-cell':''">
            {{ row[columnHeader] }}
          </span>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import {v4 as uuidv4} from 'uuid';
 
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
    getClassForCell(columnHeader, row) {
      if(row.title===row.section) {
        if(columnHeader==='title') {
          return 'section-header-title';
        } else if(row[columnHeader]==='0') {
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
</style>
       
       
     
   
