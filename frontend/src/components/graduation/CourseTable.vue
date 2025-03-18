<template>
  <v-data-table
    :items="data"
    :headers="headers"
    mobile-breakpoint="0"
  >
    <template #headers>
      <tr>
        <th
          v-for="column in headers"
          id="header"
          :key="column.key"
        >
          <v-row>
            <v-col class="header-text mr-12">
              {{ column.title }}
            </v-col>
          </v-row>
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
            <span v-if="props.item['courseCode'] === null">no course code</span>
            <span v-else-if="props.item['courseLevel'] === null">no course level</span>
            <span v-else>{{ props.item['courseCode'] }}{{ props.item['courseLevel'] }}</span>
          </span>
          <span v-else-if="column.key === 'status'">
                <v-icon
                  v-bind="tooltipProps"
                  size="25"
                  :color="getIssueIconColor(props.item['studentStatusCode'])"
                >
                  {{ getIssueIcon(props.item['studentStatusCode']) }}
                </v-icon>
            </span>
          <span v-else-if="column.key === 'session'">
            <span v-if="props.item['courseMonth'] === null || props.item['courseYear'] === null">no session provided</span>
            <span v-else> {{ props.item['courseYear'] }}{{ props.item['courseMonth'] }}</span>
          </span>
          <span v-else-if="column.key === 'relatedCourse'">
            <span v-if="props.item['relatedCourse'] === null">no related course</span>
            <span v-else-if="props.item['relatedLevel'] === null">no related level</span>
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
  
   .row-text {
    vertical-align: text-top;
   }

        </style>
        
    
  
