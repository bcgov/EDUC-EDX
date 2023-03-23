<template>
  <v-container 
    class="containerSetup"
    fluid
  >
    <v-row class="d-flex justify-start">
      <v-col class="mt-1 mb-1">
        <v-icon
          small
          color="#1976d2"
        >
          mdi-arrow-left
        </v-icon>
        <a
          v-if="isDistrictUser()"
          class="ml-1"
          @click="backButtonClick"
        >Return to School List</a>
        <a
          v-else
          class="ml-1"
          @click="backButtonClick"
        >Return to Dashboard</a>
      </v-col>
    </v-row>
    <SchoolDetailsForm
      :school-i-d="schoolID"
      :function-name="type"
    />
  </v-container>
</template>

<script>
import { authStore } from '../../store/modules/auth';
import { mapState } from 'pinia';
import alertMixin from '../../mixins/alertMixin';
import SchoolDetailsForm from '../common/forms/SchoolDetailsForm.vue';

export default {
  name: 'SchoolDetailsPage',
  components: {
    SchoolDetailsForm
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
  },
  data() {
    return {
      type: 'DETAILS',
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    dataReady: function () {
      return this.userInfo;
    },
  },
  methods: {
    backButtonClick() {
      if(this.isDistrictUser()){
        this.$router.push({name: 'schools'});
      }else{
        this.$router.push({name: 'home'});
      }
    },
    isDistrictUser(){
      return this.userInfo.activeInstituteType === 'DISTRICT';
    }
  }
};
</script>

<style scoped>

:deep(div.v-input__prepend > i){
  margin-top: 5px;
  margin-right: -10px;
}

.containerSetup{
  padding-right: 24em !important;
  padding-left: 24em !important;
}

@media screen and (max-width: 1950px) {
  .containerSetup{
    padding-right: 20em !important;
    padding-left: 20em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
}
</style>
  
