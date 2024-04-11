<template>
  <v-row class="mt-n6">
    <v-spacer />
    <v-slide-group
      class="py-4"
      show-arrows
    >
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                School Data Uploaded
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Have Data</div>
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsWithData }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Missing Data</div>
                  <span>
                    {{
                      monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsWithData
                    }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                School Data Issues
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Errors</div>
                  <v-icon color="#d90606">
                    mdi-alert-circle-outline
                  </v-icon>
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.totalErrors }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Funding Warnings</div>
                  <v-icon color="orange">
                    mdi-alert-outline
                  </v-icon>
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.totalFundingWarnings }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Info Warnings</div>
                  <v-icon color="blue">
                    mdi-alert-circle-outline
                  </v-icon>
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.totalInfoWarnings }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                School Details Confirmed
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Confirmed</div>
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsDetailsConfirmed }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Not Confirmed</div>
                  <span>
                    {{
                      monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsDetailsConfirmed
                    }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                School Contacts Confirmed
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Confirmed</div>
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsContactsConfirmed }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Not Confirmed</div>
                  <span>
                    {{
                      monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsContactsConfirmed
                    }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                School Submitted to District
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Submitted</div>
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsSubmitted }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Not Submitted</div>
                  <span>
                    {{
                      monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsSubmitted
                    }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
    </v-slide-group>
    <v-spacer />
  </v-row>
  <v-data-table
    :headers="headers"
    :items="monitorSdcSchoolCollectionsResponse.monitorSdcSchoolCollections"
    items-per-page="-1"
  >
    <template #item.schoolTitle="{ value }">
      <a :href="`/open-collection-details/` + value.sdcSchoolCollectionId">{{ value.title }}</a>
    </template>
    <template #item.uploadDate="{ value }">
      <span v-if="value">
        {{ formatDate(value, "uuuu-MM-dd'T'HH:mm:ss.SSSSSS") }}
        <v-tooltip activator="parent">
          {{ formatDateTime(value, "uuuu-MM-dd'T'HH:mm:ss.SSSSSS", 'uuuu/MM/dd HH:mm:ss', true) }}
        </v-tooltip>
      </span>
      <span v-else>
        -
      </span>
    </template>
    <template #item.detailsConfirmed="{ value }">
      <v-icon
        :icon="value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
        :color="value ? 'success' : 'error'"
      />
    </template>
    <template #item.contactsConfirmed="{ value }">
      <v-icon
        :icon="value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
        :color="value ? 'success' : 'error'"
      />
    </template>
    <template #item.submittedToDistrict="{ value }">
      <v-icon
        :icon="value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
        :color="value ? 'success' : 'error'"
      />
    </template>
    <template #bottom />
  </v-data-table>
  <v-row
    v-if="disableNextButton()"
    justify="end"
  >
    <p class="form-hint mr-3">
      {{ monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsSubmitted }}
      schools not
      submitted
    </p>
  </v-row>
  <v-row justify="end">
    <PrimaryButton
      id="step-2-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Next"
      :disabled="disableNextButton()"
      :click-action="next"
    />
  </v-row>
</template>
<script>
import {defineComponent} from 'vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {setFailureAlert} from '../../composable/alertComposable';
import {formatDate, formatDateTime} from '../../../utils/format';
import PrimaryButton from '../../util/PrimaryButton.vue';

export default defineComponent({
  name: 'StepTwoMonitor',
  components: {PrimaryButton},
  emits: ['next'],
  data() {
    return {
      headers: [
        {
          title: 'School',
          align: 'start',
          key: 'schoolTitle',
          value: item => { return { title: item.schoolTitle, sdcSchoolCollectionId: item.sdcSchoolCollectionId }; }
        },
        {
          title: 'Data Uploaded',
          align: 'center',
          key: 'uploadDate',
        },
        {
          title: 'Errors',
          align: 'center',
          key: 'errors',
          value: item => item.uploadDate ? item.errors : '-'
        },
        {
          title: 'Funding Warnings',
          align: 'center',
          key: 'fundingWarnings',
          value: item => item.uploadDate ? item.fundingWarnings : '-'
        },
        {
          title: 'Info Warnings',
          align: 'center',
          key: 'infoWarnings',
          value: item => item.uploadDate ? item.infoWarnings : '-'
        },
        {
          title: 'Details Confirmed',
          align: 'center',
          key: 'detailsConfirmed',
        },
        {
          title: 'Contacts Confirmed',
          align: 'center',
          key: 'contactsConfirmed',
        },
        {
          title: 'Submitted to District',
          align: 'center',
          key: 'submittedToDistrict',
        },
      ],
      monitorSdcSchoolCollectionsResponse: []
    };
  },
  async created() {
    await this.getSdcSchoolCollections();
  },
  methods: {
    disableNextButton() {
      return this.monitorSdcSchoolCollectionsResponse?.totalSchools - this.monitorSdcSchoolCollectionsResponse?.schoolsSubmitted !== 0;
    },
    formatDateTime,
    formatDate,
    async getSdcSchoolCollections(){
      this.loadingCount += 1;
      await ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}/sdcSchoolCollectionMonitoring`, {
      }).then(response => {
        this.monitorSdcSchoolCollectionsResponse = response?.data;
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc school collections. Please try again later.');
      }).finally(() => {
        this.loadingCount -= 1;
      });
    },
    markStepAsComplete(){
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'REVIEWED'
      };
      ApiService.apiAxios.put(`${ApiRoutes.sdc.BASE_URL}/${this.$route.params.schoolCollectionID}`, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while updating status. Please try again later.');
        });
    },
    next() {
      if(this.isStepComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    }
  }
});
</script>

<style scoped>
.column-header {
  font-weight: bold;
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
}
.column-data {
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
  white-space: nowrap;
}
.divider {
  height: 3rem;
  margin-top: 1rem;
}
.form-hint{
  color: rgb(56, 89, 138);
  font-size: 14px;
}
.row-data {
  flex-wrap: nowrap;
}
</style>
