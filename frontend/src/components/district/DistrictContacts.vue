<template>
  <v-container class="containerSetup">
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
          md="6"
          class="d-flex justify-md-end justify-start"
        >
          <PrimaryButton
            id="viewDetailsButton"
            class="mr-2 mb-3"
            secondary
            icon="mdi-domain"
            text="View Details"
            :click-action="redirectToDistrictDetails"
          />
          <PrimaryButton
            v-if="canEditDistrictContact"
            id="newContactButton"
            class="mb-3"
            width="12em"
            icon="mdi-plus-thick"
            text="New Contact"
            :click-action="openNewContactSheet"
          />
        </v-col>
      </v-row>
      <v-row
        class="d-sm-flex mb-3 align-center searchBox"
        @keydown.enter="searchButtonClicked"
      >
        <v-col
          cols="12"
          md="3"
          class="pb-0 pb-md-7"
        >
          <v-autocomplete
            id="status-select-field"
            v-model="searchFilter.districtContactTypeCode"
            :clearable="true"
            :items="districtContactTypes"
            item-title="label"
            variant="underlined"
            item-value="districtContactTypeCode"
            :menu-props="{closeOnContentClick:true}"
            label="Contact Type"
            hide-details="auto"
            @update:model-value="searchButtonClicked"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
          class="pb-0 pb-md-7"
        >
          <v-text-field
            id="first-name-search-text-field"
            v-model="searchFilter.firstName"
            variant="underlined"
            label="Contact First Name"
            :clearable="true"
            hide-details="auto"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
          class="pb-0 pb-md-7"
        >
          <v-text-field
            id="last-name-search-text-field"
            v-model="searchFilter.lastName"
            variant="underlined"
            label="Contact Last Name"
            :clearable="true"
            hide-details="auto"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
          class="d-flex justify-end"
        >
          <PrimaryButton
            id="district-clear-button"
            secondary
            text="Clear"
            :click-action="clearButtonClicked"
          />
          <PrimaryButton
            id="district-search-button"
            class="ml-2"
            text="Search"
            :click-action="searchButtonClicked"
          />
        </v-col>
      </v-row>
      <div
        v-for="districtContactType in filteredDistrictContactTypes"
        :key="districtContactType.code"
        class="pb-6"
      >
        <v-row>
          <v-col class="pb-1">
            <h2 style="color:#1A5A96">
              {{ districtContactType.label }}
            </h2>
          </v-col>
        </v-row>
        <v-row
          v-if="!districtContactType.publiclyAvailable"
          cols="2"
        >
          <v-col
            class="pt-0"
            cols="12"
          >
            <v-alert
              :id="`publiclyAvailableAlert${districtContactType.label}`"
              color="#003366"
              density="compact"
              type="info"
              variant="tonal"
            >
              <p>
                Contacts of this type are only available to the ministry and not available to public.
              </p>
            </v-alert>
          </v-col>
        </v-row>
        <v-row
          v-if="hasContactsForThisType(districtContactType)"
          cols="2"
        >
          <v-col
            v-for="contact in filteredDistrictContacts.get(districtContactType.districtContactTypeCode)"
            :key="contact.schoolId"
            lg="4"
            sm="6"
            cols="12"
            class="pt-0"
          >
            <DistrictContact
              :contact="contact"
              :district-i-d="$route.params.districtID"
              :can-edit-district-contact="canEditDistrictContact"
              :handle-open-editor="() => openEditContactSheet(contact)"
              @remove-district-contact:show-confirmation-prompt="removeContact"
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
    <v-bottom-sheet
      v-model="newContactSheet"
      :no-click-animation="true"
      :inset="true"
      :persistent="true"
    >
      <NewDistrictContactPage
        v-if="newContactSheet"
        :district-contact-types="districtContactTypes"
        :district-i-d="$route.params.districtID"
        @new-district-contact:close-new-district-contact-page="newContactSheet = !newContactSheet"
        @new-district-contact:add-new-district-contact="newDistrictContactAdded"
      />
    </v-bottom-sheet>
    <v-bottom-sheet
      v-model="editContactSheet"
      :no-click-animation="true"
      :inset="true"
      :persistent="true"
    >
      <EditDistrictContactPage
        v-if="editContactSheet"
        :contact="editContact"
        :district-contact-types="districtContactTypes"
        :district-i-d="$route.params.districtID"
        :close-handler="() => editContactSheet = false"
        :on-success-handler="contactEditSuccess"
      />
    </v-bottom-sheet>
    <ConfirmationDialog ref="confirmationDialog" />
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import PrimaryButton from '../util/PrimaryButton.vue';
import NewDistrictContactPage from './NewDistrictContactPage.vue';
import EditDistrictContactPage from './EditDistrictContactPage.vue';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import DistrictContact from './DistrictContact.vue';
import { mapState } from 'pinia';
import { authStore } from '../../store/modules/auth';
import alertMixin from '../../mixins/alertMixin';
import { isExpired } from '../../utils/institute/status';
import {sortBy, omitBy, isEmpty} from 'lodash';
import {PERMISSION} from '../../utils/constants/Permission';
import {setEmptyInputParams} from '../../utils/common';

