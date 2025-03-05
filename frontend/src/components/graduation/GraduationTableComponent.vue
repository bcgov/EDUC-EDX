<template>
  <v-container fluid>
    <v-row class="mt-1 mb-1">
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
    </v-row>
    <v-row
      justify="start"
    >
      <v-col
        v-if="hasRequiredPermission('GRAD_SCH_UPLOAD') && isLoggedInSchoolUser && !disableGradFunctionality"
        cols="12"
        md="6"
      >
        <v-card
          id="graduationCard"
          class="mx-auto"
          width="29em"
          outlined
          rounded
          @click="uploadSchoolFiles()"
        >
          <v-row class="pl-4">
            <v-col cols="3">
              <div>
                <v-icon
                  icon="mdi-file-upload-outline"
                  aria-hidden="false"
                  color="rgb(0, 51, 102)"
                  size="100"
                />
              </div>
            </v-col>
            <v-col class="mt-2">
              <v-row no-gutters>
                <v-col>
                  <h4 class="dashboard-title">
                    {{ PAGE_TITLES.GRAD_DATA_COLLECTION }}
                  </h4>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col>
                  <span>Upload Graduation Data Files (DEM, XAM and CRS)</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col
        v-if="hasRequiredPermission('GRAD_SCH_TVR_VIEW') && isLoggedInSchoolUser && !disableGradFunctionality"
        cols="12"
        md="6"
      >
        <v-card
          id="graduationCard"
          class="mx-auto"
          width="29em"
          height="100%"
          outlined
          rounded
          @click="openProjections()"
        >
          <v-row class="pl-4">
            <v-col cols="3">
              <div>
                <v-icon
                  icon="mdi-finance"
                  aria-hidden="false"
                  color="rgb(0, 51, 102)"
                  size="100"
                />
              </div>
            </v-col>
            <v-col class="mt-2">
              <v-row no-gutters>
                <v-col>
                  <h4 class="dashboard-title">
                    {{ PAGE_TITLES.GRAD_PROJECTIONS }}
                  </h4>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col
        v-if="hasRequiredPermission('GRAD_SCH_RPT_VIEW') && isLoggedInSchoolUser && !disableGradFunctionality"
        cols="12"
        md="6"
      >
        <v-card
          id="graduationCard"
          class="mx-auto"
          width="29em"
          height="100%"
          outlined
          rounded
          @click="openReports()"
        >
          <v-row class="pl-4">
            <v-col cols="3">
              <div>
                <v-icon
                  icon="mdi-certificate-outline"
                  aria-hidden="false"
                  color="rgb(0, 51, 102)"
                  size="100"
                />
              </div>
            </v-col>
            <v-col class="mt-2">
              <v-row no-gutters>
                <v-col>
                  <h4 class="dashboard-title">
                    {{ PAGE_TITLES.GRAD_REPORTS }}
                  </h4>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!--DISTRICT-->

      <v-col
        v-if="hasRequiredPermission('GRAD_DIS_UPLOAD') && isLoggedInDistrictUser && !disableGradFunctionality"
        cols="12"
        md="6"
      >
        <v-card
          id="graduationCard"
          class="mx-auto"
          width="29em"
          outlined
          rounded
          @click="uploadDistrictFiles()"
        >
          <v-row class="pl-4">
            <v-col cols="3">
              <div>
                <v-icon
                  icon="mdi-file-upload-outline"
                  aria-hidden="false"
                  color="rgb(0, 51, 102)"
                  size="100"
                />
              </div>
            </v-col>
            <v-col class="mt-2">
              <v-row no-gutters>
                <v-col>
                  <h4 class="dashboard-title">
                    {{ PAGE_TITLES.GRAD_DATA_COLLECTION }}
                  </h4>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col>
                  <span>Upload Graduation Data Files (DEM, XAM and CRS)</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col
        v-if="hasRequiredPermission('GRAD_DIS_RPT_VIEW') && isLoggedInDistrictUser && !disableGradFunctionality"
        cols="12"
        md="6"
      >
        <v-card
          id="graduationCard"
          class="mx-auto"
          width="29em"
          height="100%"
          outlined
          rounded
        >
          <v-row class="pl-4">
            <v-col cols="3">
              <div>
                <v-icon
                  icon="mdi-chart-box-outline"
                  aria-hidden="false"
                  color="rgb(0, 51, 102)"
                  size="100"
                />
              </div>
            </v-col>
            <v-col class="mt-2">
              <v-row no-gutters>
                <v-col>
                  <h4 class="dashboard-title">
                    {{ PAGE_TITLES.GRAD_DISTRICT_REPORTS }}
                  </h4>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col
        v-if="hasRequiredPermission('GRAD_DIS_TVR_VIEW') && isLoggedInDistrictUser && !disableGradFunctionality"
        cols="12"
        md="6"
      >
        <v-card
          id="graduationCard"
          class="mx-auto"
          width="29em"
          height="100%"
          outlined
          rounded
        >
          <v-row class="pl-4">
            <v-col cols="3">
              <div>
                <v-icon
                  icon="mdi-finance"
                  aria-hidden="false"
                  color="rgb(0, 51, 102)"
                  size="100"
                />
              </div>
            </v-col>
            <v-col class="mt-2">
              <v-row no-gutters>
                <v-col>
                  <h4 class="dashboard-title">
                    {{ PAGE_TITLES.GRAD_DISTRICT_PROJECTIONS }}
                  </h4>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col
        v-if="hasRequiredPermission('GRAD_DIS_RPT_VIEW') && isLoggedInDistrictUser && !disableGradFunctionality"
        cols="12"
        md="6"
      >
        <v-card
          id="graduationCard"
          class="mx-auto"
          width="29em"
          height="100%"
          outlined
          rounded
        >
          <v-row class="pl-4">
            <v-col cols="3">
              <div>
                <v-icon
                  icon="mdi-certificate-outline"
                  aria-hidden="false"
                  color="rgb(0, 51, 102)"
                  size="100"
                />
              </div>
            </v-col>
            <v-col class="mt-2">
              <v-row no-gutters>
                <v-col>
                  <h4 class="dashboard-title">
                    {{ PAGE_TITLES.GRAD_TRANSCRIPT_PREVIEW }}
                  </h4>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col
        v-if="(isLoggedInSchoolUser || isLoggedInDistrictUser) && !disableGradFunctionality"
        cols="12"
        md="6"
      >
        <v-card
          id="gradChangeForm"
          class="mx-auto"
          width="29em"
          height="100%"
          outlined
          rounded
          @click="openGradChangeForm"
        >
          <v-row class="pl-4">
            <v-col cols="3">
              <div>
                <v-icon
                  icon="mdi-account-edit-outline"
                  aria-hidden="false"
                  color="rgb(0, 51, 102)"
                  size="100"
                />
              </div>
            </v-col>
            <v-col class="mt-2">
              <v-row no-gutters>
                <v-col>
                  <h4 class="dashboard-title">
                    {{ PAGE_TITLES.GRAD_CHANGE_FORM }}
                  </h4>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col>
                  <span>Correct Historical Records</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import alertMixin from '../../mixins/alertMixin';
