<template>
  <v-table
    v-if="headcountTableData"
    density="compact"
  >
    <thead>
      <tr>
        <th scope="col" />
        <th scope="col">
          Under School-Aged Students
        </th>
        <th scope="col">
          School-Aged Students
        </th>
        <th scope="col">
          Adult Students
        </th>
        <th scope="col">
          Total
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(row, index) in headcountTableData?.headers?.filter(x => x!=='title')"
        :key="row + generateKey()"
        :class="{'colored-row': index%2===0, 'totals-row': index === headcountTableData?.headers?.length-2}"
      >
        <td class="section-header-title">
          {{ row }}
        </td>
        <td :class="{'table-cell': true, 'zero-cell': findCellValue('Under School Aged', row)==='0'}">
          <span>
            {{ findCellValue('Under School Aged', row) }}
          </span>
        </td>
        <td :class="{'table-cell': true, 'zero-cell': findCellValue('School Aged', row)==='0'}">
          <span>
            {{ findCellValue('School Aged', row) }}
          </span>
        </td>
        <td :class="{'table-cell': true, 'zero-cell': findCellValue('Adult', row)==='0'}">
          <span>
            {{ findCellValue('Adult', row) }}
          </span>
        </td>
        <td :class="{'table-cell': true, 'zero-cell': findCellValue('All Students', row)==='0'}">
          <span>
            {{ findCellValue('All Students', row) }}
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
  name: 'EnrollmentHeadcountsComponent',
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
