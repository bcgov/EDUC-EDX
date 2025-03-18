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
          <span v-if="column.key === 'session'">
            <span v-if="props.item['courseMonth'] === null || props.item['courseYear'] === null">no session provided</span>
            <span v-else> {{ props.item['courseYear'] }}{{ props.item['courseMonth'] }}</span>
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
  name: 'AssessmentTable',
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
    rowclicked() {
  
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
        
    
  