import { authStore } from '../../store/modules/auth';
import { appStore } from '../../store/modules/app';
import { mapState } from 'pinia';
import {PAGE_TITLES} from '../../utils/constants';

export default {
  name: 'GraduationTableComponent',
  components: {
  },
  mixins: [alertMixin],
  props: {
    
  },
  data() {
    return {
      PAGE_TITLES: PAGE_TITLES,
      disableGradFunctionality: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(appStore, ['config']),
    isLoggedInSchoolUser(){
      return this.userInfo.activeInstituteType === 'SCHOOL';
    },
    isLoggedInDistrictUser(){
      return this.userInfo.activeInstituteType === 'DISTRICT';
    },
  },
  created() {
    this.disableGradFunctionality = this.config.DISABLE_GRAD_FUNCTIONALITY;
  },
  methods: {
    hasRequiredPermission(permission){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === permission).length > 0);
    },
    uploadDistrictFiles() {
      this.$router.push({name: 'grad-district-upload', params: {districtID: this.userInfo.activeInstituteIdentifier}});
    },
    uploadSchoolFiles() {
      this.$router.push({name: 'grad-school-upload', params: {schoolID: this.userInfo.activeInstituteIdentifier}});
    },
    backButtonClick() {
      this.$router.push({name: 'home'});
    },
    openProjections() {
      this.$router.push({name: 'grad-projections', params: {schoolID: this.userInfo.activeInstituteIdentifier}});
    },
    openReports() {
      this.$router.push({name: 'grad-reports', params: {schoolID: this.userInfo.activeInstituteIdentifier}});
    },
    openGradChangeForm() {
      window.open('https://forms.gov.bc.ca/education-training/trax-change-form', '_blank', 'noopener');
    }
  }
};
</script>

<style scoped>
  .dashboard-title {
    word-break: break-word;
    font-size: 20px;
  }

  .v-container {
  max-width: 60em !important;
}
</style>
