<template>
  <v-card height="100%" width="100%">
    <v-toolbar flat color="#036" class="white--text">
      <v-toolbar-title>Data Submitted</v-toolbar-title>
    </v-toolbar>
    <v-row no-gutters class="pt-2 px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2" color="green">Legal Last Name:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.legalLastName }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="pt-2 px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2" color="green">Legal First Names:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.legalFirstName }}</strong></p>
      </v-col>
    </v-row>   
    <v-row no-gutters class="pt-2 px-2 pb-8">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2" color="green">Legal Middle Names:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.legalMiddleNames }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2">Usual Last Name:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.usualLastName }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2">Usual First Names:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.usualFirstName }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2 pb-8">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2">Usual Middle Names:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.usualMiddleName }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p>Maiden Name:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p><strong>{{ request.maidenName }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2" color="green">Past Names:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.pastNames }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2">Date of Birth:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.dob ? moment(request.dob).format('YYYY-MM-DD'):'' }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p>Gender:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p><strong>{{ genderLabel }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2" color="green">Current BC School:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.currentSchool }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2">Last BC School:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.lastBCSchool }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p>School Student ID:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p><strong>{{ request.lastBCSchoolStudentNumber }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-2">Email:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-2"><strong>{{ request.email }}</strong></p>
      </v-col>
    </v-row>
    <v-row no-gutters class="pb-2 px-2">
      <v-col cols="12" xl="5" lg="5" md="5" sm="5">
        <p class="mb-0">ID Type:</p>
      </v-col>
      <v-col cols="12" xl="6" lg="6" md="6" sm="6">
        <p class="mb-0"><strong>{{ userInfo.identityTypeLabel }}</strong></p>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'requestCard',
  props: {
    request: {
      type: Object,
      required: true
    },
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('penRequest', ['genderInfo']),
    genderLabel() { 
      return this.genderInfo(this.request.genderCode).label;
    }
  },
};
</script>

<style scoped>
.v-toolbar /deep/ .v-toolbar__content {
  padding-left: 20px !important;
}
</style>
