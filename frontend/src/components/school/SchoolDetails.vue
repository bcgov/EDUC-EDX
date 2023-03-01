<template>
  <v-form ref="schoolDetailsForm" v-model="schoolDetailsFormValid">
  <v-container class="containerSetup" fluid>
    <v-row v-if="!loading && editing" class="d-flex justify-center">
      <v-col>
        <v-alert style="color: rgb(0, 51, 102)" id="nonEditableAlert" color="#E9EBEF" class="pa-5 mb-0" icon="mdi-help-circle-outline" dense text type="info">
          <span>Require updates to non-editable fields? Please contact {{ emailBox }}</span>
        </v-alert>
      </v-col>
    </v-row>
    <v-col class="mt-1 d-flex justify-start">
      <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
      <a v-if="isDistrictUser()" class="ml-1" @click="backButtonClick">Return to School List</a>
      <a v-else class="ml-1" @click="backButtonClick">Return to Dashboard</a>
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
    <v-row v-else no-gutters>
      <v-col>
        <v-row class="d-flex justify-start">
          <v-col cols="6" class="d-flex justify-start">
            <h2 class="subjectHeading">{{ school.mincode }} - {{ school.displayName }}</h2>
          </v-col>
          <v-col v-if="!editing" cols="6" class="d-flex justify-end">
            <PrimaryButton class="mr-2 mb-3" secondary id="viewContactsButton" icon="mdi-account-multiple-outline" text="View School Contacts" :clickAction="redirectToSchoolContacts"></PrimaryButton>
            <PrimaryButton id="schoolDetailsEditButton" class="mr-0 mb-3" icon="mdi-pencil" text="Edit"
                           v-if="canEditSchoolDetails()" :clickAction="toggleEdit"></PrimaryButton>
          </v-col>
          <v-col v-else cols="6" class="d-flex justify-end">
            <PrimaryButton class="mr-2" secondary id="cancelButton" width="6em" text="Cancel" :clickAction="cancelClicked"></PrimaryButton>
            <PrimaryButton id="saveButton" width="6em" text="Save" :disabled="!schoolDetailsFormValid"
                           :clickAction="updateSchoolDetails"></PrimaryButton>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col class="d-flex">
                <div class="ministryOwnershipTeamName"  style="color: black">{{district.districtNumber}} - {{district.name}}</div>
              </v-col>
            </v-row>
        <v-row class="d-flex justify-start">
          <v-col class="d-flex">
                <v-icon class="ml-n1 pr-3" :color="getStatusColorAuthorityOrSchool(school.status)" dark>
                  mdi-circle-medium
                </v-icon>
            <span v-if="!editing">{{ school.status }}</span>
            <span v-else class="mt-5">{{ school.status }}</span>
              </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-phone-outline
                </v-icon>
                <div v-if="!editing">
                  <span v-if="school.phoneNumber" class="ml-n1">{{ formatPhoneNumber(school.phoneNumber) }}</span>
                  <a v-if="showEditLinks(school.phoneNumber)" id="addPhoneLink" class="editField" @click="toggleEdit">+Phone</a>
                </div>
                <v-text-field id="schoolDetailsPhoneNumber" v-else class="shrink py-0" @keypress="isNumber($event)" required :maxlength="10" :rules="[rules.required(), rules.phoneNumber()]" v-model="schoolDetailsCopy.phoneNumber"/>
              </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-at
                </v-icon>
                <div v-if="!editing">
                  <span v-if="school.email" class="ml-n1">{{ school.email }}</span>
                  <a v-if="showEditLinks(school.email)" class="editField" id="addEmailLink" @click="toggleEdit">+Email</a>
                </div>
                <v-text-field id="schoolDetailsEmail" v-else class="py-0" required :rules="[rules.required(), rules.email()]" :maxlength="255" v-model="schoolDetailsCopy.email"/>
              </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-fax
                </v-icon>
                <div v-if="!editing">
                  <span v-if="school.faxNumber" class="ml-n1">{{ formatPhoneNumber(school.faxNumber) }}</span>
                  <a v-if="showEditLinks(school.faxNumber)" class="editField" id="addFaxLink" @click="toggleEdit">+Fax</a>
                </div>
                <v-text-field id="schoolDetailsFaxNumber" v-else class="shrink py-0" @keypress="isNumber($event)" :rules="[rules.phoneNumber('Fax number must be valid')]" :maxlength="10" v-model="schoolDetailsCopy.faxNumber"/>
              </v-col>
          <v-col class="d-flex">
            <v-icon class="mb-1 mr-1" aria-hidden="false">
                  mdi-web
                </v-icon>
                <div v-if="!editing">
                  <a v-if="cleanWebsiteUrl" :href="cleanWebsiteUrl" target="_blank">{{ cleanWebsiteUrl }}</a>
                  <a v-if="showEditLinks(cleanWebsiteUrl)" class="editField" id="addWebsiteLink" @click="toggleEdit">+Website</a>
                </div>
                <v-text-field id="schoolDetailsWebsite" v-if="editing" class="py-0" :rules="[rules.website()]" :maxlength="255" v-model="schoolDetailsCopy.website"/>
              </v-col>
            </v-row>
        <v-row>
          <v-col>
            <v-divider class="divider"></v-divider>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col cols="12" class="d-flex justify-start">
            <h2 class="subjectHeading pt-4">School Details</h2>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-start">
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">Open Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span class="ministryLine" style="color: black">{{ formatDate(school.openedDate) || '-' }}</span>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" lg="3" class="pb-0 pt-0">
            <v-row no-gutters class="d-flex justify-start">
              <v-col cols="10" class="d-flex justify-start">
                <span style="color: grey">Close Date</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="d-flex justify-start">
                <span class="ministryLine" style="color: black">{{ formatDate(school.closedDate) || '-' }}</span>
              </v-col>
            </v-row>
          </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
              <v-row no-gutters class="d-flex justify-start">
                <v-col cols="10" class="d-flex justify-start">
                  <span style="color: grey">Facility Type</span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="d-flex justify-start">
                  <span class="ministryLine" style="color: black">{{school.facilityType}}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
              <v-row no-gutters class="d-flex justify-start">
                <v-col cols="10" class="d-flex justify-start">
                  <span style="color: grey">School Category</span>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="10" class="d-flex justify-start">
                  <span class="ministryLine" style="color: black">{{ school.schoolCategory }}</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start pt-2">
            <v-col cols="4" lg="3" class="pb-0 pt-0">
              <v-row no-gutters>
                <v-col cols="10" class="pr-0">
                  <span style="color: grey">Grades Offered</span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="d-flex justify-start">
                  <span class="ministryLine" style="color: black">{{ getGradesOffered(school.grades) }}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
              <v-row no-gutters class="">
                <v-col cols="10" class="d-flex justify-start">
                  <span style="color: grey">School Organization</span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="d-flex justify-start">
                  <span v-if="!editing" class="ministryLine" style="color: black">{{
                      getSchoolOrganization(school)
                    }}</span>
                  <v-select v-else :items="schoolActiveOrganizationTypes"
                            item-value="schoolOrganizationCode"
                            item-title="label"
                            v-model="schoolDetailsCopy.schoolOrganizationCode"
                            single
                            dense
                            class="pt-0 mt-0"
                            required
                  ></v-select>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="4" lg="3" class="pb-0 pt-0">
              <v-row no-gutters class="d-flex justify-start">
                <v-col cols="10" class="d-flex justify-start">
                  <span style="color: grey">NLC Activity</span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="10" class="d-flex justify-start">
                  <span v-if="!editing" class="ministryLine" style="color: black">{{ getNLCActivity(school) }}</span>
                  <v-select v-else :items="schoolActiveNeighborhoodLearningTypes"
                            item-value="neighborhoodLearningTypeCode"
                            item-title="label"
                            v-model="schoolDetailsCopy.neighborhoodLearning"
                            multiple
                            dense
                            class="pt-0 mt-0"
                            id="schoolDetailsNlc"
                  ></v-select>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start">
            <v-col cols="12" class="d-flex justify-start">
              <h2 class="subjectHeading pt-4">Addresses</h2>
            </v-col>
          </v-row>
          <v-row v-if="!hasMailingAddress() && !editing" no-gutters class="d-flex justify-start">
            <v-col>
              <a id="addAddressButton" v-if="canEditSchoolDetails()" class="editField" @click="toggleEdit">+Address</a>
            </v-col>
          </v-row>
          <v-row v-else no-gutters class="d-flex justify-start">
            <v-col v-if="editing || hasMailingAddress()" cols="3">
              <v-row>
                <v-col>
                  <v-icon class="pb-1 mr-1" right>
                    mdi-email-outline
                  </v-icon>
                  <span>Mailing Address</span>
                </v-col>
              </v-row>
              <v-row v-if="!editing" no-gutters>
                <v-col>
                  <v-row class="ml-9" no-gutters>
                    <v-col>
                      <span>{{ getMailingAddressItem('addressLine1') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span>{{ getMailingAddressItem('addressLine2') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span>{{
                          getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode') + ', ' + getMailingAddressItem('countryCode')
                        }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span>{{ getMailingAddressItem('postal') }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row v-else no-gutters>
                <v-col>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Line 1
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field id="mailAddressLine1" required :rules="[rules.required()]" :maxlength="255"
                                    class="shrink mt-n5 mb-3" v-model="getMailingAddressCopy()[0].addressLine1">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Line 2
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field id="mailAddressLine2" class="shrink mt-n5 mb-3" :maxlength="255"
                                    v-model="getMailingAddressCopy()[0].addressLine2">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      City
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field id="mailAddressCity" required :rules="[rules.required()]" class="shrink mt-n5 mb-3"
                                    :maxlength="255" v-model="getMailingAddressCopy()[0].city">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Province
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8" class="d-flex">
                      <v-select
                          id="mailAddressProvince"
                          :items="this.provinceCodeValues"
                          item-title="label"
                          item-value="provinceCode"
                          v-model="getMailingAddressCopy()[0].provinceCode"
                          dense
                          outlined
                          :rules="[rules.required()]"
                          required
                          class="mt-2"
                          style="color: black">
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Country
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8" class="d-flex">
                      <v-select
                          id="mailAddressCountry"
                          :items="this.countryCodeValues"
                          item-title="label"
                          item-value="countryCode"
                          :rules="[rules.required()]"
                          v-model="getMailingAddressCopy()[0].countryCode"
                          dense
                          outlined
                          class="mt-2 mb-2"
                          style="color: black">
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col style="color: grey">
                      Postal Code
                    </v-col>
                  </v-row>
                  <v-row class="ml-9" no-gutters>
                    <v-col cols="8">
                      <v-text-field :maxlength="6" required :rules="[rules.required(), rules.postalCode()]"
                                    id="mailAddressPostal" class="shrink mt-n5 mb-3"
                                    v-model="getMailingAddressCopy()[0].postal">
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
            <v-col v-if="!isOffshoreSchool" cols="3">
              <v-row>
                <v-col>
                  <v-icon class="pb-1 mr-1" right>
                    mdi-home-outline
                  </v-icon>
                  <span>Physical Address</span>
                </v-col>
              </v-row>
              <v-row v-if="!hasSamePhysicalAddress && !editing" no-gutters>
                <v-col>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span>{{ getPhysicalAddressItem('addressLine1') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span>{{ getPhysicalAddressItem('addressLine2') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span>{{
                          getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode') + ', ' + getPhysicalAddressItem('countryCode')
                        }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-9">
                      <span>{{ getPhysicalAddressItem('postal') }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row v-else no-gutters>
                <v-col>
                  <v-row class="ml-9" no-gutters>
                    <v-col v-if="sameAsMailingCheckbox && !editing" class="fontItalic">
                      <span>Same as Mailing Address</span>
                    </v-col>
                    <v-col v-else>
                      <v-row no-gutters>
                        <v-col>
                          <v-row no-gutters>
                            <v-col>
                              <v-row v-if="!sameAsMailingCheckbox" no-gutters>
                                <v-col>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Line 1
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressLine1" required :rules="[rules.required()]"
                                                    :maxlength="255" class="shrink mt-n5 mb-3"
                                                    v-model="getPhysicalAddressCopy()[0].addressLine1">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Line 2
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressLine2" :maxlength="255" class="shrink mt-n5 mb-3"
                                                    v-model="getPhysicalAddressCopy()[0].addressLine2">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      City
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressCity" required :rules="[rules.required()]"
                                                    :maxlength="255" class="shrink mt-n5 mb-3"
                                                    v-model="getPhysicalAddressCopy()[0].city">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Province
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                          id="physicalAddressProvince"
                                          :items="this.provinceCodeValues"
                                          item-title="label"
                                          item-value="provinceCode"
                                          v-model="getPhysicalAddressCopy()[0].provinceCode"
                                          dense
                                          required
                                          :rules="[rules.required()]"
                                          outlined
                                          class="mt-2"
                                          style="color: black">
                                      </v-select>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Country
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                          id="physicalAddressCountry"
                                          :items="this.countryCodeValues"
                                          item-title="label"
                                          item-value="countryCode"
                                          v-model="getPhysicalAddressCopy()[0].countryCode"
                                          dense
                                          :rules="[rules.required()]"
                                          required
                                          outlined
                                          class="mt-2 mb-2"
                                          style="color: black">
                                      </v-select>
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col style="color: grey">
                                      Postal Code
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field id="physicalAddressPostal" required
                                                    :rules="[rules.required(), rules.postalCode()]" :maxlength="6"
                                                    class="shrink mt-n5 mb-3"
                                                    v-model="getPhysicalAddressCopy()[0].postal">
                                      </v-text-field>
                                    </v-col>
                                  </v-row>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col>
                                  <v-checkbox
                                      dense
                                      id="sameAsMailingCheckbox"
                                      @click.native="clickSameAsAddressButton"
                                      v-model="sameAsMailingCheckbox"
                                      label="Same as Mailing Address"
                                      class="mt-n3 pt-0"
                                  ></v-checkbox>
                                </v-col>
                              </v-row>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <ConfirmationDialog ref="confirmSchoolDetailsUpdateAndSave">
      <template v-slot:message>
        <p>All changes made to school details will be <strong>available to the public on save</strong>.</p>
        <p>Please be sure to review your changes carefully before you publish them.</p>
      </template>
    </ConfirmationDialog>
  </v-form>
</template>

<script>

import PrimaryButton from '../util/PrimaryButton.vue';
import { authStore } from '../../store/modules/auth';
import { instituteStore } from '../../store/modules/institute';
import { mapState } from 'pinia';
import alertMixin from '../../mixins/alertMixin';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import {formatPhoneNumber, formatDate} from '../../utils/format';
import {getStatusColorAuthorityOrSchool,getStatusAuthorityOrSchool} from '../../utils/institute/status';
import {sanitizeUrl} from '@braintree/sanitize-url';
import {deepCloneObject} from '../../utils/common';
import * as Rules from '../../utils/institute/formRules';
import {isNumber} from '../../utils/institute/formInput';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';

export default {
  name: 'SchoolDetailsPage',
  mixins: [alertMixin],
  components: {
    ConfirmationDialog,
    PrimaryButton,
  },
  props: {
    schoolID: {
      type: String,
      required: false
    },
  },
  data() {
    return {
      school: '',
      district: '',
      schoolFacilityTypes: [],
      schoolCategoryTypes: [],
      schoolOrganizationTypes: [],
      schoolNeighborhoodLearningTypes: [],
      schoolActiveOrganizationTypes: [],
      schoolActiveNeighborhoodLearningTypes: [],
      schoolGradeTypes: [],
      loading: true,
      cleanWebsiteUrl:'',
      schoolDetailsFormValid:true,
      editing: false,
      sameAsMailingCheckbox: true,
      schoolDetailsCopy: {},
      provinceCodeValues: [],
      countryCodeValues: [],
      selectedNLCs: [],
      rules: Rules,
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(instituteStore, ['facilityTypeCodes']),
    ...mapState(instituteStore, ['schoolCategoryTypeCodes']),
    ...mapState(instituteStore, ['schoolOrganizationTypeCodes']),
    ...mapState(instituteStore, ['schoolNeighborhoodLearningCodes']),
    ...mapState(instituteStore, ['activeSchoolOrganizationTypeCodes']),
    ...mapState(instituteStore, ['activeSchoolNeighborhoodLearningCodes']),
    ...mapState(instituteStore, ['provinceCodes']),
    ...mapState(instituteStore, ['countryCodes']),
    ...mapState(instituteStore, ['gradeCodes']),
    dataReady: function () {
      return this.userInfo;
    },
    emailBox(){
      if(this.school.schoolCategoryCode === 'INDEPEND'){
        return 'educ.independentschoolsoffice@gov.bc.ca';
      } else if(this.school.schoolCategoryCode === 'OFFSHORE'){
        return 'offshore.administrator@gov.bc.ca';
      }
      return 'data.management@gov.bc.ca';
    },
    hasSamePhysicalAddress(){
      return !this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    isOffshoreSchool(){
      return this.school.schoolCategoryCode === 'OFFSHORE';
    }
  },
  created() {
    instituteStore().getFacilityTypeCodes().then(() => {
      this.schoolFacilityTypes = this.facilityTypeCodes;
    });
    instituteStore().getSchoolCategoryTypeCodes().then(() => {
      this.schoolCategoryTypes = this.schoolCategoryTypeCodes;
    });
    instituteStore().getSchoolOrganizationTypeCodes().then(() => {
      this.schoolOrganizationTypes = this.schoolOrganizationTypeCodes;
    });
    instituteStore().getSchoolNeighborhoodLearningCodes().then(() => {
      this.schoolNeighborhoodLearningTypes = this.schoolNeighborhoodLearningCodes;
    });
    instituteStore().getAllActiveSchoolOrganizationTypeCodes().then(() => {
      this.schoolActiveOrganizationTypes = this.activeSchoolOrganizationTypeCodes;
    });
    instituteStore().getAllActiveSchoolNeighborhoodLearningCodes().then(() => {
      this.schoolActiveNeighborhoodLearningTypes = this.activeSchoolNeighborhoodLearningCodes;
    });
    instituteStore().getGradeCodes().then(() => {
      this.schoolGradeTypes = this.gradeCodes;
    });
    instituteStore().getProvinceCodes().then(() => {
      this.provinceCodeValues = this.provinceCodes.filter(province => province.provinceCode === 'BC' || province.provinceCode === 'YT');
    });
    instituteStore().getCountryCodes().then(() => {
      this.countryCodeValues = this.countryCodes;
    });
    this.getThisSchoolsDetails();
  },
  methods: {
    redirectToSchoolContacts(){
      this.$router.push({name: 'schoolContacts', params: {schoolID: this.school.schoolId}});
    },
    getThisSchoolsDetails(){
      this.loading = true;
      this.school = '';

      let searchSchoolID = this.schoolID ? this.schoolID: this.userInfo.activeInstituteIdentifier;

      ApiService.apiAxios.get(ApiRoutes.school.SCHOOL_DETAILS_BY_ID + '/' + searchSchoolID)
        .then(response => {
          this.school = response.data;
          this.populateExtraSchoolFields(this.school);
          this.getDistrictDetails(this.school.districtId);
          this.cleanWebsiteUrl = this.school.website ? sanitizeUrl(this.school.website) : '';
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    getDistrictDetails(districtId){
      this.district = '';
      ApiService.apiAxios.get(ApiRoutes.institute.DISTRICT + '/'+ districtId)
        .then(response => {
          this.district = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    populateExtraSchoolFields(school){
      school.status = getStatusAuthorityOrSchool(school);
      school.facilityType = this.getFacilityType(school);
      school.schoolCategory = this.getSchoolCategory(school);
    },
    getMailingAddressItem(item){
      let mailingAddress = this.school.addresses.filter(address => address.addressTypeCode === 'MAILING');
      for (const x in mailingAddress[0]) {
        if(x === item){
          return mailingAddress[0][item];
        }
      }
    },
    getPhysicalAddressItem(item){
      let physicalAddress = this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
      for (const x in physicalAddress[0]) {
        if(x === item){
          return physicalAddress[0][item];
        }
      }
    },
    getGradesOffered(rawGrades){
      let gradeList = [];
      for(const grade of rawGrades){
        gradeList.push(this.schoolGradeTypes.find((facility) => facility.schoolGradeCode === grade.schoolGradeCode).label.replaceAll('Grade ', ''));
      }
      let onlyNumbers = gradeList.filter(Number);
      let onlyLetters = gradeList.filter(x => !onlyNumbers.includes(x));

      onlyNumbers = onlyNumbers.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      gradeList = onlyNumbers.concat(onlyLetters);
      return gradeList.toString().replace(/,/g, ', ');
    },
    getSchoolOrganization(school){
      return this.schoolOrganizationTypes.find((facility) => facility.schoolOrganizationCode === school?.schoolOrganizationCode).label;
    },
    getNLCActivity(school){
      let nLCActivityList = [];
      for(const nl of school.neighborhoodLearning){
        nLCActivityList.push(this.schoolNeighborhoodLearningTypes.find((facility) => facility.neighborhoodLearningTypeCode === nl?.neighborhoodLearningTypeCode).label);
      }
      nLCActivityList.sort();
      return nLCActivityList.toString().replace(/,/g, ', ');
    },
    showEditLinks(fieldValue) {
      return this.canEditSchoolDetails() && !fieldValue;
    },
    getFacilityType(school){
      return this.schoolFacilityTypes.find((facility) => facility.facilityTypeCode === school?.facilityTypeCode).label;
    },
    getSchoolCategory(school){
      return this.schoolCategoryTypeCodes.find((category) => category.schoolCategoryCode === school?.schoolCategoryCode).label;
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
    formatDate,
    formatPhoneNumber,
    getStatusColorAuthorityOrSchool,
    deepCloneObject,
    isNumber,
    getCountryName(countryCode){
      let countryName = '';
      if(countryCode === 'CA'){
        countryName = 'Canada';
      }
      return countryName;
    },
    canEditSchoolDetails(){
      return this.userInfo?.activeInstitutePermissions?.filter(perm => perm === 'EDX_USER_SCHOOL_ADMIN').length > 0;
    },
    async clickSameAsAddressButton() {
      await this.$nextTick();
      this.$refs.schoolDetailsForm.validate();
    },
    async toggleEdit() {
      this.schoolDetailsCopy = this.deepCloneObject(this.school);
      this.addAddressesIfRequired(this.schoolDetailsCopy);
      this.editing = !this.editing;
      await this.$nextTick();
      this.$refs.schoolDetailsForm.validate();
    },
    cancelClicked(){
      this.editing = false;
    },
    async updateSchoolDetails() {
      const confirmation = await this.$refs.confirmSchoolDetailsUpdateAndSave.open('Confirm Updates to School Details', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Publish Changes', rejectText: 'Return to School Details'});
      if (!confirmation) {
        return;
      }
      this.loading = true;
      if (this.sameAsMailingCheckbox) {
        this.schoolDetailsCopy.addresses = this.schoolDetailsCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
      }
      ApiService.apiAxios.put(`${ApiRoutes.school.BASE_URL}` + '/' + this.schoolDetailsCopy.schoolID, this.schoolDetailsCopy)
        .then(() => {
          this.setSuccessAlert('Success! The school details have been updated.');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while saving the school information. Please try again later.');
        })
        .finally(() => {
          this.toggleEdit();
          this.getThisSchoolsDetails();
        });
    },
    hasMailingAddress(){
      return this.school.addresses.filter(address => address.addressTypeCode === 'MAILING').length > 0;
    },
    hasPhysicalAddress(){
      return this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    getMailingAddressCopy(){
      return this.schoolDetailsCopy.addresses.filter(address => address.addressTypeCode === 'MAILING');
    },
    getPhysicalAddressCopy(){
      return this.schoolDetailsCopy.addresses.filter(address => address.addressTypeCode === 'PHYSICAL');
    },
    addAddressesIfRequired(school){
      let addresses = school.addresses;
      if(!this.hasMailingAddress()){
        addresses.push({
          'createUser': null,
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'addressId': null,
          'schoolId': null,
          'districtId': null,
          'independentAuthorityId': null,
          'phoneNumber': null,
          'email': null,
          'addressLine1': null,
          'addressLine2': null,
          'city': null,
          'postal': null,
          'addressTypeCode': 'MAILING',
          'provinceCode': null,
          'countryCode': null
        });
      }
      if(!this.hasPhysicalAddress()){
        addresses.push({
          'createUser': null,
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'addressId': null,
          'schoolId': null,
          'districtId': null,
          'independentAuthorityId': null,
          'phoneNumber': null,
          'email': null,
          'addressLine1': null,
          'addressLine2': null,
          'city': null,
          'postal': null,
          'addressTypeCode': 'PHYSICAL',
          'provinceCode': null,
          'countryCode': null
        });
      }
    },

  }
};
</script>

<style scoped>

.fontItalic{
  font-style: italic;
}

.divider {
  border-color: #FCBA19;
  border-width: unset;
  opacity: unset;
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
.editField {
  font-size: 14px;
  color: rgb(0, 51, 102);
  vertical-align: super;
}

.editField:hover {
  text-decoration: underline;
}
</style>
  
