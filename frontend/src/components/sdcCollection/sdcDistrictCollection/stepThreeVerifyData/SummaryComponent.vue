<template />
  <div></div>
<script>
import alertMixin from '../../../../mixins/alertMixin';
import {getComparisonIcon, getStatusColor} from '../../../../utils/common';
 
export default {
  name: 'SummaryComponent',
  components: {
  },
  mixins: [alertMixin],
  props: {
    headcountType: {
      type: Array,
      required: true,
    }
  },
  emits: [],
  data() {
    return {
      isLoading: false,
      headcountHeaders: [],
      headcountTableData: null,
      compareSwitch: false,
      reportType: null
    };
  },
  watch: {

  },
  mounted() {
    
  },
  created() {
  },
  methods: {
    getComparisonIcon,
    getStatusColor,
    getTitle() {
      return this.headcountType.find(type => type.endpoint === this.reportType).title;
    },

  }
};
</script>
       
<style scoped>

.column-header {
  font-weight: bold;
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
}

.column-data {
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
  white-space: nowrap;
}

.compare-text {
  color: gray;
}

.row-data {
  flex-wrap: nowrap;
}
 
</style>
       
       
     
   
