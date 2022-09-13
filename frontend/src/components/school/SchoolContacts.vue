<template>
  <v-container class="containerSetup" fluid>
    <v-row cols="2">
      <v-col cols="10" lg="7">
        <v-chip class="mr-3" color="green">Active</v-chip>
        <v-chip class="mr-3" color="blue">Pending Start Date</v-chip>
        <v-chip color="orange">Pending End Date</v-chip>
      </v-col>
      <v-col cols="10" lg="5">
        <PrimaryButton width="30%" icon="mdi-plus-thick" text="New Contact"></PrimaryButton>
      </v-col>
    </v-row>
    <v-row>
      <h2 style="color:#1A5A96">Principal</h2>
    </v-row>
    <v-row cols="2">
      <v-col cols="5" lg="4" v-for="contact in schoolContacts" :key="contact.schoolId">
        <v-card v-if="isPrincipal(contact)">
          <v-card-title class="pb-0">
            <v-row no-gutters>
              <v-col>
                <v-row no-gutters>
                  <v-col cols="9">
                    <v-icon class="pb-1" :color="getStatusColor(contact)" left dark>
                      mdi-circle-medium
                    </v-icon>
                    <strong>{{ `${contact.firstName} ${contact.lastName}` }}</strong>
                  </v-col>
                  <v-col cols="3" class="d-flex justify-end">
                    <PrimaryButton width="100%" secondary icon="mdi-pencil" text="Edit"></PrimaryButton>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12" class="pt-1">
                    <span>{{ contact.email }}</span>
                  </v-col>
                  <v-col cols="12" class="pt-1">
                    <span>{{ contact.phoneNumber }}</span>
                  </v-col>
                  <v-col cols="12" class="pt-1">
                    <span></span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text class="pt-2">
            <v-row no-gutters>
              <v-col cols="12" class="pt-1" v-if="contact.expiryDate">
                <v-icon aria-hidden="false">
                  mdi-calendar-today
                </v-icon>
                <span> {{ formatDate(contact.effectiveDate) }} - {{ formatDate(contact.expiryDate)}}</span>
              </v-col>
              <v-col cols="12" class="pt-1" v-else>
                <v-icon aria-hidden="false">
                  mdi-calendar-today
                </v-icon>
                <span> {{ formatDate(contact.effectiveDate) }}</span>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <h2 style="color:#1A5A96" class="mt-3">Vice Principal</h2>
    </v-row>
    <v-row cols="2">
      <v-col cols="5" lg="5" v-for="contact in schoolContacts" :key="contact.schoolId">
        <v-card v-if="isVicePrincipal(contact)">
          <v-card-title class="pb-0">
            <v-row no-gutters>
              <v-col>
                <v-row no-gutters>
                  <v-col cols="9">
                    <v-icon class="pb-1" :color="getStatusColor(contact)" left dark>
                      mdi-circle-medium
                    </v-icon>
                    <strong>{{ `${contact.firstName} ${contact.lastName}` }}</strong>
                  </v-col>
                  <v-col cols="3" class="d-flex justify-end">
                    <PrimaryButton width="100%" secondary icon="mdi-pencil" text="Edit"></PrimaryButton>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12" class="pt-1">
                    <span>{{ contact.email }}</span>
                  </v-col>
                  <v-col cols="12" class="pt-1">
                    <span>{{ contact.phoneNumber }}</span>
                  </v-col>
                  <v-col cols="12" class="pt-1">
                    <span></span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text class="pt-2">
            <v-row no-gutters>
              <v-col cols="12" class="pt-1" v-if="contact.expiryDate">
                <v-icon aria-hidden="false">
                  mdi-calendar-today
                </v-icon>
                <span> {{ formatDate(contact.effectiveDate) }} - {{ formatDate(contact.expiryDate)}}</span>
              </v-col>
              <v-col cols="12" class="pt-1" v-else>
                <v-icon aria-hidden="false">
                  mdi-calendar-today
                </v-icon>
                <span> {{ formatDate(contact.effectiveDate) }}</span>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import {mapGetters} from 'vuex';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'SchoolContactsPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  data() {
    return {
      schoolContacts: [],
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
    dataReady: function () {
      return this.userInfo;
    }
  },
  created() {
    this.getThisSchoolsContacts();
  },
  methods: {
    getThisSchoolsContacts(){
      this.schoolContacts = '';

      ApiService.apiAxios.get(ApiRoutes.school.SCHOOL_DETAILS_BY_ID + `/${this.userInfo.activeInstituteIdentifier}`)
        .then(response => {
          let rawData = response.data;
          this.schoolContacts = rawData.contacts;

        }).catch(error => {
        //to do add the alert framework for error or success
          console.error(error);
        }).finally(() => {
          this.loadingTable = false;
        });


    },
    isPrincipal(contact){
      return contact.schoolContactTypeCode === 'PRINCIPAL';
    },
    isVicePrincipal(contact){
      return contact.schoolContactTypeCode === 'VICE PRINCIPAL';
    },
    getSchoolStatus(contact) {
      const currentDate = new Date();
      let effectiveDate = contact.effectiveDate;
      let expiryDate = contact.expiryDate;
      let status = null;

      if (expiryDate === '' || expiryDate === null) {
        status = 'Active';
      } else if (effectiveDate > currentDate) {
        status = 'Pending Start Date';
      } else if (expiryDate > currentDate) {
        status = 'Pending End Date';
      }

      return status;
    },
    getStatusColor(contact) {
      let status = this.getSchoolStatus(contact);
      if (status === 'Active') {
        return 'green';
      } else if (status === 'Pending Start Date'){
        return 'blue';
      } else if (status === 'Pending End Date'){
        return 'orange';
      }
    },
    formatDate(rawDate){
      return new Date(rawDate).toISOString().slice(0,10).replace(/-/g,'/');
    }
  }
};
</script>

<style scoped>

@media screen and (max-width: 801px){
  .subjectHeading {
    font-size: medium;
  }

  .statusCodeLabel{
    font-size: inherit;
  }

  .ministryLine{
    font-size: inherit;
  }
}
@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
}

.containerSetup{
  padding-right: 32em !important;
  padding-left: 32em !important;
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
