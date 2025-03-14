<template>
  <v-container fluid>
    <div>
      <h3>Avisha and Alex are here</h3>
    </div>
  </v-container>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import { mapState} from 'pinia';
import {authStore} from '../../../../store/modules/auth';

export default {
  name: 'GradSchoolStudentSearch',
  components: {

  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: [],
  data() {
    return {
      isLoading: false
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
  },
  async created() {

  },
  methods: {

  },
};
</script>

<style scoped>



</style>
