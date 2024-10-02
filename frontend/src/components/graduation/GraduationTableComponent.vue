<template>
<v-container>
    <v-row
      justify="start"
      align="center"
    >
      <v-col
        v-if="hasRequiredPermission('GRAD_SCH_EDIT') && isLoggedInSchoolUser && !disableGradFunctionality"
        cols="12"
        md="6"
      >
        <v-card
          id="graduationCard"
          class="mx-auto"
          width="25em"
          outlined
          rounded
          @click=""
        >
          <v-row class="pl-4">
            <v-col cols="4">
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
    }
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(appStore, ['config']),
    isLoggedInSchoolUser(){
      return this.userInfo.activeInstituteType === 'SCHOOL';
    }
  },
  created() {
    this.disableGradFunctionality = this.config.DISABLE_GRAD_FUNCTIONALITY;
  },
  methods: {
    hasRequiredPermission(permission){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === permission).length > 0);
    },
  }
};
</script>

<style scoped>
.dashboard-title {
  word-break: break-word;
  font-size: 20px;
}
.v-container {
  max-width: 51.5em !important;
}
</style>
