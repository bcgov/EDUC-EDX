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
      <v-row :class="['d-sm-flex', 'align-center', 'searchBox']">
        <v-col
          cols="5"
          class="pt-1 pb-1"
        >
          <v-autocomplete
            id="roleName-select-field"
            variant="underlined"
            v-model="schoolFilter"
            @update:model-value="applyFilter"
            clearable
            :items="schoolSearchNames"
            label="School"
          />
        </v-col>
        <v-col
          class="d-flex pt-1 pb-1"
        >
          <v-text-field
            id="name-text-field"
            v-model="search"
            variant="underlined"
            label="Search by User's Name, Email or Role name"
            clearable
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-for="school in filteredSchools"
          :key="school.schoolID"
          cols="12"
          class="pb-0"
        >
          <div>
            <h3 class="mb-2 mt-2">
              {{ school.name }}
            </h3>
            <v-data-table
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              density="compact"
              @click="openSchool(school.schoolID)"
              class="hoverTable"
              :search="search"
              :items="school.edxDistrictSchoolUsers"
            />
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import { authStore } from '../../store/modules/auth';
import { appStore } from '../../store/modules/app';
import { mapState } from 'pinia';
import Spinner from '../common/Spinner.vue';
import alertMixin from '../../mixins/alertMixin';
import {sortBy} from 'lodash';

export default {
  name: 'ViewAllDistrictSchoolUsersPage',
  components: {Spinner},
  mixins: [alertMixin],
  data() {
    return {
      headers: [
        { title: 'User\'s Name', align: 'start', key: 'fullName', width: '25%' },
        { title: 'Email', align: 'start', key: 'email', width: '35%' },
        { title: 'Role(s)', align: 'start', key: 'roleList', width: '40%' }
      ],
      districtID: '',
      search: null,
      loading: true,
      itemsPerPage: 1000,
      schoolFilter: null,
      schoolsList: [],
      filteredSchools: [],
      isDistrictUser: false,
      schoolSearchNames: []
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap']),
    ...mapState(authStore, ['userInfo']),
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
        this.getUsersData();
      });
    });
  },
  methods: {
    getUsersData() {
      this.loading = true;
      const payload = {params: {districtID: this.districtID}};
      ApiService.apiAxios.get(ApiRoutes.edx.DISTRICT_SCHOOL_USERS_URL, payload)
        .then(response => {
          this.schoolsList = response.data;
          this.schoolsList.forEach(school => {
            school.edxDistrictSchoolUsers.forEach(user => {
              user.roleList = user.schoolRoles.join(', ');
              school.fullSearch += ' ' + user.fullName + ' ' + user.roleList.toUpperCase() + ' ' + user.email;
            });
            school.name = this.getSchoolNameFromID(school.schoolID);
            this.schoolSearchNames.push(school.name);
          });
          this.schoolsList = sortBy(this.schoolsList, ['name']);
          this.schoolSearchNames = sortBy(this.schoolSearchNames);
          this.filteredSchools = this.schoolsList;
        }).finally(() => {
          this.loading = false;
        });
    },
    getSchoolNameFromID(schoolID){
      let curSchool = this.schoolsMap.get(schoolID);
      return curSchool.mincode + ' - ' + curSchool.schoolName;
    },
    applyFilter(){
      let tempSchools = [...this.schoolsList];

      if(this.schoolFilter){
        tempSchools = tempSchools.filter(school => school.name.includes(this.schoolFilter));
      }
      if(this.search){
        tempSchools = tempSchools.filter(school => school.fullSearch.includes(this.search.toUpperCase()));
      }

      this.filteredSchools = tempSchools;
    },
    openSchool(schoolId){
      const routeData = this.$router.resolve({name: 'schoolDetails', params: {schoolID: schoolId}});
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
  padding-left: 1em;
  padding-right: 1em;
  margin-left: 0;
  margin-right: 0;
  border-radius: 5px;
  background-color: #F2F2F2;
}

.hoverTable:hover{
  background-color: #e8e8e8;
  cursor: pointer;
}

:deep(.mdi-information){
  color: #003366;
}

:deep(.v-data-table__td){
  font-size: 0.95em;
}

:deep(.v-data-table-footer) {
  display: none;
}

</style>
