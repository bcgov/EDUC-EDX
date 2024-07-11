<template>
  <v-container>
    <Spinner
      v-if="loading"
      flat
    />
    <div
      v-else
      class="mb-5"
    >
      <v-row>
        <v-col class="mt-1 d-flex justify-start">
          <v-icon
            class="mt-1"
            small
            color="#1976d2"
          >
            mdi-arrow-left
          </v-icon>
          <a
            class="ml-1 mt-1"
            @click="backButtonClick"
          >Return to School User Management</a>
        </v-col>
      </v-row>
      <v-row class="d-sm-flex align-center searchBox">
        <v-col
          class="d-flex pt-1 pb-0"
        >
          <v-autocomplete
            id="schoolname-select-field"
            v-model="schoolFilter"
            variant="underlined"
            clearable
            :items="schoolSearchNames"
            label="School"
            @update:model-value="applyFilter"
          />
        </v-col>
        <v-col
          class="d-flex pt-1 pb-0"
        >
          <v-text-field
            id="name-text-field"
            v-model="search"
            variant="underlined"
            label="Search by User's Name or Email"
            clearable
          />
        </v-col>
        <v-col
          class="d-flex pt-1 pb-0"
        >
          <v-select
            id="roleName-select-field"
            v-model="roleFilter"
            variant="underlined"
            clearable
            :items="roleSearchNames"
            label="Role"
            @update:model-value="applyFilter"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-if="filteredSchools.length === 0"
          cols="12"
          class="d-flex justify-center"
        >
          <p>No school users. <a @click="backButtonClick">Manage School Users.</a></p>
        </v-col>
        <v-col
          v-for="school in filteredSchools"
          :key="school.schoolID"
          cols="12"
          class="pb-0"
        >
          <div>
            <h3
              class="mb-2 mt-2 hoverTable"
              @click="openSchool(school.schoolID)"
            >
              {{ school.name }}
            </h3>
            <v-data-table
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              density="compact"
              :search="search"
              :items="school.edxDistrictSchoolUsers"
            >
              <template #[`item.actions`]="{ item }">
                <v-btn
                  :id="`user-remove-button`"
                  variant="text"
                  @click="clickEditButton(item)"
                >
                  Edit
                </v-btn>
                <v-btn
                  :id="`user-remove-button`"
                  color="red"
                  variant="text"
                  @click="clickDeleteButton(item)"
                >
                  Remove
                </v-btn>
              </template>
            </v-data-table>
          </div>
        </v-col>
      </v-row>
    </div>
    <ConfirmationDialog ref="confirmRemoveUser">
      <template #message>
        <p>Are you sure you want to remove this user's access for the school?</p>
      </template>
    </ConfirmationDialog>
    <v-bottom-sheet
      v-model="editUserSheet"
      :no-click-animation="true"
      :inset="true"
      :persistent="true"
    >
      <v-card
        v-if="editUserSheet"
        id="editUserVCard"
        class="information-window-v-card"
      >
        <v-card-title
          id="editUserInviteVCardTitle"
          class="sheetHeader pt-1 pb-1"
        >
          Edit {{ selectedUserForEdit.fullName }}
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-alert
            v-if="!isNotSameEdxUser()"
            id="logoutAlert"
            class="mt-4"
            color="#003366"
            density="compact"
            type="info"
            variant="tonal"
          >
            <span>For access changes to take effect, you will need to log out and back in.</span>
          </v-alert>
          <v-alert
            v-if="!minimumRolesSelected"
            id="logoutAlert"
            class="mt-4"
            color="#003366"
            density="compact"
            type="info"
            variant="tonal"
          >
            <span>Please select at least one role for {{ selectedUserForEdit.fullName }}.</span>
          </v-alert>
          <v-select
            id="schoolSelect"
            v-model="selectedUserForEdit.schoolID"
            label="Move to School"
            variant="underlined"
            class="pl-7"
            item-title="schoolCodeName"
            item-value="schoolID"
            :items="districtSchools"
            prepend-inner-icon="mdi-school"
          />
          <v-list
            :id="`access-user-roles-${selectedUserForEdit.edxUserID}`"
            v-model:selected="selectedRoles"
            lines="two"
            return-object
            select-strategy="classic"
          >
            <div
              v-for="newrole in filteredSchoolRoles"
              :key="newrole.edxRoleCode"
              :value="newrole.edxRoleCode"
            >
              <v-list-item
                :value="newrole.edxRoleCode"
              >
                <template #prepend="{ isActive }">
                  <v-list-item-action>
                    <v-checkbox-btn :model-value="isActive" />
                  </v-list-item-action>
                </template>

                <v-list-item-title>{{ newrole.label }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ newrole.roleDescription }}
                </v-list-item-subtitle>
              </v-list-item>
            </div>
          </v-list>

          <DatePicker
            id="accessExpiryDate"
            v-model="accessExpiryDate"
            class="pl-7"
            label="Access Expiry Date"
            model-type="yyyy-MM-dd'T'00:00:00"
            :min-date="minExpiryDate"
            :allow-teleport="true"
            @clear-date="clearExpiryDate"
          />
          <v-row
            no-gutters
            class="py-4 justify-end"
          >
            <v-col class="mt-0 d-flex justify-end">
              <PrimaryButton
                :id="`user-cancel-edit-button-${selectedUserForEdit.edxUserID}`"
                width="5em"
                text="Cancel"
                class="mr-2"
                secondary
                variant="flat"
                :click-action="closeSheet"
              />
              <PrimaryButton
                :id="`user-save-action-button-${selectedUserForEdit.edxUserID}`"
                text="Save"
                :disabled="!minimumRolesSelected"
                variant="flat"
                :click-action="clickSaveButton"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import { authStore } from '../../store/modules/auth';
