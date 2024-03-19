<template>
  <div class="mt-3">
    <v-row v-if="isLoading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="isLoading"
        />
      </v-col>
    </v-row>
    <template v-if="!isLoading">
      <v-row
        v-if="isOffshoreSchool"
        class="d-flex justify-center mb-0"
      >
        <v-col>
          <v-alert
            id="nonEditableAlert"
            density="compact"
            type="info"
            variant="tonal"
          >
            <span>Require updates to school contacts? Please contact {{ MINISTRY_CONTACTS.OFFSHORE_ADMIN }}</span>
          </v-alert>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
          class="d-flex justify-start"
        >
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
        <v-col
          cols="12"
          sm="6"
          class="d-flex justify-md-end justify-start"
        >
          <PrimaryButton
            v-if="canEditSchoolContacts() && showEditButton()"
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
        class="pb-6"
      >
        <v-row class="bottom-sheets">
          <v-col class="pb-1">
            <h2 style="color:#1A5A96">
              {{ schoolContactType.label }}
            </h2>
          </v-col>
        </v-row>
        <v-row
          v-if="!schoolContactType.publiclyAvailable"
          cols="2"
        >
          <v-col
            class="pt-0"
            cols="12"
          >
            <v-alert
              :id="`publiclyAvailableAlert${schoolContactType.label}`"
              density="compact"
              type="info"
              variant="tonal"
              text="Contacts of this type are only available to the ministry and not available to public."
            />
          </v-col>
        </v-row>
        <v-row
          v-if="schoolContacts.has(schoolContactType.schoolContactTypeCode)"
          cols="2"
          class="px-1"
        >
          <v-col
            v-for="contact in schoolContacts.get(schoolContactType.schoolContactTypeCode)"
            :key="contact.schoolId"
            lg="4"
            sm="6"
            cols="12"
            class="pt-0"
          >
            <SchoolContact
              :handle-open-editor="() => openEditContactSheet(contact)"
              :contact="contact"
              :school-i-d="selectedSchoolId"
              :can-edit-school-contact="canEditSchoolContacts() && showEditButton()"
              :can-remove-school-contact="hasSchoolEditPermission() && showEditButton()"
              @remove-school-contact:show-confirmation-prompt="removeContact"
            />
          </v-col>
        </v-row>
        <v-row
          v-else
          cols="2"
        >
          <v-col class="pt-0">
            <p>No contacts of this type have been listed.</p>
          </v-col>
        </v-row>
      </div>
    </template>
    <!--    new contact sheet -->
    <v-bottom-sheet
      v-model="newContactSheet"
      :no-click-animation="true"
      :inset="true"
      :persistent="true"
    >
      <NewSchoolContactPage
        v-if="newContactSheet"
        :school-contact-types="schoolContactTypes"
        :school-i-d="selectedSchoolId"
        @new-school-contact:close-new-school-contact-page="newContactSheet = !newContactSheet"
        @new-school-contact:add-new-school-contact="newSchoolContactAdded"
      />
    </v-bottom-sheet>
    <v-bottom-sheet
      v-model="editContactSheet"
      :no-click-animation="true"
      :inset="true"
      :persistent="true"
    >
      <EditSchoolContactPage
        v-if="editContactSheet"
        :contact="editContact"
        :school-contact-types="schoolContactTypes"
        :school-i-d="selectedSchoolId"
        :close-handler="() => editContactSheet = false"
        :on-success-handler="() => contactEditSuccess()"
      />
    </v-bottom-sheet>
    <ConfirmationDialog ref="confirmationDialog" />
  </div>
</template>

<script>

import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {PERMISSION} from '../../../utils/constants/Permission';
import { authStore } from '../../../store/modules/auth';
import { mapState } from 'pinia';
import alertMixin from '../../../mixins/alertMixin';
import {formatPhoneNumber, formatDate, formatContactName} from '../../../utils/format';
import {getStatusColor} from '../../../utils/institute/status';
import { sortBy } from 'lodash';

import PrimaryButton from '../../util/PrimaryButton.vue';
import NewSchoolContactPage from '../../school/NewSchoolContactPage.vue';
import EditSchoolContactPage from '../../school/EditSchoolContactPage.vue';
import SchoolContact from '../../school/SchoolContact.vue';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import {instituteStore} from '../../../store/modules/institute';
import {SCHOOL_CONTACT_TYPES} from '../../../utils/constants/SchoolContactTypes';
import {SCHOOL_CATEGORY_CODES} from '../../../utils/constants/SchoolCategoryCodeTypes';
import {MINISTRY_CONTACTS} from '../../../utils/constants/MinistryContactsInfo';

