<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-col class="mt-1 d-flex justify-start">
      <v-icon
        small
        color="#1976d2"
      >
        mdi-arrow-left
      </v-icon>
      <a
        class="ml-1"
        @click="backButtonClick"
      >Return to Dashboard</a>
    </v-col>
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
            text="View District Details"
            :click-action="redirectToDistrictDetails"
          />
          <PrimaryButton
            id="newContactButton"
            width="12em"
            icon="mdi-plus-thick"
            text="New Contact"
            :click-action="openNewContactSheet"
          />
        </v-col>
      </v-row>
      <div
        v-for="districtContactType in districtContactTypes"
        :key="districtContactType.code"
      >
        <v-row>
          <v-col>
            <h2 style="color:#1A5A96">
              {{ districtContactType.label }}
            </h2>
          </v-col>
        </v-row>
        <v-row v-if="!districtContactType.publiclyAvailable">
          <v-col>
            <v-alert
              :id="`publiclyAvailableAlert${districtContactType.label}`"
              color="#E9EBEF"
              dense
              text
              type="info"
            >
              <p style="color: #003366">
                Contacts of this type are only available to the ministry and not available to public.
              </p>
            </v-alert>
          </v-col>
        </v-row>
        <v-row
          v-if="districtContacts.has(districtContactType.districtContactTypeCode)"
          cols="2"
        >
          <v-col
            v-for="contact in districtContacts.get(districtContactType.districtContactTypeCode)"
            :key="contact.schoolId"
            cols="5"
            lg="4"
          >
            <DistrictContact
              :contact="contact"
              :district-i-d="$route.params.districtID"
              :can-edit-district-contact="canEditDistrictContact"
              :handle-open-editor="() => openEditContactSheet(contact)"
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
    <v-navigation-drawer
      v-model="newContactSheet"
      inset
      no-click-animation
      location="bottom"
      temporary
      style="width: 50%; height: max-content; left: 25%;"
      scrollable
      persistent
    >
      <NewDistrictContactPage
        v-if="newContactSheet"
        :district-contact-types="districtContactTypes"
        :district-i-d="$route.params.districtID"
        @new-district-contact:close-new-district-contact-page="newContactSheet = !newContactSheet"
        @new-district-contact:add-new-district-contact="newDistrictContactAdded"
      />
    </v-navigation-drawer>
    <v-navigation-drawer
      v-model="editContactSheet"
      inset
      no-click-animation
      location="bottom"
      style="width: 50%; height: max-content; left: 25%;"
      temporary
      scrollable
      persistent
    >
      <EditDistrictContactPage
        v-if="editContactSheet"
        :contact="editContact"
        :district-contact-types="districtContactTypes"
        :district-i-d="$route.params.districtID"
        :close-handler="() => editContactSheet = false"
        :on-success-handler="contactEditSuccess"
      />
    </v-navigation-drawer>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import PrimaryButton from '../util/PrimaryButton.vue';
import NewDistrictContactPage from './NewDistrictContactPage.vue';
import EditDistrictContactPage from './EditDistrictContactPage.vue';
import DistrictContact from './DistrictContact.vue';
import { mapState } from 'pinia';
import { authStore } from '../../store/modules/auth';
import alertMixin from '../../mixins/alertMixin';
import { isExpired } from '../../utils/institute/status';
import {sortBy} from 'lodash';
import {PERMISSION} from '../../utils/constants/Permission';

export default {
  name: 'DistrictContactsPage',
  components: {
    PrimaryButton,
    NewDistrictContactPage,
    EditDistrictContactPage,
    DistrictContact
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: false,
      default: null
    },
  },
  data() {
    return {
      loadingCount: 0,
      districtContactTypes: [],
      districtContacts: new Map(),
      editContact: null,
      newContactSheet: false,
      editContactSheet: false
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    loading() {
      return this.loadingCount !== 0;
    },
    canEditDistrictContact() {
      return this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.EDX_USER_DISTRICT_ADMIN).length > 0;
    },
  },
  created() {
    this.getDistrictContactTypeCodes();
    this.getThisDistrictsContacts();
  },
  methods: {
    getDistrictContactTypeCodes() {
      this.loadingCount += 1;
      ApiService.apiAxios.get(ApiRoutes.institute.DISTRICT_CONTACT_TYPE_CODES)
        .then(response => {
          this.districtContactTypes = response.data;
          this.districtContactTypes.sort((a,b) => a.displayOrder - b.displayOrder);
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get the details of available District Contact Type Codes. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    getThisDistrictsContacts(){
      this.loadingCount += 1;
      let searchDistrictID = this.districtID ? this.districtID: this.userInfo.activeInstituteIdentifier;

      ApiService.apiAxios.get(`${ApiRoutes.district.BASE_URL}/${searchDistrictID}`)
        .then(response => {
          this.districtContacts = new Map();
          response.data.contacts = sortBy(response.data.contacts, ['firstName']);
          response.data.contacts.forEach(contact => {
            if(!isExpired(contact.expiryDate)) {
              if (!this.districtContacts.has(contact.districtContactTypeCode)) {
                this.districtContacts.set(contact.districtContactTypeCode, [contact]);
                return;
              }
              this.districtContacts.get(contact.districtContactTypeCode).push(contact);
            }
          });
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get a list of the district\'s contacts. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    newDistrictContactAdded() {
      this.newContactSheet= !this.newContactSheet;
      this.getThisDistrictsContacts();
    },
    openEditContactSheet(contact) {
      this.editContact = contact;
      this.editContactSheet = !this.editContactSheet;
    },
    openNewContactSheet(){
      this.newContactSheet = !this.newContactSheet;
    },
    contactEditSuccess() {
      this.getThisDistrictsContacts();
    },
    backButtonClick() {
      this.$router.push({name: 'home'});
    },
    redirectToDistrictDetails() {
      this.$router.push({name: 'districtDetails', params: {districtID: this.districtID}});
    }
  },
};
</script>

<style scoped>

:deep(.mdi-information){
  color: #003366;
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
