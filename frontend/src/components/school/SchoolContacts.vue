<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="loading"
        />
      </v-col>
    </v-row>
    <template v-if="!loading">
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
      <v-row>
        <v-col
          cols="12"
          class="d-flex justify-start"
        >
          <v-row no-gutters>
            <v-col cols="12">
              <h2 class="subjectHeading">
                {{ school.mincode }} - {{ school.displayName }}
              </h2>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row cols="2">
        <v-col class="d-flex justify-start">
          <v-chip
            variant="elevated"
            class="text-black mr-3"
            color="#A9D18E"
          >
            Active
          </v-chip>
          <v-chip
            variant="elevated"
            class="text-black mr-3"
            color="#9DC3E6"
          >
            Pending Start Date
          </v-chip>
          <v-chip
            variant="elevated"
            class="text-black"
            color="#F4B183"
          >
            Pending End Date
          </v-chip>
        </v-col>
        <v-col class="d-flex justify-end">
          <PrimaryButton
            id="viewDetailsButton"
            class="mr-2 mb-3"
            secondary
            icon="mdi-domain"
            text="View School Details"
            :click-action="redirectToSchoolDetails"
          />
          <PrimaryButton
            v-if="canEditSchoolContacts()"
            id="addSchoolContactBtn"
            class="mr-0 mb-3"
            icon="mdi-plus-thick"
            text="New Contact"
            :click-action="openNewContactSheet"
          />
        </v-col>
      </v-row>
      <div
        v-for="schoolContactType in schoolContactTypes"
        :key="schoolContactType.code"
      >
        <v-row>
          <v-col>
            <h2 style="color:#1A5A96">
              {{ schoolContactType.label }}
            </h2>
          </v-col>
        </v-row>
        <v-row
          v-if="schoolContacts.has(schoolContactType.schoolContactTypeCode)"
          cols="2"
        >
          <v-col
            v-for="contact in schoolContacts.get(schoolContactType.schoolContactTypeCode)"
            :key="contact.schoolId"
            cols="5"
            lg="4"
          >
            <SchoolContact
              :handle-open-editor="() => openEditContactSheet(contact)"
              :contact="contact"
              :school-i-d="$route.params.schoolID"
              :can-edit-school-contact="canEditSchoolContacts()"
            />
          </v-col>
        </v-row>
        <v-row
          v-else
          cols="2"
        >
          <v-col>
            <p>No contacts of this type have been listed.</p>
          </v-col>
        </v-row>
      </div>
    </template>
    <!--    new contact sheet -->
    <v-navigation-drawer
      v-model="newContactSheet"
      inset
      location="bottom"
      temporary
      style="width: 50%; height: max-content; left: 25%;"
      no-click-animation
      scrollable
      persistent
    >
      <NewSchoolContactPage
        v-if="newContactSheet"
        :school-contact-types="schoolContactTypes"
        :school-i-d="$route.params.schoolID"
        @newSchoolContact:closeNewSchoolContactPage="newContactSheet = !newContactSheet"
        @newSchoolContact:addNewSchoolContact="newSchoolContactAdded"
      />
    </v-navigation-drawer>
    <v-navigation-drawer
      v-model="editContactSheet"
      inset
      location="bottom"
      temporary
      no-click-animation
      scrollable
      style="width: 50%; height: max-content; left: 25%;"
      persistent
    >
      <EditSchoolContactPage
        v-if="editContactSheet"
        :contact="editContact"
        :school-contact-types="schoolContactTypes"
        :school-i-d="$route.params.schoolID"
        :close-handler="() => editContactSheet = false"
        :on-success-handler="() => contactEditSuccess()"
      />
    </v-navigation-drawer>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import {PERMISSION} from '../../utils/constants/Permission';
import { authStore } from '../../store/modules/auth';
import { mapState } from 'pinia';
import alertMixin from '../../mixins/alertMixin';
import {formatPhoneNumber, formatDate, formatContactName} from '../../utils/format';
import {getStatusColor} from '../../utils/institute/status';
import { sortBy } from 'lodash';

