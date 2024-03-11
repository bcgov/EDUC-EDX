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
        <td v-for="(r, i) in rows" :key="r + generateKey()" :class="{'table-cell': true, 'zero-cell': findCellValue(r, row).currentValue==='0'}">
          <span v-if="findCellValue(r, row).comparisonValue !== null" class="compare-text">
            {{ findCellValue(r, row).comparisonValue }}
            </span>
            <span v-if="findCellValue(r, row).comparisonValue !== null" class="compare-text">
              <v-icon
                size="x-small"
                :color="getStatusColor(findCellValue(r, row).comparisonValue, findCellValue(r, row).currentValue)"
              >
              {{ getComparisonIcon(findCellValue(r, row).comparisonValue, findCellValue(r, row).currentValue) }}
              </v-icon>
              </span>

          <span>
            {{ findCellValue(r, row).currentValue }}
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
import {getComparisonIcon, getStatusColor} from '../../../utils/common';

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
  data() {
    return {
      rows: ['Under School Aged', 'School Aged', 'Adult', 'All Students']
    }
  },
  methods: {
    getComparisonIcon,
    getStatusColor,
    findCellValue(sectionName, row) {
      return this.headcountTableData?.rows?.find(x => x.title.currentValue==='Headcount' && x.section.currentValue === sectionName)?.[row];
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
.compare-text {
  color: gray;
}
</style>
