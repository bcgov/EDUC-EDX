<template>
  <v-container
    class="containerSetup"
  >
    <v-row>
      <v-col class="mt-1 d-flex justify-start">
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

    <SchoolContactsForm
      :function-name="type"
      :school-i-d="schoolID"
    />
  </v-container>
</template>

<script>


import { authStore } from '../../store/modules/auth';
import { mapState } from 'pinia';
import alertMixin from '../../mixins/alertMixin';
import SchoolContactsForm from '../common/forms/SchoolContactsForm.vue';

export default {
  name: 'SchoolContactsPage',
  components: {
    SchoolContactsForm
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

.containerSetup{
  padding-right: 2em;
  padding-left: 2em;
}

@media screen and (min-width: 1920px) {
  .containerSetup{
    max-width: 1200px;
  }
}

:deep(.v-alert){
  display: inline-flex;
}
</style>