import PrimaryButton from '../util/PrimaryButton.vue';
import NewSchoolContactPage from './NewSchoolContactPage.vue';
import EditSchoolContactPage from './EditSchoolContactPage.vue';
import SchoolContact from './SchoolContact.vue';

// checks the expiry of a contact
function isExpired(contact) {
  return (contact.expiryDate) ? new Date(contact.expiryDate) < new Date() : false;
}

export default {
  name: 'SchoolContactsPage',
  components: {
    PrimaryButton,
    NewSchoolContactPage,
    EditSchoolContactPage,
    SchoolContact
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false
    },
  },
  data() {
    return {
      loadingCount: 0,
      schoolContactTypes: [],
      schoolContacts: new Map(),
      school: {},
      editContact: {},
      newContactSheet: false,
      editContactSheet: false
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    loading() {
      return this.loadingCount !== 0;
    }
  },
  created() {
    this.getSchoolContactTypeCodes();
    this.getThisSchoolsContacts();
  },
  methods: {
    redirectToSchoolDetails() {
      this.$router.push({name: 'schoolDetails', params: {schoolID: this.school.schoolId}});
    },
    getSchoolContactTypeCodes() {
      this.loadingCount += 1;
      ApiService.apiAxios.get(ApiRoutes.institute.SCHOOL_CONTACT_TYPE_CODES)
        .then(response => {
          this.schoolContactTypes = response.data;
        })
        .catch(error => {
          console.error(error);
          let fallback =  'An error occurred while trying to get the details of available School' +
            ' Contact Type Codes. Please try again later.';
          this.setFailureAlert(error?.response?.data?.message || fallback);
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    getThisSchoolsContacts(){
      this.loadingCount += 1;
      let searchSchoolID = this.schoolID ? this.schoolID: this.userInfo.activeInstituteIdentifier;
      ApiService.apiAxios.get(`${ApiRoutes.school.SCHOOL_DETAILS_BY_ID}/` + searchSchoolID)
        .then(response => {
          this.schoolContacts = new Map();
          this.school = response.data;
          response.data.contacts = sortBy(response.data.contacts, ['firstName']);
          response.data.contacts.forEach(contact => {
            if(!isExpired(contact)){
              if (!this.schoolContacts.has(contact.schoolContactTypeCode)) {
                this.schoolContacts.set(contact.schoolContactTypeCode, [contact]);
              } else {
                this.schoolContacts.get(contact.schoolContactTypeCode).push(contact);
              }
            }
          });
        }).catch(error => {
          console.error(error);
          let fallback = 'An error occurred while trying to get a list of the school\'s contacts.' +
            ' Please try again later.';
          this.setFailureAlert(error?.response?.data?.message || fallback);
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    backButtonClick() {
      if(this.isDistrictUser()){
        this.$router.push({name: 'schools'});
      }else{
        this.$router.push({name: 'home'});
      }
    },
    isDistrictUser(){
      return this.userInfo.activeInstituteType === 'DISTRICT';
    },
    newSchoolContactAdded() {
      this.newContactSheet = !this.newContactSheet;
      this.getThisSchoolsContacts();
    },
    canEditSchoolContacts() {
      let permissions = this.userInfo?.activeInstitutePermissions;
      if (permissions === undefined) return false;
      return permissions.filter(p => p === PERMISSION.EDX_USER_SCHOOL_ADMIN).length > 0;
    },
    openNewContactSheet(){
      this.newContactSheet = !this.newContactSheet;
    },
    contactEditSuccess() {
      this.getThisSchoolsContacts();
    },
    openEditContactSheet(contact) {
      this.editContact = contact;
      this.editContactSheet = !this.editContactSheet;
    },
    getStatusColor,
    formatDate,
    formatPhoneNumber,
    formatContactName
  }
};
</script>

<style scoped>

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

.v-dialog__content >>> .v-bottom-sheet {
  width: 30% !important;
}

@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }
}

</style>