// checks the expiry of a contact
function isExpired(contact) {
  return (contact.expiryDate) ? new Date(contact.expiryDate) < new Date() : false;
}

export default {
  name: 'SchoolContactsForm',
  components: {
    PrimaryButton,
    NewSchoolContactPage,
    EditSchoolContactPage,
    SchoolContact,
    ConfirmationDialog
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
    functionName: {
      type: String,
      required: true,
      default: null
    },
    schoolCollectionObject: {
      type: Object,
      required: false,
      default: null
    },
  },
  emits: ['school-contacts'],
  data() {
    return {
      loadingCount: 0,
      independentArray: [SCHOOL_CATEGORY_CODES.INDEPEND, SCHOOL_CATEGORY_CODES.INDP_FNS],
      offshoreArray: [SCHOOL_CATEGORY_CODES.OFFSHORE],
      schoolContactTypes: [],
      schoolContacts: new Map(),
      school: {},
      editContact: {},
      newContactSheet: false,
      editContactSheet: false,
      selectedSchoolId: null,
      SCHOOL_CONTACT_TYPES: SCHOOL_CONTACT_TYPES,
      MINISTRY_CONTACTS: MINISTRY_CONTACTS
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(instituteStore, ['schoolContactTypeCodes', 'independentAuthoritySchoolContacts', 'offshoreSchoolContacts', 'regularSchoolContactTypes']),
    isLoading() {
      return this.loadingCount !== 0;
    },
    isOffshoreSchool(){
      return this.offshoreArray.includes(this.school.schoolCategoryCode);
    }
  },
  watch: {
    async school(value) {
      if (!this.schoolContactTypeCodes) {
        await this.loadSchoolContactTypeCodes();
      }
      if (this.offshoreArray.includes(value?.schoolCategoryCode)) {
        this.schoolContactTypes = this.offshoreSchoolContacts;
      } else if (this.independentArray.includes(value?.schoolCategoryCode)) {
        this.schoolContactTypes = this.independentAuthoritySchoolContacts;
      } else {
        this.schoolContactTypes = this.regularSchoolContactTypes;
      }
      this.schoolContactTypes.sort((schoolContactA, schoolContactB) => schoolContactA.displayOrder - schoolContactB.displayOrder);
    }
  },
  created() {
    this.getThisSchoolsContacts();
  },
  methods: {
    redirectToSchoolDetails() {
      this.$router.push({name: 'schoolDetails', params: {schoolID: this.school.schoolId}});
    },
    async loadSchoolContactTypeCodes() {
      this.loadingCount += 1;
      await instituteStore().getSchoolContactTypeCodes()
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
      this.selectedSchoolId = this.schoolID ? this.schoolID: this.userInfo.activeInstituteIdentifier;
      ApiService.apiAxios.get(`${ApiRoutes.school.SCHOOL_DETAILS_BY_ID}/${this.selectedSchoolId}`)
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
          this.$emit('school-contacts', this.school.contacts);
        }).catch(error => {
          console.error(error);
          let fallback = 'An error occurred while trying to get a list of the school\'s contacts.' +
              ' Please try again later.';
          this.setFailureAlert(error?.response?.data?.message || fallback);
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    showEditButton() {
      return this.schoolCollectionObject?.sdcSchoolCollectionStatusCode !== 'SUBMITTED';
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
    hasSchoolEditPermission() {
      let permissions = this.userInfo?.activeInstitutePermissions;
      if (permissions === undefined) return false;
      return permissions.filter(p => p === PERMISSION.EDX_SCHOOL_EDIT).length > 0;
    },
    canEditSchoolContacts() {
      return this.hasSchoolEditPermission() && !this.isOffshoreSchool;
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
    removeContact(schoolID, schoolContactID) {
      const opts = {
        color: '#003366',
        dense: false,
        titleBold: true,
        resolveText: 'Remove'
      };
      this.$refs.confirmationDialog.open('Please Confirm', 'Are you sure you want to remove this contact?',opts)
        .then((result) => {
          if (result) { // the component returns true only when user confirms the dialog.
            this.loadingCount += 1;
            ApiService.apiAxios.delete(`${ApiRoutes.school.BASE_URL}/${schoolID}/contact/${schoolContactID}`).then(() => {
              this.setSuccessAlert('School contact removed successfully');
              this.getThisSchoolsContacts();
            }).catch(error => {
              console.log(error);
              this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'Error removing school contact. Please try again later');
            }).finally(() => {
              this.loadingCount -= 1;
            });
          }
        });
    },
    getStatusColor,
    formatDate,
    formatPhoneNumber,
    formatContactName,
    showDetailsButton() {
      return this.functionName !== 'SDC';
    },
  }
};
</script>

