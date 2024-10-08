<template>
  <v-container
    :fluid="true"
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
      <v-row cols="2">
        <v-col class="d-flex justify-start">
          <v-chip
            class="mr-3"
            variant="elevated"
            color="#A9D18E"
          >
            Active
          </v-chip>
          <v-chip
            class="mr-3"
            variant="elevated"
            color="#9DC3E6"
          >
            Pending Start Date
          </v-chip>
          <v-chip
            color="#F4B183"
            variant="elevated"
          >
            Pending End Date
          </v-chip>
        </v-col>
        <v-col class="d-flex justify-end">
          <PrimaryButton
            v-if="hasAccess"
            id="newContactButton"
            icon-left
            width="11em"
            icon="mdi-plus-thick"
            text="New Contact"
            :click-action="openNewContactSheet"
          />
        </v-col>
      </v-row>
      <v-row
        class="d-sm-flex align-center searchBox elevation-2 mb-3"
        @keydown.enter="searchButtonClicked"
      >
        <v-col>
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
            @update:model-value="searchButtonClicked"
          />
        </v-col>
        <v-col>
          <v-text-field
            id="first-name-search-text-field"
            v-model="searchFilter.firstName"
            variant="underlined"
            label="Contact First Name"
            :clearable="true"
          />
        </v-col>
        <v-col>
          <v-text-field
            id="last-name-search-text-field"
            v-model="searchFilter.lastName"
            variant="underlined"
            label="Contact Last Name"
            :clearable="true"
          />
        </v-col>
        <v-col
          class="text-right"
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
              {{
                districtContactType.label
              }}
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
              density="compact"
              type="info"
              variant="tonal"
              text="This contact type will not be published publicly. These contacts will only be shared with the ministry."
            />
          </v-col>
        </v-row>
        <v-row
          v-if="hasContactsForThisType(districtContactType)"
          cols="2"
        >
          <v-col
            v-for="contact in filteredDistrictContacts.get(districtContactType.districtContactTypeCode)"
            :key="contact.schoolId"
            class="pt-0"
            cols="5"
            lg="4"
          >
            <DistrictContact
              :contact="contact"
              :district-i-d="$route.params.districtID"
              :can-edit-district-contact="hasAccess"
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
      :inset="true"
      :no-click-animation="true"
      :scrollable="true"
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
      :inset="true"
      :no-click-animation="true"
      :scrollable="true"
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
import {setEmptyInputParams} from '../../utils/common';

export default {
  name: 'DistrictContacts',
  components: {
    NewDistrictContactPage,
    EditDistrictContactPage,
    DistrictContact,
    PrimaryButton,
    ConfirmationDialog,
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: false,
      default: null
    },
    hasAccess: {
      type: Boolean,
      required: true
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