import { edxStore } from '../../store/modules/edx';
import { appStore } from '../../store/modules/app';
import { mapState } from 'pinia';
import Spinner from '../common/Spinner.vue';
import alertMixin from '../../mixins/alertMixin';
import {sortBy} from 'lodash';
import {deepCloneObject} from '../../utils/common';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import DatePicker from '../util/DatePicker.vue';
import PrimaryButton from '../util/PrimaryButton.vue';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import {ROLES} from '../../utils/constants/Roles';

export default {
  name: 'ViewAllDistrictSchoolUsersPage',
  components: {PrimaryButton, DatePicker, ConfirmationDialog, Spinner},
  mixins: [alertMixin],
  data() {
    return {
      headers: [
        { title: 'User\'s Name', align: 'start', key: 'fullName', width: '15%' },
        { title: 'Email', align: 'start', key: 'email', width: '20%' },
        { title: 'Role(s)', align: 'start', key: 'roleList', width: '30%' },
        { title: 'Actions', align: 'center', key: 'actions', width: '15%' }
      ],
      districtID: '',
      search: null,
      loading: true,
      editUserSheet: false,
      itemsPerPage: 1000,
      schoolFilter: null,
      selectedUserForEdit: null,
      roleFilter: null,
      schoolsList: [],
      filteredSchools: [],
      isDistrictUser: false,
      schoolSearchNames: [],
      districtSchools: [],
      roleSearchNames: [],
      selectedRoles: [],
      schoolSDCRoles: [ROLES.SCHOOL_SDC, ROLES.SCH_SDC_RO],
      allowedSchoolCategories: ['PUBLIC', 'EAR_LEARN'],
      accessExpiryDate: null,
      minExpiryDate: LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')).toString()
    };
  },
  async beforeMount() {
    if (this.schoolRoles.length === 0) {
      await edxStore().getSchoolExchangeRoles();
    }
  },
  computed: {
    ...mapState(appStore, ['schoolsMap', 'config', 'notClosedSchoolsMap']),
    ...mapState(authStore, ['userInfo']),
    ...mapState(edxStore, ['schoolRoles']),
    filteredSchoolRoles() {
      return this.config.DISABLE_SDC_FUNCTIONALITY ? this.schoolRoles.filter(role => !this.schoolSDCRoles.includes(role.edxRoleCode)) : this.schoolRoles;
    }
  },
  watch: {
    search() {
      this.applyFilter();
    },
  },
  created() {
    authStore().getUserInfo().then(() => {
      this.districtID = this.userInfo.activeInstituteIdentifier;
      this.isDistrictUser = true;
      appStore().getInstitutesData().then(() => {
        this.setupSchoolList();
        this.getUsersData();
      });
    });
  },
  methods: {
    clickSaveButton() {
      if (!this.minimumRolesSelected) {
        this.setFailureAlert(`Please select at least one role for ${this.userDisplayName}.`);
        return;
      }
      this.editUserSheet = !this.editUserSheet;
      const payload = {
        params: {
          edxUserID: this.selectedUserForEdit.edxUserID,
          edxUserSchoolID: this.selectedUserForEdit.edxUserSchoolID,
          selectedRoles: this.selectedRoles,
          expiryDate: this.accessExpiryDate,
          schoolID: this.selectedUserForEdit.schoolID
        }
      };

      ApiService.apiAxios.post(ApiRoutes.edx.EXCHANGE_USER_SCHOOL_ACCESS_URL, payload)
        .then(() => {
          this.setSuccessAlert('User has been updated.');
        }).catch(error => {
          this.setFailureAlert(
            error.response.data.message
          );
          console.log(error);
        }).finally(() => {
          this.getUsersData();
        });
    },
    clearExpiryDate(){
      this.accessExpiryDate = null;
    },
    getExpiryDate(user){
      return user.expiryDate;
    },
    minimumRolesSelected() {
      return this.selectedRoles.length > 0;
    },
    isNotSameEdxUser() {
      return this.userInfo.edxUserID !== this.selectedUserForEdit.edxUserID;
    },
    closeSheet() {
      this.editUserSheet = !this.editUserSheet;
    },
    clickEditButton(user) {
      this.editUserSheet = !this.editUserSheet;
      this.setUserRolesAsSelected(user);
      this.selectedUserForEdit = user;
    },
    setUserRolesAsSelected(user) {
      let mySelection = [];
      //look through all our roles. If user has this role, then mark the index
      this.filteredSchoolRoles.forEach((role) => {
        let result = user.roleCodesList.find((userRole) =>
          userRole === role.edxRoleCode
        );
        if (result) {
          mySelection.push(role.edxRoleCode);
        }
      });
      this.selectedRoles = [...mySelection];
      this.accessExpiryDate = this.getExpiryDate(user);
    },
    async clickDeleteButton(user){
      const confirmation = await this.$refs.confirmRemoveUser.open('Confirm Removal of User', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      this.loading = true;

      const payload = {
        params:{
          userToRemove: user.edxUserID
        }
      };

      payload.params.schoolID = user.schoolID;
      payload.params.userSchoolID = user.edxUserSchoolID;
      ApiService.apiAxios.post(ApiRoutes.edx.EXCHANGE_REMOVE_USER, payload)
        .then(() => {
          this.setSuccessAlert('User has been removed.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while removing a user. Please try again later.');
          console.log(error);
        }).finally(() => {
          this.getUsersData();
        });
    },
    getUsersData() {
      this.loading = true;
      const payload = {params: {districtID: this.districtID}};
      ApiService.apiAxios.get(ApiRoutes.edx.DISTRICT_SCHOOL_USERS_URL, payload)
        .then(response => {
          this.schoolSearchNames = [];
          this.schoolsList = response.data;
          this.schoolsList.forEach(school => {
            school.edxDistrictSchoolUsers.forEach(user => {
              user.schoolRoles.forEach(role => {
                this.roleSearchNames.push(role);
              });
              user.schoolID = school.schoolID;
              user.roleCodesList = user.schoolRoleCodes;
              user.roleList = user.schoolRoles.join(', ');
              user.fullSearch = user.fullName + ' ' + user.email;
              school.fullSearch += ' ' + user.fullName + ' ' + user.roleList + ' ' + user.email;
            });
            school.name = this.getSchoolNameFromID(school.schoolID);
            this.schoolSearchNames.push(school.name);
          });
          this.schoolsList = sortBy(this.schoolsList, ['name']);
          this.schoolSearchNames = sortBy(this.schoolSearchNames);
          this.filteredSchools = this.schoolsList;
          this.roleSearchNames = this.roleSearchNames.filter(this.onlyUnique);
        }).finally(() => {
          this.loading = false;
        });
    },
    onlyUnique(value, index, array) {
      return array.indexOf(value) === index;
    },
    getSchoolNameFromID(schoolID){
      let curSchool = this.schoolsMap.get(schoolID);
      return curSchool.mincode + ' - ' + curSchool.schoolName;
    },
    deepCloneObject,
    applyFilter(){
      let tempSchools = deepCloneObject(this.schoolsList);

      if(this.schoolFilter){
        tempSchools = tempSchools.filter(school => school.name.includes(this.schoolFilter));
      }
      if(this.roleFilter){
        tempSchools = tempSchools.filter(school => school.fullSearch.includes(this.roleFilter));
        tempSchools.forEach(school => {
          school.edxDistrictSchoolUsers = school.edxDistrictSchoolUsers.filter(user => user.schoolRoles.includes(this.roleFilter));
        });
      }
      if(this.search){
        tempSchools = tempSchools.filter(school => school.fullSearch.includes(this.search.toUpperCase()));
        tempSchools.forEach(school => {
          school.edxDistrictSchoolUsers = school.edxDistrictSchoolUsers.filter(user => user.fullSearch.includes(this.search.toUpperCase()));
        });
      }

      this.filteredSchools = tempSchools;
    },
    setupSchoolList(){
      this.districtSchools = [];
      for(const school of this.notClosedSchoolsMap.values()){
        if(this.allowedSchoolCategories.includes(school.schoolCategoryCode)) {
          let schoolItem = {
            schoolCodeName: school.schoolName + ' - ' + school.mincode,
            schoolID: school.schoolID,
            districtID: school.districtID,
          };
          this.districtSchools.push(schoolItem);
        }
      }
      this.districtSchools = sortBy(this.districtSchools.filter((school => school.districtID === this.userInfo?.activeInstituteIdentifier)), ['schoolCodeName']);
    },
    openSchool(schoolId){
      const routeData = this.$router.resolve({name: 'schoolAccessDetail', params: {schoolID: schoolId}});
      window.open(routeData.href, '_blank');
    },
    backButtonClick() {
      this.$router.push({name: 'schoolAccess'});
    }
  }
};
</script>

<style scoped>
.searchBox {
  margin: 0;
  padding-left: 1em;
  padding-right: 1em;
  border-radius: 5px;
  background-color: rgb(235, 237, 239);
}

.hoverTable:hover{
  cursor: pointer;
}

:deep(.mdi-information){
  color: #003366;
}

.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

:deep(.v-data-table__td){
  font-size: 0.95em;
}

:deep(.v-data-table-footer) {
  display: none;
}

</style>
