<template>
  <v-data-table
    v-model:page="pageNumber"
    v-model:items-per-page="pageSize"
    :items="data"
    :headers="headers"
    mobile-breakpoint="0"
  >
    <template #headers="{ getSortIcon, toggleSort }">
      <tr>
        <th
          v-for="column in headers"
          id="header"
          :key="column.key"
          :class="{
            'text-center': column.align === 'center',
            'text-start': column.align === 'start',
            'text-end': column.align === 'end',
            'v-data-table__th--sortable': column.sortable,
          }"
          :style="{ cursor: column.sortable ? 'pointer' : 'default' }"
          @click="column.sortable && toggleSort(column)"
        >
          <div class="v-data-table-header__content d-flex align-center">
            <span class="header-text mr-12">{{ column.title }}</span>
            <v-icon
              v-if="column.sortable"
              class="v-data-table-header__sort-icon ml-1"
              :icon="getSortIcon(column)"
              size="x-small"
            />
          </div>
        </th>
      </tr>
    </template>

    <template #item="props">
      <tr
        class="mt-2"
        @click="rowclicked(props.item)"
      >
        <td
          v-for="column in headers"
          :key="column.key"
          class="pt-2 row-text"
        >
          <span v-if="column.key === 'course'">
            <span v-if="(props.item['courseCode'] === null) && (props.item['courseLevel'] === null)">-</span>
            <span v-else>{{ props.item['courseCode'] }}{{ props.item['courseLevel'] }}</span>
          </span>
          <span v-else-if="column.key === 'status'">
            <v-icon
              size="25"
              :color="getIssueIconColor(props.item['studentStatusCode'])"
            >
              {{ getIssueIcon(props.item['studentStatusCode']) }}
            </v-icon>
          </span>
          <span v-else-if="column.key === 'session'">
            <span v-if="props.item['courseMonth'] === null || props.item['courseYear'] === null">-</span>
            <span v-else> {{ props.item['courseYear'] }}/{{ props.item['courseMonth'] }}</span>
          </span>
          <span v-else-if="column.key === 'interimPercentage'">
            <span v-if="props.item['interimPercentage'] && props.item['interimLetterGrade']">{{ props.item['interimPercentage'] }} ({{ props.item['interimLetterGrade'] }})</span>
            <span v-else-if="props.item['interimPercentage']">{{ props.item['interimPercentage'] }}</span>
            <span v-else-if="props.item['interimLetterGrade']">{{ props.item['interimLetterGrade'] }}</span>
            <span v-else>-</span>
          </span>
          <span v-else-if="column.key === 'finalPercentage'">
            <span v-if="props.item['finalPercentage'] && props.item['finalLetterGrade']">{{ props.item['finalPercentage'] }} ({{ props.item['finalLetterGrade'] }})</span>
            <span v-else-if="props.item['finalPercentage']">{{ props.item['finalPercentage'] }}</span>
            <span v-else-if="props.item['finalLetterGrade']">{{ props.item['finalLetterGrade'] }}</span>
            <span v-else>-</span>
          </span>
          <span v-else-if="column.key === 'relatedCourse'">
            <span v-if="props.item['relatedCourse'] === null">-</span>
            <span v-else-if="props.item['relatedLevel'] === null">-</span>
            <span v-else>{{ props.item['relatedCourse'] }}{{ props.item['relatedLevel'] }}</span>
          </span>
          <span v-else-if="props.item[column.key]">
            {{ props.item[column.key] }}
          </span>
          <span v-else>-</span>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>
        
<script>
import alertMixin from '../../mixins/alertMixin';

export default {
  name: 'CourseTable',
  components: {
  },
  mixins: [alertMixin],
  props: {
    
    headers: {
      type: Array,
      required: true,
      default: null
    },
    data: {
      type: Array,
      required: true,
      default: null
    }
  },
  emits: ['reload'],
  data() {
    return {
      pageNumber: 1,
      pageSize: 25
    };
  },
  computed: {
    
  },
  watch: {
  },
  async created() {
        
  },
  beforeUnmount() {
            
  },
  methods: {
    getIssueIcon(issue){
      switch (issue) {
      case 'ERROR':
        return 'mdi-alert-circle-outline';
      case 'WARNING':
        return 'mdi-alert-outline';
      default:
        return '';
      }
    },
    getIssueIconColor(issue){
      switch (issue) {
      case 'ERROR':
        return '#d90606';
      case 'WARNING':
        return '#2196F3';
      default:
        return '';
      }
    },

  }
};
</script>
        
        <style scoped>
      .header-text {
    color: #7f7f7f;
  }

  :deep(.v-table__wrapper){
         overflow: unset;
       }

       :deep(.v-data-table-footer__items-per-page) {
       display: none;
 }
  
   .row-text {
    vertical-align: text-top;
   }

        </style>
        
    
  
