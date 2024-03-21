<template>
  <v-row align-content="space-between" class="mt-3">
    <v-col class="font-weight-bold">
      {{ getTitle() }}
    </v-col>
  </v-row>
  <v-table
      v-if="bandHeadcountData"
      density="compact"
      id = "band-headcount-table"
  >
    <thead>
    <tr>
      <th
          v-for="columnHeader in bandHeadcountData?.headers"
          :id="'tableHeader'+columnHeader"
          :key="columnHeader + generateKey()"
      >
        {{ columnHeader==="title"?'':columnHeader }}
      </th>
    </tr>
    </thead>
    <tbody>
    <template
        v-for="(row, index) in bandHeadcountData?.rows"
        :key="'row-' + index + '-data'"
    >
      <tr
          class="section-header"
          data-cy="band-report-row"
      >
        <td
            v-for="(columnHeader, idx) in bandHeadcountData?.headers"
            :key="row?.title?.currentValue + columnHeader + generateKey()"
            :class="{'section-header-title': idx===0,'table-cell': idx!==0, 'zero-cell': row[columnHeader]?.currentValue==='0'}"
        >
          <div>
              <span v-if="columnHeader !== 'title' && row[columnHeader]?.comparisonValue !== null" class="compare-text">
              {{row[columnHeader]?.comparisonValue}}
              </span>
            <span v-if= " columnHeader !== 'title' && row[columnHeader]?.comparisonValue !== null" class="compare-text">
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
      <tr>
        <td
            class="empty-row-cells"
            :colspan="bandHeadcountData?.headers?.length"
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
import {getComparisonIcon, getStatusColor} from '../../../utils/common';

export default defineComponent({
  name: 'BandHeadcountsComponent',
  components: {
  },
  mixins: [alertMixin],
  props: {
    bandHeadcountData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      headcountTableData: null,
      title: 'Eligible Band of Residence Headcount'
    };
  },
  methods: {
    getComparisonIcon,
    getStatusColor,
    generateKey() {
      return uuidv4();
    },
    getTitle() {return this.title;}
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
