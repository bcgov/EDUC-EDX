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
      <template
        v-for="(row, index) in headcountTableData?.rows"
        :key="'row-' + index + '-data'"
      >
        <tr
          class="section-header"
          data-cy="indigenous-report-row"
        >
          <td
            v-for="(columnHeader, idx) in headcountTableData?.headers"
            :key="row.title + columnHeader + generateKey()"
            :class="{'section-header-title': idx===0,'table-cell': idx!==0, 'zero-cell': row[columnHeader]==='0'}"
          >
            <span>
              {{ row[columnHeader] }}
            </span>
          </td>
        </tr>
        <tr>
          <td
            class="empty-row-cells"
            :colspan="headcountTableData?.headers?.length"
          />
        </tr>
      </template>
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
.empty-row-cells {
  height: 1.5rem !important;
}
.section-header {
  background-color: #FAFBFC;
}
.section-header-title {
  color: #38598a;
  font-weight: bold;
}
.table-cell {
  text-align: center;
  font-weight: bold;
}
th {
  color: #38598a !important;
  text-align: center !important;
}
.zero-cell {
  color: gray;
}
</style>
