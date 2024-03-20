<template>
  <v-form
    ref="schoolDetailsForm"
    v-model="schoolDetailsFormValid"
  >
    <v-container fluid>
      <v-row
        v-if="!loading && (editing || isOffshoreSchool)"
        class="d-flex justify-center mb-0"
      >
        <v-col>
          <v-alert
            id="nonEditableAlert"
            density="compact"
            type="info"
            variant="tonal"
          >
            <span v-if="isOffshoreSchool">Require updates to school details? Please contact {{ MINISTRY_CONTACTS.OFFSHORE_ADMIN }}</span>
            <span v-else>Require updates to non-editable fields? Please contact {{ emailBox }}</span>
          </v-alert>
        </v-col>
      </v-row>
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
      <v-row
        v-else
        no-gutters
      >
        <v-col>
          <v-row class="d-flex justify-start">
            <v-col
              v-if="!editing"
              class="d-flex justify-end"
            >
              <PrimaryButton
                v-if="canEditSchoolDetails() && showEditButton()"
                id="schoolDetailsEditButton"
                icon-left
                icon="mdi-pencil"
                text="Edit"
                :click-action="toggleEdit"
              />
            </v-col>
            <v-col
              v-else
              class="d-flex justify-end mt-1"
            >
              <PrimaryButton
                id="cancelButton"
                class="mr-2"
                secondary
                width="6em"
                text="Cancel"
                :click-action="cancelClicked"
              />
              <PrimaryButton
                id="saveButton"
                width="6em"
                text="Save"
                :disabled="!schoolDetailsFormValid"
                :click-action="updateSchoolDetails"
              />
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start">
            <v-col
                cols="4"
                lg="3"
                class="pb-0 pt-0"
            >
              <v-row
                  no-gutters
                  class="d-flex justify-start"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span style="color: grey">Status</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span>
                    <v-icon
                        class="ml-n1 pr-1"
                        :color="getStatusColorAuthorityOrSchool(school.status)"
                        dark
                    >
                      mdi-circle-medium
                    </v-icon>
                    {{ school.status }}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="4"
              lg="3"
              class="pb-0 pt-0"
            >
              <v-row
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Open Date</span>
                </v-col>
              </v-row>
              <v-row
                no-gutters
                class="pt-2"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span
                    class="ministryLine"
                    style="color: black"
                  >{{ formatDate(school.openedDate) || '-' }}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="4"
              lg="3"
              class="pb-0 pt-0"
            >
              <v-row
                no-gutters
                class="d-flex justify-start"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span style="color: grey">Close Date</span>
                </v-col>
              </v-row>
              <v-row
                no-gutters
                class="pt-2"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <span
                    class="ministryLine"
                    style="color: black"
                  >{{ formatDate(school.closedDate) || '-' }}</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start pt-7">
            <v-col
                cols="4"
                lg="3"
                class="pb-0 pt-0"
            >
              <v-row
                  no-gutters
                  class="d-flex justify-start"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span style="color: grey">School Category</span>
                </v-col>
              </v-row>
              <v-row
                  no-gutters
                  class="pt-2"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span
                      class="ministryLine"
                      style="color: black"
                  >{{ school.schoolCategory }}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col
                cols="4"
                lg="3"
                class="pb-0 pt-0"
            >
              <v-row
                  no-gutters
                  class="d-flex justify-start"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span style="color: grey">Facility Type</span>
                </v-col>
              </v-row>
              <v-row
                  no-gutters
                  class="pt-2"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span
                      class="ministryLine"
                      style="color: black"
                  >{{ school.facilityType }}</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="4"
              lg="3"
              class="pb-0 pt-0"
            >
              <v-row no-gutters>
                <v-col
                  cols="10"
                  class="pr-0"
                  :class="editing && isGradeOfferedUpdateAllowed ? 'mb-n5': ''"
                >
                  <span style="color: grey">Grades Offered</span>
                </v-col>
              </v-row>
              <v-row
                no-gutters
                class="pt-2"
              >
                <v-col
                  cols="10"
                  class="d-flex justify-start"
                >
                  <v-select
                    v-if="isGradeOfferedUpdateAllowed && editing"
                    id="schoolGrades"
                    v-model="schoolDetailsCopy.grades"
                    :items="gradeOptions"
                    item-title="label"
                    item-value="schoolGradeCode"
                    variant="underlined"
                    return-object
                    class="pt-0 mt-0"
                    multiple
                    @update:model-value="sortGrades()"
                  />
                  <span
                    v-else
                    id="schoolGradesValue"
                    class="ministryLine"
                    style="color: black"
                  >
                    {{ getGradesOffered(school.grades) }}
                  </span>
                </v-col>
              </v-row>
            </v-col>

          </v-row>
          <v-row class="d-flex justify-start pt-7">
            <v-col
                cols="4"
                lg="3"
                class="pb-0 pt-0"
            >
              <v-row>
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                    :class="editing ? 'mb-n5': ''"
                >
                  <span style="color: grey">School Organization</span>
                </v-col>
              </v-row>
              <v-row
                  no-gutters
                  class="pt-2"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span
                      v-if="!editing"
                      class="ministryLine"
                      style="color: black"
                  >{{
                      getSchoolOrganization(school)
                    }}</span>
                  <v-select
                      v-else
                      v-model="schoolDetailsCopy.schoolOrganizationCode"
                      :items="schoolActiveOrganizationTypes"
                      item-value="schoolOrganizationCode"
                      item-title="label"
                      single
                      variant="underlined"
                      dense
                      class="pt-0 mt-0"
                      required
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col
                cols="4"
                lg="3"
                class="pb-0 pt-0"
            >
              <v-row
                  no-gutters
                  class="d-flex justify-start"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                    :class="editing ? 'mb-n5': ''"
                >
                  <span style="color: grey">NLC Activity</span>
                </v-col>
              </v-row>
              <v-row
                  no-gutters
                  class="pt-2"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span
                      v-if="!editing"
                      class="ministryLine"
                      style="color: black"
                  >{{ getNLCActivity(school) }}</span>
                  <v-select
                    v-else
                    id="schoolDetailsNlc"
                    v-model="schoolDetailsCopy.neighborhoodLearning"
                    :items="schoolActiveNeighborhoodLearningTypes"
                    item-value="neighborhoodLearningTypeCode"
                    item-title="label"
                    variant="underlined"
                    multiple
                    dense
                    class="pt-0 mt-0"
                    return-object
                    @update:model-value="sortNlc()"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row
              no-gutters
              class="mt-6 d-flex justify-start"
          >
            <v-col
                cols="12"
                class="d-flex justify-start"
            >
              <h3 class="subHeading pt-4">
                Contact Information
              </h3>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start">
            <v-col
                cols="2"
                lg="2"
                class="pb-0 pt-0"
            >
              <v-row
                  v-if="!editing"
                  no-gutters
                  class="d-flex justify-start"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span style="color: grey">Phone</span>
                </v-col>
              </v-row>
              <v-row
                  no-gutters
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <span
                        v-if="school.phoneNumber"
                        class="ministryLine"
                    >{{
                        formatPhoneNumber(school.phoneNumber)
                      }}</span>
                    <a
                        v-if="showEditLinks(school.phoneNumber)"
                        class="editField"
                        @click="toggleEdit"
                    >+Phone</a>
                  </div>
                  <v-text-field
                      v-else
                      id="schoolDetailsPhoneNumber"
                      v-model="schoolDetailsCopy.phoneNumber"
                      label="Phone"
                      class="ministryLine"
                      variant="underlined"
                      required
                      :maxlength="10"
                      :rules="[rules.phoneNumber(), rules.required()]"
                      @keypress="isNumber($event)"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col
                cols="2"
                lg="2"
                class="pb-0 pt-0"
            >
              <v-row
                  v-if="!editing"
                  no-gutters
                  class="d-flex justify-start"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span style="color: grey">Fax</span>
                </v-col>
              </v-row>
              <v-row
                  no-gutters
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <span
                        v-if="school.faxNumber"
                        class="ministryLine"
                    >{{
                        formatPhoneNumber(school.faxNumber)
                      }}</span>
                    <a
                        v-if="showEditLinks(school.faxNumber)"
                        class="editField"
                        @click="toggleEdit"
                    >+Fax</a>
                  </div>
                  <v-text-field
                      v-else
                      id="schoolDetailsFaxNumber"
                      v-model="schoolDetailsCopy.faxNumber"
                      label="Fax Number"
                      class="ministryLine"
                      variant="underlined"
                      :rules="[rules.phoneNumber('Fax number must be valid')]"
                      :maxlength="10"
                      @keypress="isNumber($event)"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col
                cols="4"
                lg="4"
                class="pb-0 pt-0"
            >
              <v-row
                  v-if="!editing"
                  no-gutters
                  class="d-flex justify-start"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span style="color: grey">Email</span>
                </v-col>
              </v-row>
              <v-row
                  no-gutters
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <span
                        v-if="school.email"
                        style="word-break: break-all;"
                        class="ministryLine"
                    >{{
                        school.email
                      }}</span>
                    <a
                        v-if="showEditLinks(school.email)"
                        class="editField"
                        @click="toggleEdit"
                    >+Email</a>
                  </div>
                  <v-text-field
                      v-else
                      id="schoolDetailsEmail"
                      v-model="schoolDetailsCopy.email"
                      label="Email"
                      class="ministryLine"
                      variant="underlined"
                      required
                      :rules="[rules.email()]"
                      :maxlength="255"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col
                cols="4"
                lg="4"
                class="pb-0 pt-0"
            >
              <v-row
                  v-if="!editing"
                  no-gutters
                  class="d-flex justify-start"
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <span style="color: grey">Website</span>
                </v-col>
              </v-row>
              <v-row
                  no-gutters
              >
                <v-col
                    cols="10"
                    class="d-flex justify-start"
                >
                  <div v-if="!editing">
                    <a
                        v-if="cleanWebsiteUrl"
                        style="word-break: break-all;"
                        :href="cleanWebsiteUrl"
                        target="_blank"
                    >{{
                        cleanWebsiteUrl
                      }}</a>
                    <a
                        v-if="showEditLinks(cleanWebsiteUrl)"
                        class="editField"
                        @click="toggleEdit"
                    >+Website</a>
                  </div>
                  <v-text-field
                      v-if="editing"
                      v-model="schoolDetailsCopy.website"
                      label="Website"
                      :rules="[rules.website()]"
                      variant="underlined"
                      :maxlength="255"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-start mb-2">
            <v-col
              cols="12"
              class="d-flex justify-start"
            >
              <h3 class="subHeading pt-4">
                Addresses
              </h3>
            </v-col>
          </v-row>
          <v-row
            v-if="!hasMailingAddress() && !editing"
            no-gutters
            class="d-flex justify-start"
          >
            <v-col>
              <a
                v-if="canEditSchoolDetails() && showEditButton()"
                id="addAddressButton"
                class="editField"
                @click="toggleEdit"
              >+Address</a>
            </v-col>
          </v-row>
          <v-row
            v-else
            no-gutters
            class="d-flex justify-start"
          >
            <v-col
              v-if="editing || hasMailingAddress()"
              cols="3"
            >
              <v-row>
                <v-col>
                  <v-icon
                    class="pb-1 mr-1"
                    right
                  >
                    mdi-email-outline
                  </v-icon>
                  <span style="color: grey">Mailing Address</span>
                </v-col>
              </v-row>
              <v-row
                v-if="!editing || isOffshoreSchool"
                no-gutters
              >
                <v-col>
                  <v-row
                    class="ml-7"
                    no-gutters
                  >
                    <v-col>
                      <span>{{ getMailingAddressItem('addressLine1') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span>{{ getMailingAddressItem('addressLine2') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span>{{
                        getMailingAddressItem('city') + ', ' + getMailingAddressItem('provinceCode') + ', ' + getMailingAddressItem('countryCode')
                      }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span>{{ getMailingAddressItem('postal') }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row
                v-else
                class="mt-8"
                no-gutters
              >
                <v-col>
                  <v-row
                    class="ml-7"
                    no-gutters
                  >
                    <v-col cols="8">
                      <v-text-field
                        id="mailAddressLine1"
                        v-model="getMailingAddressCopy()[0].addressLine1"
                        variant="underlined"
                        label="Line 1"
                        required
                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                        :maxlength="255"
                        class="pb-5"
                        hide-details="auto"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-7"
                    no-gutters
                  >
                    <v-col cols="8">
                      <v-text-field
                        id="mailAddressLine2"
                        v-model="getMailingAddressCopy()[0].addressLine2"
                        variant="underlined"
                        label="Line 2"
                        :rules="[rules.noSpecialCharactersAddress()]"
                        :maxlength="255"
                        class="pb-5"
                        hide-details="auto"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-7"
                    no-gutters
                  >
                    <v-col cols="8">
                      <v-text-field
                        id="mailAddressCity"
                        v-model="getMailingAddressCopy()[0].city"
                        variant="underlined"
                        label="City"
                        required
                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                        :maxlength="255"
                        class="pb-5"
                        hide-details="auto"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-7"
                    no-gutters
                  >
                    <v-col
                      cols="8"
                      class="d-flex"
                    >
                      <v-select
                        id="mailAddressProvince"
                        v-model="getMailingAddressCopy()[0].provinceCode"
                        :items="provinceCodeValues"
                        item-title="label"
                        variant="underlined"
                        item-value="provinceCode"
                        dense
                        label="Province"
                        outlined
                        :rules="[rules.required()]"
                        required
                        style="color: black"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-7"
                    no-gutters
                  >
                    <v-col
                      cols="8"
                      class="d-flex"
                    >
                      <v-select
                        id="mailAddressCountry"
                        v-model="getMailingAddressCopy()[0].countryCode"
                        :items="countryCodeValues"
                        item-title="label"
                        item-value="countryCode"
                        :rules="[rules.required()]"
                        dense
                        variant="underlined"
                        label="Country"
                        outlined
                        style="color: black"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-7"
                    no-gutters
                  >
                    <v-col cols="8">
                      <v-text-field
                        id="mailAddressPostal"
                        v-model="getMailingAddressCopy()[0].postal"
                        variant="underlined"
                        label="Postal Code"
                        :maxlength="6"
                        required
                        :rules="[rules.required(), rules.postalCode()]"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
            <v-col
              v-if="!isOffshoreSchool"
              cols="3"
            >
              <v-row>
                <v-col>
                  <v-icon
                    class="pb-1 mr-1"
                    right
                  >
                    mdi-home-outline
                  </v-icon>
                  <span style="color: grey">Physical Address</span>
                </v-col>
              </v-row>
              <v-row
                v-if="!hasSamePhysicalAddress && !editing"
                no-gutters
              >
                <v-col>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span>{{ getPhysicalAddressItem('addressLine1') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span>{{ getPhysicalAddressItem('addressLine2') }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span>{{
                        getPhysicalAddressItem('city') + ', ' + getPhysicalAddressItem('provinceCode') + ', ' + getPhysicalAddressItem('countryCode')
                      }}</span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ml-7">
                      <span>{{ getPhysicalAddressItem('postal') }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row
                v-else
                no-gutters
              >
                <v-col>
                  <v-row
                    class="ml-7"
                    no-gutters
                  >
                    <v-col
                      v-if="sameAsMailingCheckbox && !editing"
                      class="fontItalic"
                    >
                      <span>Same as Mailing Address</span>
                    </v-col>
                    <v-col
                      v-else
                    >
                      <v-row no-gutters>
                        <v-col>
                          <v-row no-gutters>
                            <v-col>
                              <v-row
                                v-if="!sameAsMailingCheckbox"
                                class="mt-8"
                                no-gutters
                              >
                                <v-col>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field
                                        id="physicalAddressLine1"
                                        v-model="getPhysicalAddressCopy()[0].addressLine1"
                                        variant="underlined"
                                        label="Line 1"
                                        required
                                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                                        :maxlength="255"
                                        class="pb-5"
                                        hide-details="auto"
                                      />
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field
                                        id="physicalAddressLine2"
                                        v-model="getPhysicalAddressCopy()[0].addressLine2"
                                        :rules="[rules.noSpecialCharactersAddress()]"
                                        :maxlength="255"
                                        variant="underlined"
                                        label="Line 2"
                                        class="pb-5"
                                        hide-details="auto"
                                      />
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field
                                        id="physicalAddressCity"
                                        v-model="getPhysicalAddressCopy()[0].city"
                                        required
                                        :rules="[rules.required(), rules.noSpecialCharactersAddress()]"
                                        :maxlength="255"
                                        variant="underlined"
                                        label="City"
                                        class="pb-5"
                                        hide-details="auto"
                                      />
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                        id="physicalAddressProvince"
                                        v-model="getPhysicalAddressCopy()[0].provinceCode"
                                        :items="provinceCodeValues"
                                        item-title="label"
                                        item-value="provinceCode"
                                        dense
                                        variant="underlined"
                                        label="Province"
                                        required
                                        :rules="[rules.required()]"
                                        outlined
                                        style="color: black"
                                      />
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-select
                                        id="physicalAddressCountry"
                                        v-model="getPhysicalAddressCopy()[0].countryCode"
                                        :items="countryCodeValues"
                                        item-title="label"
                                        item-value="countryCode"
                                        dense
                                        variant="underlined"
                                        label="Country"
                                        :rules="[rules.required()]"
                                        required
                                        outlined
                                        style="color: black"
                                      />
                                    </v-col>
                                  </v-row>
                                  <v-row no-gutters>
                                    <v-col cols="8">
                                      <v-text-field
                                        id="physicalAddressPostal"
                                        v-model="getPhysicalAddressCopy()[0].postal"
                                        required
                                        :rules="[rules.required(), rules.postalCode()]"
                                        :maxlength="6"
                                        variant="underlined"
                                        label="Postal Code"
                                      />
                                    </v-col>
                                  </v-row>
                                </v-col>
                              </v-row>
                              <v-row no-gutters>
                                <v-col>
                                  <v-checkbox
                                    id="sameAsMailingCheckbox"
                                    v-model="sameAsMailingCheckbox"
                                    dense
                                    label="Same as Mailing Address"
                                    class="pt-0 ml-n3"
                                    @change="clickSameAsAddressButton"
                                  />
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
      <template #message>
        <p>All changes made to school details will be <strong>available to the public on save</strong>.</p>
        <p>Please be sure to review your changes carefully before you publish them.</p>
      </template>
    </ConfirmationDialog>
  </v-form>
</template>

<script>

import PrimaryButton from '../../util/PrimaryButton.vue';
import { authStore } from '../../../store/modules/auth';
import { instituteStore } from '../../../store/modules/institute';
import { mapState } from 'pinia';
import alertMixin from '../../../mixins/alertMixin';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {formatPhoneNumber, formatDate} from '../../../utils/format';
import {getStatusColorAuthorityOrSchool,getStatusAuthorityOrSchool} from '../../../utils/institute/status';
import {sanitizeUrl} from '@braintree/sanitize-url';
import {deepCloneObject} from '../../../utils/common';
import * as Rules from '../../../utils/institute/formRules';
import {isNumber} from '../../../utils/institute/formInput';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import {sortBy} from 'lodash';
import {MINISTRY_CONTACTS} from '../../../utils/constants/MinistryContactsInfo';
import {SCHOOL_CATEGORY_CODES} from '../../../utils/constants/SchoolCategoryCodeTypes';
import {PERMISSION} from '../../../utils/constants/Permission';

export default {
  name: 'SchoolDetailsPage',
  components: {
    ConfirmationDialog,
    PrimaryButton,
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
  emits: ['is-form-valid', 'edit-toggled'],
  data() {
    return {
      school: '',
      district: '',
      authority: '',
      schoolFacilityTypes: [],
      schoolCategoryTypes: [],
      schoolReportingRequirementTypes: [],
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
      SCHOOL_CATEGORY_CODES: SCHOOL_CATEGORY_CODES,
      MINISTRY_CONTACTS: MINISTRY_CONTACTS
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(instituteStore, ['facilityTypeCodes']),
    ...mapState(instituteStore, ['schoolCategoryTypeCodes']),
    ...mapState(instituteStore, ['schoolOrganizationTypeCodes']),
    ...mapState(instituteStore, ['schoolReportingRequirementTypeCodes']),
    ...mapState(instituteStore, ['schoolNeighborhoodLearningCodes']),
    ...mapState(instituteStore, ['activeSchoolOrganizationTypeCodes']),
    ...mapState(instituteStore, ['activeSchoolNeighborhoodLearningCodes']),
    ...mapState(instituteStore, ['provinceCodes']),
    ...mapState(instituteStore, ['countryCodes']),
    ...mapState(instituteStore, ['gradeCodes']),
    ...mapState(instituteStore, ['gradeOptions']),
    dataReady: function () {
      return this.userInfo;
    },
    emailBox(){
      if([SCHOOL_CATEGORY_CODES.INDEPEND, SCHOOL_CATEGORY_CODES.INDP_FNS].includes(this.school.schoolCategoryCode)){
        return MINISTRY_CONTACTS.INDEPENDENT_SCHOOL_OFFICE;
      } else if(this.school.schoolCategoryCode === SCHOOL_CATEGORY_CODES.OFFSHORE){
        return MINISTRY_CONTACTS.OFFSHORE_ADMIN;
      }
      return MINISTRY_CONTACTS.DATA_MANAGEMENT;
    },
    hasSamePhysicalAddress(){
      return !this.school.addresses.filter(address => address.addressTypeCode === 'PHYSICAL').length > 0;
    },
    isOffshoreSchool(){
      return this.school.schoolCategoryCode === SCHOOL_CATEGORY_CODES.OFFSHORE;
    },
    schoolReportingRequirementType() {
      const code = this.school.schoolReportingRequirementCode;
      const type = this.schoolReportingRequirementTypes
        .find(rr => rr.schoolReportingRequirementCode === code);
      if (type === undefined) return {};
      return type;
    },
    isGradeOfferedUpdateAllowed() {
      const restrictedCategories = [
        SCHOOL_CATEGORY_CODES.INDP_FNS,
        SCHOOL_CATEGORY_CODES.INDEPEND,
        SCHOOL_CATEGORY_CODES.EAR_LEARN,
        SCHOOL_CATEGORY_CODES.POST_SEC
      ];
      return !restrictedCategories.includes(this.school.schoolCategoryCode);
    }
  },
  watch: {
    schoolDetailsFormValid(value) {
      if(value !== null && value !== undefined) {
        if(this.hasRequiredFieldValues() && value) {
          this.$emit('is-form-valid', true);
        } else {
          this.$emit('is-form-valid', false);
        }
      }
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
    instituteStore().getSchoolReportingRequirementTypeCodes().then(() => {
      this.schoolReportingRequirementTypes = this.schoolReportingRequirementTypeCodes;
    });
    instituteStore().getSchoolNeighborhoodLearningCodes().then(() => {
      this.schoolNeighborhoodLearningTypes = this.schoolNeighborhoodLearningCodes;
    });
    instituteStore().getAllActiveSchoolOrganizationTypeCodes().then(() => {
      this.schoolActiveOrganizationTypes = this.activeSchoolOrganizationTypeCodes;
    });
    instituteStore().getAllActiveSchoolNeighborhoodLearningCodes().then(() => {
      this.schoolActiveNeighborhoodLearningTypes = sortBy(this.activeSchoolNeighborhoodLearningCodes, ['label']);
    });
    instituteStore().getGradeCodes().then(() => {
      this.schoolGradeTypes = sortBy(this.gradeCodes, ['displayOrder']);
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
    setHasSamePhysicalFlag(){
      this.sameAsMailingCheckbox = this.hasSamePhysicalAddress;
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
          if(this.school.independentAuthorityId){
            this.getAuthorityDetails(this.school.independentAuthorityId);
          }
          this.cleanWebsiteUrl = this.school.website ? sanitizeUrl(this.school.website) : '';
          this.$emit('is-form-valid', this.hasRequiredFieldValues());
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
    getAuthorityDetails(authorityId) {
      this.authority = '';
      ApiService.apiAxios.get(ApiRoutes.institute.AUTHORITY_DATA_URL + '/' + authorityId)
        .then(response => {
          this.authority = response.data;
          this.populateExtraAuthorityFields(this.authority);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    populateExtraAuthorityFields(authority) {
      authority.status = getStatusAuthorityOrSchool(authority);
      if(authority.status === 'Closed' || authority.status === 'Closing') {
        this.isSchoolStatusUpdateAllowed = false;
      }
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
    getGradesOffered(rawGrades) {
      let gradeList = [];

      for (const grade of this.schoolGradeTypes) {
        let schoolGradeType = rawGrades.find((rawGrade) => rawGrade.schoolGradeCode === grade.schoolGradeCode);
        if (schoolGradeType) {
          gradeList.push(grade.label.replaceAll('Grade ', ''));
        }
      }

      return gradeList.toString().replace(/,/g, ', ');
    },
    getSchoolOrganization(school){
      return this.schoolOrganizationTypes?.find((facility) => facility.schoolOrganizationCode === school?.schoolOrganizationCode)?.label;
    },
    getNLCActivity(school){
      return school.neighborhoodLearning
        .reduce((list, nl) => {
          const match = this.schoolNeighborhoodLearningTypes?.find((facility) =>
            facility.neighborhoodLearningTypeCode === nl?.neighborhoodLearningTypeCode);

          if (match) {
            return [...list, match.label];
          }

          return list;
        }, [])
        .sort()
        .join(', ');
    },
    showEditLinks(fieldValue) {
      return this.canEditSchoolDetails() && !fieldValue && this.showEditButton();
    },
    getFacilityType(school){
      return this.schoolFacilityTypes?.find((facility) => facility.facilityTypeCode === school?.facilityTypeCode)?.label;
    },
    getSchoolCategory(school){
      return this.schoolCategoryTypeCodes?.find((category) => category.schoolCategoryCode === school?.schoolCategoryCode)?.label;
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
    showContactButton() {
      return this.functionName !== 'SDC';
    },
    showEditButton() {
      return this.schoolCollectionObject?.sdcSchoolCollectionStatusCode !== 'SUBMITTED';
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
      const hasPermission = this.userInfo?.activeInstitutePermissions?.
        filter(perm => perm === PERMISSION.EDX_SCHOOL_EDIT).length > 0;
      return hasPermission && !this.isOffshoreSchool;
    },
    async clickSameAsAddressButton() { 
      await this.$nextTick();
      await this.$refs.schoolDetailsForm.validate();
    },
    async toggleEdit() {
      this.schoolDetailsCopy = this.deepCloneObject(this.school);
      this.addAddressesIfRequired(this.schoolDetailsCopy);
      this.sortGrades();
      this.sortNlc();
      this.editing = !this.editing;
      this.$emit('edit-toggled', this.editing);
      await this.$nextTick();
      this.$refs.schoolDetailsForm.validate();
    },
    cancelClicked(){
      this.editing = false;
      this.$emit('edit-toggled', this.editing);
      this.setHasSamePhysicalFlag();
      this.$emit('is-form-valid', this.hasRequiredFieldValues());
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
      ApiService.apiAxios.put(`${ApiRoutes.school.BASE_URL}` + '/' + this.schoolDetailsCopy.schoolId, this.schoolDetailsCopy)
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
    hasRequiredFieldValues() {
      return this.school.phoneNumber!== null && this.school.email!==null && this.hasMailingAddress();
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
    sortGrades() {
      const gradeList = [];
      for (const grade of this.schoolGradeTypes) {
        if (this.schoolDetailsCopy.grades.find((rawGrade) => rawGrade.schoolGradeCode === grade.schoolGradeCode )) {
          gradeList.push(grade);
        }
      }
      this.schoolDetailsCopy.grades = gradeList;
    },
    sortNlc() {
      const nlcList = [];
      for (const nlc of this.schoolActiveNeighborhoodLearningTypes) {
        if (this.schoolDetailsCopy.neighborhoodLearning.find((rawGrade) => rawGrade.neighborhoodLearningTypeCode === nlc.neighborhoodLearningTypeCode )) {
          nlcList.push(nlc);
        }
      }
      this.schoolDetailsCopy.neighborhoodLearning = nlcList;
    }
  }
};
</script>

<style scoped>

:deep(div.v-input__prepend > i){
  margin-top: 5px;
  margin-right: -10px;
}

.fontItalic{
  font-style: italic;
}

.divider {
  border-color: #FCBA19;
  border-width: 3px;
  opacity: unset;
}

.editField {
  font-size: 14px;
  color: rgb(0, 51, 102);
  vertical-align: super;
}

.editField:hover {
  text-decoration: underline;
}

.safe-name {
    color: grey;
    font-style: italic;
   }

.subHeading {
  color: #38598a;
}
</style>


