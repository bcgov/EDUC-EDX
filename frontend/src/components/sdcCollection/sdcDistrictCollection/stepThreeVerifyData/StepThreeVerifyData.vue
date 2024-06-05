<template>
  <div class="border">
    <v-tabs
      v-model="tab"
      color="#38598a"
      show-arrows
    >
      <v-tab
        v-for="name in visibleTabs"
        :key="name"
        class="divider"
        :value="name"
      >
        {{ name }}
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item
        value="All Students"
        transition="false"
        reverse-transition="false"
      >
        <AllStudentsComponent
          v-if="tab==='All Students'"
          :district="district"
        />
      </v-window-item>
      <v-window-item
        value="French Programs"
        transition="false"
        reverse-transition="false"
      >
        <FrenchProgramsComponent
          v-if="tab==='French Programs'"
          :district="district"
        />
      </v-window-item>
      <v-window-item
        value="Career Programs"
        transition="false"
        reverse-transition="false"
      >
        <CareerProgramsComponent
          v-if="tab==='Career Programs'"
          :district="district"
        />
      </v-window-item>
      <v-window-item
        value="Indigenous Students & Support Programs"
        transition="false"
        reverse-transition="false"
      >
        <IndSupportProgramsComponent
          v-if="tab==='Indigenous Students & Support Programs'"
          :district="district"
        />
      </v-window-item>
      <v-window-item
        value="Special Education"
        transition="false"
        reverse-transition="false"
      >
        <SpecialEduComponent
          v-if="tab==='Special Education'"
          :district="district"
        />
      </v-window-item>
      <v-window-item
        value="English Language Learning"
        transition="false"
        reverse-transition="false"
      >
        <EnglishLangComponent
          v-if="tab==='English Language Learning'"
          :district="district"
        />
      </v-window-item>
      <v-window-item
        value="Refugee"
        transition="false"
        reverse-transition="false"
      >
        <RefugeeComponent
          v-if="tab==='Refugee'"
          :district="district"
        />
      </v-window-item>
    </v-window> 
  </div>

  <v-row justify="end">
    <PrimaryButton
      id="step-3-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Verify all program tabs as correct"
      :click-action="next"
    />
  </v-row>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import { SDC_VERIFY_TABS } from '../../../../utils/sdc/SdcVerifyTabs';
import AllStudentsComponent from './AllStudentsComponent.vue';
import CareerProgramsComponent from './CareerProgramsComponent.vue';
import IndSupportProgramsComponent from './IndSupportProgramsComponent.vue';
import SpecialEduComponent from './SpecialEduComponent.vue';
import EnglishLangComponent from './EnglishLangComponent.vue';
import RefugeeComponent from './RefugeeComponent.vue';
import FrenchProgramsComponent from './FrenchProgramsComponent.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {setFailureAlert} from '../../../composable/alertComposable';
import {appStore} from '../../../../store/modules/app';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';

export default {
  name: 'StepThreeVerifyData',
  components: {
    PrimaryButton,
    AllStudentsComponent,
    CareerProgramsComponent,
    IndSupportProgramsComponent,
    SpecialEduComponent,
    EnglishLangComponent,
    RefugeeComponent,
    FrenchProgramsComponent
  },
  mixins: [alertMixin],
  props: {
    districtCollectionObject: {
      type: Object,
      required: true,
      default: null
    },
    isStepComplete: {
      type: Boolean,
      required: true
    }
  },
  emits: ['next', 'previous'],
  data() {
    return {
      tab: null,
      tabs: SDC_VERIFY_TABS,
      type: 'SDC',
      sdcDistrictCollectionID: this.$route.params.districtCollectionID,
      district: {}
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode']),
    ...mapState(appStore, ['activeDistrictsMap']),
    showRefugeeTab() {
      return (
        this.currentCollectionTypeCode === 'February'
      );
    },
    visibleTabs() {
      return this.showRefugeeTab ? this.tabs : this.tabs.filter((tab) => tab !== 'Refugee');
    },
  },
  created() {
    appStore().getInstitutesData().finally(() => {
      this.district = this.activeDistrictsMap.get(this.districtCollectionObject.districtID);
    });
  },
  methods: {
    markStepAsComplete(){
      let updateCollection = {
        districtCollection: this.districtCollectionObject,
        status: 'VERIFIED'
      };
      ApiService.apiAxios.put(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}`, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while updating status. Please try again later.');
        });
    },
    next() {
      if(this.isStepComplete || this.districtCollectionObject.sdcDistrictCollectionStatusCode === 'SUBMITTED') {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
  }
};
</script>

<style scoped>

.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}

.form-hint{
  color: rgb(56, 89, 138);
  font-size: 14px;
}

.divider {
  border-right: 1px solid lightgray;
  border-radius: 0px;
}

.divider:last-child  {
  border-right: 0
}
</style>
