<template>
  <v-container
    id="enrollmentTab"
    fluid
  >
    <DetailComponent
      :config="config"
      :district="district"
      :show-export-btn="false"
      :is-final-sign-off="isFinalSignOff"
      :is-collection-active="isCollectionActive"
      deleted-students-only
    />
  </v-container>
</template>
  
<script>
import alertMixin from '../../../../mixins/alertMixin';
import DetailComponent from './DetailComponent.vue';
import { FTE } from '../../../../utils/sdc/DistrictCollectionTableConfiguration';

export default {
  name: 'DeletedStudentsComponent',
  components: {
    DetailComponent
  },
  mixins: [alertMixin],
  props: {
    district: {
      type: Object,
      required: true,
      default: null
    },
    isFinalSignOff: {
      type: Boolean,
      required: false
    },
    isCollectionActive: {
      type: Boolean,
      required: true
    }
  },
  emits: [],
  data() {
    return {
      reportView: this.isFinalSignOff ? 'summary' : 'detail',
      config: FTE
  
    };
  },
  computed: {
  
  },
  created() {
  },
  methods: {
    showDetail() {
      this.reportView = 'detail';
  
    },
    showSummary() {
      this.reportView = 'summary';
    },
  }
};
</script>
  
  <style scoped>
  .detail-button {
    border: 1px solid lightgray;
  }
  
  .summary-button {
    border: 1px solid lightgray;
  }
  
  .active-button {
    background-color: #003366 !important;
    color: white !important;
    border: 1px solid #003366;
  }
  </style>
  