export default {
  name: 'DistrictContactsPage',
  components: {
    PrimaryButton,
    NewDistrictContactPage,
    EditDistrictContactPage,
    DistrictContact,
    ConfirmationDialog
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
      editContactSheet: false,
      searchFilter: {
        districtContactTypeCode: null,
        firstName: '',
        lastName: ''
      },
      filteredDistrictContacts: new Map(),
      isFiltered: false
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    loading() {
      return this.loadingCount !== 0;
    },
    canEditDistrictContact() {
      return this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.EDX_DISTRICT_EDIT).length > 0;
    },
    filteredDistrictContactTypes() {
      if (!this.isFiltered) {
        return this.districtContactTypes;
      }
      return this.districtContactTypes.filter(districtContactType => this.hasContactsForThisType(districtContactType));
    }
  },
  created() {
    this.getDistrictContactTypeCodes();
    this.getThisDistrictsContacts();
  },
  methods: {
    clearButtonClicked() {
      setEmptyInputParams(this.searchFilter);
      this.searchButtonClicked();
    },
    searchButtonClicked() {
      const searchCriteriaWithoutNulls = omitBy(this.searchFilter, isEmpty); //removing null filter criteria
      this.isFiltered = Object.keys(searchCriteriaWithoutNulls).length !== 0; //setting isFiltered flag of use elsewhere

      //Creating a new map of district contacts (from districtContacts) by performing a wildcard search with each provided filter parameters
      this.filteredDistrictContacts = new Map(
        Array.from(this.districtContacts).map(([districtContactType, contactArray]) => [
          districtContactType,
          contactArray.filter((obj) =>
            Object.entries(searchCriteriaWithoutNulls).every(([filterKey, filterValue]) =>
              new RegExp(`^.*${filterValue}.*$`, 'i').test(obj[filterKey])
            )
          ),
        ])
      );
    },
    hasContactsForThisType(districtContactType) {
      return this.filteredDistrictContacts.has(districtContactType.districtContactTypeCode) && this.filteredDistrictContacts.get(districtContactType.districtContactTypeCode)?.length !== 0;
    },
    getDistrictContactTypeCodes() {
      this.loadingCount += 1;
      ApiService.apiAxios.get(ApiRoutes.institute.DISTRICT_CONTACT_TYPE_CODES + '?active=true')
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
          this.filteredDistrictContacts = this.districtContacts;
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
    },
    removeContact(districtID, districtContactID) {
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
            ApiService.apiAxios.delete(`${ApiRoutes.district.BASE_URL}/${districtID}/contact/${districtContactID}`).then(() => {
              this.setSuccessAlert('District contact removed successfully');
              this.getThisDistrictsContacts();
            }).catch(error => {
              console.log(error);
              this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'Error removing district contact. Please try again later');
            }).finally(() => {
              this.loadingCount -= 1;
            });
          }
        });
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

.searchBox {
  margin: 0;
  padding-left: 1em;
  padding-right: 1em;
  border-radius: 5px;
  background-color: rgb(235, 237, 239);
}

</style>
