<template>
  <v-container>
    <Spinner
      v-if="loading"
      flat
    />
    <div v-else>
      <div>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-card
              flat
              min-width="55em"
            >
              <v-icon
                small
                color="#1976d2"
              >
                mdi-arrow-left
              </v-icon>
              <a
                class="ml-1 mt-1"
                @click="backButtonClick"
              >Return to Dashboard</a>
            </v-card>
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="mt-2"
        >
          <v-col class="d-flex justify-center">
            <v-card
              min-width="55em"
              color="rgb(235, 237, 239)"
            >
              <v-card-title>
                <v-row
                  class="mt-0"
                  justify="center"
                >
                  <v-col class="d-flex justify-center">
                    <strong>Search a school below to manage their EDX Access</strong>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col class="mx-2 d-flex justify-center">
                    <v-autocomplete
                      id="selectInstituteName"
                      v-model="instituteCode"
                      variant="underlined"
                      :items="schoolSearchNames"
                      color="#003366"
                      :label="instituteTypeLabel"
                      single-line
                      clearable
                      item-title="schoolCodeName"
                      item-value="schoolID"
                    />
                    <PrimaryButton
                      id="manageSchoolButton"
                      class="ml-4 mt-3"
                      text="Manage School Access"
                      :click-action="manageSchoolButtonClicked"
                      :disabled="!instituteCode"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row
          v-if="isDistrictUser"
          no-gutters
        >
          <v-col class="d-flex justify-center">
            <v-card
              flat
              min-width="55em"
            >
              <a
                class="d-flex justify-end mt-1"
                @click="seeAllDistrictSchoolUsersClick"
              >See all school users</a>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<script>
import { authStore } from '../../store/modules/auth';
import { appStore } from '../../store/modules/app';
import { edxStore } from '../../store/modules/edx';
import { mapState } from 'pinia';
import PrimaryButton from '../util/PrimaryButton.vue';
import Spinner from '../common/Spinner.vue';
import {sortBy} from 'lodash';
import alertMixin from '../../mixins/alertMixin';

export default {
  name: 'SchoolUsersAccessPage',
  components: {PrimaryButton, Spinner},
  mixins: [alertMixin],
  data() {
    return {
      newUserInviteSheet: false,
      schoolID: '',
      users: [],
      loading: true,
      schoolName: '',
      schoolMincode: '',
      loadingUsers: true,
      filteredUsers: [],
      roleMap:undefined,
      isDistrictUser: false,
      schoolSearchNames: [],
      searchFilter: {
        name: null,
        roleName: null
      },
      primaryEdxActivationCode: null,
      instituteCode: '',
      instituteTypeLabel: 'School',
      doShowGenerateNewPrimaryEdxActivationCodeDialog: false,
      allowedSchoolCategories: ['PUBLIC', 'EAR_LEARN']
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap', 'notClosedSchoolsMap', 'config']),
    ...mapState(edxStore, ['schoolRoles','schoolRolesCopy']),
    ...mapState(authStore, ['userInfo']),
  },
  async beforeMount() {
    if (this.schoolRoles.length === 0) {
      await edxStore().getSchoolExchangeRoles();
    }
    if(this.schoolsMap.size === 0) {
      await appStore().getInstitutesData();
    }
  },
  created() {
    authStore().getUserInfo().then(() => {
      if(this.userInfo.activeInstituteType === 'SCHOOL') {
        this.isDistrictUser = false;
      }else{
        this.isDistrictUser = true;
      }
      appStore().getInstitutesData().then(() => {
        this.setupSchoolList();
        this.loading = false;
      });
    });
  },
  methods: {
    manageSchoolButtonClicked(){
      this.$router.push({name: 'schoolAccessDetail', params: {schoolID: this.instituteCode}});
    },
    backButtonClick() {
      this.$router.push({name: 'home'});
    },
    seeAllDistrictSchoolUsersClick() {
      this.$router.push({name: 'districtSchools'});
    },
    setupSchoolList(){
      this.schoolSearchNames = [];
      for(const school of this.notClosedSchoolsMap.values()){
        if(this.allowedSchoolCategories.includes(school.schoolCategoryCode)) {
          let schoolItem = {
            schoolCodeName: school.schoolName + ' - ' + school.mincode,
            schoolID: school.schoolID,
            districtID: school.districtID,
          };
          this.schoolSearchNames.push(schoolItem);
        }
      }
      this.schoolSearchNames = sortBy(this.schoolSearchNames.filter((school => school.districtID === this.userInfo?.activeInstituteIdentifier)), ['schoolCodeName']);
    }
  }
};
</script>

<style scoped>
.add-new-user {
  min-height: 160px;
}

.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

:deep(.mdi-information){
  color: #003366;
}

@media screen and (max-width: 950px){
  .subjectHeading {
    font-size: medium;
  }
}

</style>
