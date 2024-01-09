<template>
  <v-container
    fluid
  >
    <div class="border">
      <v-tabs
        v-model="tab"
        color="#38598a"
        show-arrows
      >
        <v-tab
          v-for="name in tabs"
          :key="name"
          class="divider"
          :value="name"
        >
          {{ name }}
        </v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="FTE" transition="false" reverse-transition="false">
          <FTEComponent :school="school" />
        </v-window-item>
        <v-window-item value="French Programs" transition="false" reverse-transition="false">
          <FrenchProgramsComponent />
        </v-window-item>
        <v-window-item value="Career Programs" transition="false" reverse-transition="false">
          <CareerProgramsComponent />
        </v-window-item>
        <v-window-item value="Indigenous Students & Support Programs" transition="false" reverse-transition="false">
          <IndSupportProgramsComponent />
        </v-window-item>
        <v-window-item value="Special Education" transition="false" reverse-transition="false">
          <SpecialEduComponent />
        </v-window-item>
        <v-window-item value="English Language Learning" transition="false" reverse-transition="false">
          <EnglishLangComponent />
        </v-window-item>
        <v-window-item value="Refugee" transition="false" reverse-transition="false">
          <RefugeeComponent />
        </v-window-item>
      </v-window>
    </div>

    <v-row justify="end">
      <PrimaryButton
        id="nextButton"
        class="mr-2 mb-3"
        icon="mdi-check"
        text="Verify as Correct"
        :click-action="next"
      />
    </v-row>
  </v-container>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
import { appStore } from '../../../store/modules/app';
import { SDC_VERIFY_TABS } from '../../../utils/sdc/SdcVerifyTabs';
import FTEComponent from './FTEComponent.vue';
import CareerProgramsComponent from './CareerProgramsComponent.vue';
import IndSupportProgramsComponent from './IndSupportProgramsComponent.vue';
import SpecialEduComponent from './SpecialEduComponent.vue';
import EnglishLangComponent from './EnglishLangComponent.vue';
import RefugeeComponent from './RefugeeComponent.vue';
import FrenchProgramsComponent from './FrenchProgramsComponent.vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';

export default {
  name: 'StepThreeVerifyData',
  components: {
    PrimaryButton,
    FTEComponent,
    CareerProgramsComponent,
    IndSupportProgramsComponent,
    SpecialEduComponent,
    EnglishLangComponent,
    RefugeeComponent,
    FrenchProgramsComponent
  },
  mixins: [alertMixin],
  props: {
    schoolCollectionObject: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: ['next', 'previous'],
  data() {
    return {
      tab: null,
      tabs: SDC_VERIFY_TABS,
      type: 'SDC',
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      school: {}
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentStepInCollectionProcess']),
    ...mapState(appStore, ['activeSchoolsMap']),
  },
  created() {
    appStore().getInstitutesData().finally(() => {
      this.school = this.activeSchoolsMap.get(this.schoolCollectionObject.schoolID);
    });
  },
  methods: {
    next() {
      if(this.currentStepInCollectionProcess.isComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    markStepAsComplete() {
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'SCH_D_VRFD'
      };
      ApiService.apiAxios.put(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying data. Please try again later.');
        });
    }
  }
};
</script>

<style scoped>
.containerSetup{
  padding-right: 5em !important;
  padding-left: 5em !important;
}

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

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}
.divider {
  border-right: 1px solid lightgray;
  border-radius: 0px;
}

.divider:last-child  {
  border-right: 0
}
</style>
