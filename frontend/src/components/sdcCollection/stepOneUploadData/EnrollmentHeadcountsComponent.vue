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
          <span v-if="findCellComparisonValue('Under School Aged', row) !== null" class="compare-text">
            {{ findCellComparisonValue('Under School Aged', row) }}
            </span>
            <span v-if="findCellComparisonValue('Under School Aged', row) !== null" class="compare-text">
              <v-icon
                size="x-small"
                :color="getStatusColor(findCellComparisonValue('Under School Aged', row), findCellValue('Under School Aged', row))"
              >
              {{ getComparisonIcon(findCellComparisonValue('Under School Aged', row), findCellValue('Under School Aged', row)) }}
              </v-icon>
              </span>

          <span>
            {{ findCellValue('Under School Aged', row) }}
          </span>
        </td>

        <td :class="{'table-cell': true, 'zero-cell': findCellValue('School Aged', row)==='0'}">
          <span v-if="findCellComparisonValue('School Aged', row) !== null" class="compare-text">
            {{ findCellComparisonValue('School Aged', row) }}
            </span>
            <span v-if="findCellComparisonValue('School Aged', row) !== null" class="compare-text">
              <v-icon
                size="x-small"
                :color="getStatusColor(findCellComparisonValue('School Aged', row), findCellValue('School Aged', row))"
              >
              {{ getComparisonIcon(findCellComparisonValue('School Aged', row), findCellValue('School Aged', row)) }}
              </v-icon>
              </span>

          <span>
            {{ findCellValue('School Aged', row) }}
          </span>
        </td>

        <td :class="{'table-cell': true, 'zero-cell': findCellValue('Adult', row)==='0'}">
          <span v-if="findCellComparisonValue('Adult', row) !== null" class="compare-text">
            {{ findCellComparisonValue('Adult', row) }}
            </span>
            <span v-if="findCellComparisonValue('Adult', row) !== null" class="compare-text">
              <v-icon
                size="x-small"
                :color="getStatusColor(findCellComparisonValue('Adult', row), findCellValue('Adult', row))"
              >
              {{ getComparisonIcon(findCellComparisonValue('Adult', row), findCellValue('Adult', row)) }}
              </v-icon>
              </span>
          <span>
            {{ findCellValue('Adult', row) }}
          </span>
        </td>

        <td :class="{'table-cell': true, 'zero-cell': findCellValue('All Students', row)==='0'}">
          <span v-if="findCellComparisonValue('All Students', row)" class="compare-text">
              {{findCellComparisonValue('All Students', row)}}
            </span>
            <span v-if="findCellComparisonValue('All Students', row) !== null" class="compare-text">
              <v-icon
                size="x-small"
                :color="getStatusColor(findCellComparisonValue('All Students', row), findCellValue('All Students', row))"
              >
              {{ getComparisonIcon(findCellComparisonValue('All Students', row), findCellValue('All Students', row)) }}
              </v-icon>
              </span>
              
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
      return this.headcountTableData?.rows?.find(x => x.title.currentValue==='Headcount' && x.section.currentValue === sectionName)?.[row].currentValue;
    },
    findCellComparisonValue(sectionName, row) {
      return this.headcountTableData?.rows?.find(x => x.title.currentValue==='Headcount' && x.section.currentValue === sectionName)?.[row].comparisonValue;
    },
    generateKey() {
      return uuidv4();
    },
    getComparisonIcon(comparisonValue, currentValue) {
      if(comparisonValue > currentValue) {
        return 'mdi-arrow-down';
      } else if(comparisonValue < currentValue) {
        return 'mdi-arrow-up';
      } else if(comparisonValue === currentValue) {
        return 'mdi-equal';
      } else {
        return '';
      }
    },
    getStatusColor(comparisonValue, currentValue) {
      if(comparisonValue > currentValue) {
        return 'red';
      } else if(comparisonValue < currentValue) {
        return 'green';
      } else {
        return '#1976d2';
      }
    },
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
