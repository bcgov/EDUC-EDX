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
        v-for="(row, index) in headcountTableData?.rows"
        :key="row.title + generateKey()"
        :class="{'colored-row': index%2===0, 'totals-row': index === headcountTableData?.rows?.length-1}"
        data-cy="indigenous-report-row"
      >
        <td
          v-for="(columnHeader, index) in headcountTableData?.headers"
          :key="row.title + columnHeader + generateKey()"
          :class="{'section-header-title': index===0,'table-cell': index!==0, 'zero-cell': row[columnHeader]==='0'}"
        >
          <span >
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
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'IndigenousHeadcountsComponent',
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
    findCellValue(sectionName, row) {
      return this.headcountTableData?.rows?.find(x => x.title==='Headcount' && x.section === sectionName)?.[row];
    },
    generateKey() {
      return uuidv4();
    }
  }
});
</script>

<style scoped>
.colored-row {
  background-color: #FAFBFC;
}
.section-header-title {
  color: #38598a;
}
.table-cell {
  text-align: center;
}
th {
  color: #38598a !important;
  text-align: center !important;
}
.totals-row {
  font-weight: bold;
}
.zero-cell {
  color: gray;
}
</style>
