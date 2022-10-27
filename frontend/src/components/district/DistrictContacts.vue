<template>
  <v-container class="containerSetup" fluid>
    <v-col class="mt-1 d-flex justify-start">
      <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
      <a class="pt-1 ml-1" @click="backButtonClick">Return to Dashboard</a>
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
        ></v-progress-circular>
      </v-col>
    </v-row>
    <template v-if="!loading">
      <v-row cols="2">
        <v-col class="d-flex justify-start">
          <v-chip class="mr-3" color="#A9D18E">Active</v-chip>
          <v-chip class="mr-3" color="#9DC3E6">Pending Start Date</v-chip>
          <v-chip color="#F4B183">Pending End Date</v-chip>
        </v-col>
        <v-col class="d-flex justify-end">
          <PrimaryButton width="12em" icon="mdi-plus-thick" text="New Contact" @click.native="openContactEditForm()"></PrimaryButton>
        </v-col>
      </v-row>
      <div v-for="districtContactType in districtContactTypes" :key="districtContactType.code">
        <v-row>
          <v-col>
            <h2 style="color:#1A5A96">{{districtContactType.label}}</h2>
          </v-col>
        </v-row>
        <v-row cols="2" v-if="districtContacts.has(districtContactType.districtContactTypeCode)">
          <v-col cols="5" lg="4" v-for="contact in districtContacts.get(districtContactType.districtContactTypeCode)" :key="contact.schoolId">
            <v-card>
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
                    <v-row no-gutters class="titleSetup">
                      <v-col cols="12" class="pt-1">
                        <strong>{{ contact.jobTitle }}</strong>
                      </v-col>
                      <v-col cols="12" class="pt-1">
                        <span>{{ contact.email }}</span>
                      </v-col>
                      <v-col cols="12" class="pt-1">
                        <span>{{ formatPhoneNumber(contact.phoneNumber) }}</span><span v-if="contact.phoneExtension"> ext. {{contact.phoneExtension}}</span>
                      </v-col>
                      <v-col cols="12" class="pt-1" v-if="contact.alternatePhoneNumber">
                        <span>{{ formatPhoneNumber(contact.alternatePhoneNumber) }} (alt.)</span> <span v-if="contact.alternatePhoneExtension"> ext. {{contact.alternatePhoneExtension}}</span>
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
        <v-row cols="2" v-else>
          <v-col>
            <p>No contacts of this type have been listed.</p>
          </v-col>
        </v-row>
      </div>
    </template>
    <v-bottom-sheet
        v-model="openForm"
        inset
        no-click-animation
        scrollable
        persistent
        width="30%"
        max-height="100%"
    >
      <v-card v-show="openForm" id="newContactSheet"
              class="information-window-v-card">
        <v-card-title class="sheetHeader pt-1 pb-1">New District Contact</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
        <v-form ref="editContactForm" v-model="ecFormValid">
          <v-col>
            <v-row>
              <v-col>
                <v-autocomplete
                    id="name-text-field"
                    label="Contact Type"
                    item-value="districtContactTypeCode"
                    item-text="label"
                    :items="districtContactTypes"
                    v-model="contactToEdit.districtContactTypeCode"
                    :rules="contactTypeRules"
                    clearable
                    required>
                </v-autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditFirstName"
                              v-model="contactToEdit.firstName"
                              :rules="firstNameRules"
                              label="First Name"
                              type="text"
                              maxlength="255"
                              required></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditLastName"
                              v-model="contactToEdit.lastName"
                              :rules="lastNameRules"
                              label="Last Name"
                              type="text"
                              maxlength="255"
                              required></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditTitle"
                              v-model="contactToEdit.title"
                              :rules="titleRules"
                              label="Title"
                              type="text"
                              maxlength="255"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditEmail"
                              v-model="contactToEdit.email"
                              :rules="emailRules"
                              label="Email"
                              type="text"
                              maxlength="255"
                              required></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditPhoneNumber"
                              v-model="contactToEdit.phoneNumber"
                              :rules="phNumRules"
                              label="Phone"
                              type="text"
                              maxlength="10"
                              :counter="10"
                              @keypress="isNumber($event)"
                              required></v-text-field>
              </v-col>
              <v-col>
                <v-text-field id="contactEditPhoneExt"
                              v-model="contactToEdit.phoneExtension"
                              :rules="phNumExtRules"
                              label="Ext"
                              type="text"
                              maxlength="10"
                              @keypress="isNumber($event)"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field id="contactEditAltPhoneNumber"
                              v-model="contactToEdit.alternatePhoneNumber"
                              :rules="altPhNumRules"
                              label="Alternative Phone"
                              type="text"
                              maxlength="10"
                              :counter="10"
                              @keypress="isNumber($event)"></v-text-field>
              </v-col>
              <v-col>
                <v-text-field id="contactEditAltPhoneExt"
                              v-model="contactToEdit.alternatePhoneExtension"
                              :rules="altPhNumExtRules"
                              label="Alternative Ext"
                              type="text"
                              maxlength="10"
                              @keypress="isNumber($event)"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-menu v-model="effDateMenu" :close-on-content-click="false" transition="scale-transition"
                        offset-y max-width="290px" min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="contactEditStartDate"
                        v-model="computedEffDateFormatted"
                        label="Start Date"
                        hint="YYYY/MM/DD format"
                        persistent-hint
                        append-icon="mdi-calendar"
                        @click:append="effDateMenu = true"
                        v-bind="attrs"
                        v-on="on"
                        :rules="startDateRules"
                        required
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="contactToEdit.effectiveDate"
                      no-title
                      @input="effDateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col>
                <v-menu v-model="expDateMenu" :close-on-content-click="false" transition="scale-transition"
                        offset-y max-width="290px" min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="contactEditEndDate"
                        v-model="computedExpDateFormatted"
                        label="End Date"
                        hint="YYYY/MM/DD format"
                        persistent-hint
                        append-icon="mdi-calendar"
                        @click:append="expDateMenu = true"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="contactToEdit.expiryDate"
                      no-title
                      @input="expDateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row no-gutters class="justify-end mt-n2 pr-2 pt-2">
              <v-col cols="12" class="d-flex justify-end">
                <PrimaryButton class="mr-3" id="cancelEditButton" :secondary="true" @click.native="cancelDistrictContactEdit"
                               text="Cancel"></PrimaryButton>
                <PrimaryButton @click.native="saveDistrictContact(contactToEdit)" id="saveEditButton" :disabled="!ecFormValid" text="Save"></PrimaryButton>
              </v-col>
            </v-row>
          </v-col>
        </v-form>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '@/utils/constants';
import PrimaryButton from '../util/PrimaryButton';
import {mapGetters} from 'vuex';
import alertMixin from '@/mixins/alertMixin';
import {formatPhoneNumber, formatDate} from '@/utils/format';
import {getStatusColor, isExpired} from '@/utils/institute/status';

export default {
  name: 'DistrictContactsPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
  },
  props: {
    districtID: {
      type: String,
      required: false
    },
  },
  data() {
    return {
      loadingCount: 0,
      districtContactTypes: [],
      districtContacts: new Map(),
      loadingContactForm: true,
      openForm: false,
      saveEnabled: true,
      ecFormValid: false,
      effDateMenu: false,
      expDateMenu: false,
      contactToEdit: {
        districtContactTypeCode: '',
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phoneNumber:'',
        phoneExtension:'',
        alternatePhoneNumber:'',
        alternatePhoneExtension:'',
        effectiveDate:'',
        expiryDate:''
      },
      contactTypeRules: [
        v => !!v || 'Contact Type is required',
      ],
      firstNameRules: [
        v => !!v || 'First Name is required',
      ],
      lastNameRules: [
        v => !!v || 'Last Name is required',
      ],
      titleRules: [

      ],
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /^[a-z\d]+@[a-z]+\.[a-z]{2,3}$/.test(v) || 'E-mail must be valid',
      ],
      phNumRules: [
        v => !!v || 'Phone Number is required',
        v => v.length >= 10 || 'Phone Number must be 10 digits',
      ],
      phNumExtRules: [
        v => !v || /^\d+$/.test(v) || 'Phone Extension must be valid',
      ],
      altPhNumRules: [
        v => !v || v.length >= 10 || 'Alt. Phone Number must be 10 digits',
      ],
      altPhNumExtRules: [
        v => !v || /^\d+$/.test(v) || 'Phone Extension must be valid',
      ],
      startDateRules: [
        v => !!v || 'Start Date is required',
      ],
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
    loading() {
      return this.loadingCount !== 0;
    },
    computedEffDateFormatted () {
      return this.formatEffectiveDisplayDate(this.contactToEdit.effectiveDate?.substring(0,10));
    },
    computedExpDateFormatted () {
      return this.formatEffectiveDisplayDate(this.contactToEdit.expiryDate?.substring(0,10));
    },
  },
  created() {
    this.getDistrictContactTypeCodes();
    this.getThisDistrictsContacts();
  },
  methods: {
    getDistrictContactTypeCodes() {
      this.loadingCount += 1;
      ApiService.apiAxios.get(ApiRoutes.district.DISTRICT_CONTACT_TYPE_CODES)
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

      ApiService.apiAxios.get(`${ApiRoutes.district.BASE_URL}/` + searchDistrictID)
        .then(response => {
          this.districtContacts = new Map();
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
    backButtonClick() {
      this.$router.push({name: 'home'});
    },
    saveDistrictContact(contact) {
      this.loadingContactForm = true;
      this.validateEditContactForm();

      contact.districtId = this.districtID;
      contact.createDate = null;
      contact.createUSer = this.userInfo.userName;
      contact.updateDate = null;
      contact.updateUser = null;
      if(contact.effectiveDate.length <= 10) {
        contact.effectiveDate = contact.effectiveDate + 'T00:00:00';
      }
      if (contact.expiryDate !== null && contact.expiryDate !== '') {
        contact.expiryDate = contact.expiryDate + 'T00:00:00';
      }

      const payload = contact;
      ApiService.apiAxios.post(`${ApiRoutes.district.CREATE_DISTRICT_CONTACT_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The district contact has been created.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the district contact information. Please try again later.');
        })
        .finally(() => {
          this.loadingContactForm = false;
          this.cancelDistrictContactEdit();
          this.contactToEdit = '';
          this.getThisDistrictsContacts();
        });
    },
    formatEffectiveDisplayDate (effectiveDate) {
      if (!effectiveDate) return null;
      const [year, month, day] = effectiveDate.split('-');
      return `${year}/${month}/${day}`;
    },
    isNumber: function(evt) {
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    async openContactEditForm(){
      this.openForm = !this.openForm;
      await this.$nextTick();
      this.validateEditContactForm();
    },
    cancelDistrictContactEdit(){
      this.openForm = !this.openForm;
    },
    validateEditContactForm(){
      this.$refs.editContactForm.validate();
    },
    getStatusColor,
    formatDate,
    formatPhoneNumber,
  }
};
</script>

<style scoped>
.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
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

.titleSetup{
  word-break: break-word;
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
