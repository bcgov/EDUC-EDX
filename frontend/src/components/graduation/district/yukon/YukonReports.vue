<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <div>
      <v-row>
        <v-col>
          <h3>
            Student Graduation Data
          </h3>
        </v-col>
      </v-row>
      <v-row class="mt-n6">
        <v-col>
          <h4 style="font-weight: normal; color:gray">
            Select a graduation date range to download a list of graduates from your district within that period.
          </h4>
        </v-col>
      </v-row>
      <v-row>
        <v-col style="font-weight: bold;">
          Graduation Date
        </v-col>
      </v-row>

      <v-row style="height: 60vh;">
        <v-col>
          <v-form
            id="yukonDateForm"
            ref="yukonDateForm"
            v-model="isValid"
          >
            <v-row>
              <v-col cols="4">
                <VueDatePicker
                  v-model="fromDate"
                  model-type="yyyy/MM"
                  month-picker
                  position="left"
                  :clearable="false"
                  :min-date="minDate"
                  :max-date="maxDate"
                  :prevent-min-max-navigation="true"
                  :text-input="{
                    enterSubmit: true,
                    tabSubmit: true,
                    openMenu: true,
                    format: 'yyyy/MM'
                  }"
                  auto-apply
                  format="yyyy/MM"
                  preview-format="yyyy/MM"
                  @update:model-value="validateForm"
                >
                  <template #dp-input="{ value, onInput, onEnter, onTab }">
                    <v-text-field
                      type="text"
                      :model-value="value"
                      :rules="[rules.required()]"
                      prepend-inner-icon="mdi-calendar"
                      label="From"
                      variant="underlined"
                      density="compact"
                      placeholder="yyyy/mm"
                      clearable
                      hide-details="auto"
                      :error-messages="null"
                      @input="onInput"
                      @keydown.enter.prevent="onEnter"
                      @keydown.tab.prevent="onTab"
                    />
                  </template>
                </VueDatePicker>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="4">
                <VueDatePicker
                  v-model="toDate"
                  model-type="yyyy/MM"
                  month-picker
                  position="left"
                  :clearable="false"
                  :min-date="minDate"
                  :max-date="maxDate"
                  :prevent-min-max-navigation="true"
                  :text-input="{
                    enterSubmit: true,
                    tabSubmit: true,
                    openMenu: true,
                    format: 'yyyy/MM'
                  }"
                  auto-apply
                  format="yyyy/MM"
                  preview-format="yyyy/MM"
                  @update:model-value="validateForm"
                >
                  <template #dp-input="{ value, onInput, onEnter, onTab }">
                    <v-text-field
                      type="text"
                      :model-value="value"
                      :rules="[rules.required(), rules.endDateRule(calcFromDate, calcToDate)]"
                      prepend-inner-icon="mdi-calendar"
                      label="To"
                      variant="underlined"
                      density="compact"
                      placeholder="yyyy/mm"
                      clearable
                      hide-details="auto"
                      :error-messages="null"
                      @input="onInput"
                      @keydown.enter.prevent="onEnter"
                      @keydown.tab.prevent="onTab"
                    />
                  </template>
                </VueDatePicker>
              </v-col>
            </v-row>
          
            <v-row>
              <v-col>
                <v-btn
                  id="gradData"
                  color="#003366"
                  text="Graduation Data"
                  class="mr-1 mt-2"
                  prepend-icon="mdi-download"
                  :disabled="!isValid"
                  @click="downloadGradData"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>
        
<script>
import alertMixin from '../../../../mixins/alertMixin';
import VueDatePicker from '@vuepic/vue-datepicker';
import * as Rules from '../../../../utils/institute/formRules';
import {LocalDate} from '@js-joda/core';
import { ApiRoutes } from '../../../../utils/constants';
import { mapState } from 'pinia';
import { authStore } from '../../../../store/modules/auth';
import moment from 'moment';
        
export default {
  name: 'YukonReports',
  components: {
    VueDatePicker
  },
  mixins: [alertMixin],
  props: {

  },
  emits: [],
  data() {
    return {
      isValid: false,
      fromDate: null,
      toDate: null,
      rules: Rules,
      minDate: new Date(LocalDate.now().year() - 5, 0, 1),
      maxDate: new Date(LocalDate.now().year(), 11, 31),
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    calcFromDate() {
      if(this.fromDate) {
        // Parse the date (assuming format like 'YYYY/MM')
        const momentDate = moment(this.fromDate, 'YYYY/MM');
        // Get the last day of the month
        return momentDate.startOf('month').format('YYYY-MM-DD');
      }
      return null;
    },

    calcToDate() {
      if(this.toDate) {
        // Parse the date (assuming format like 'YYYY/MM')
        const momentDate = moment(this.toDate, 'YYYY/MM');
        // Get the last day of the month
        return momentDate.endOf('month').format('YYYY-MM-DD');
      }
      return null;
    }
  },
  watch: {
      
  },
  async created() {
        
  },
  mounted() {

  },
  methods: {
    downloadGradData() {
      this.isLoading = true;
      try {
        const url = `${ApiRoutes.gradReports.BASE_URL}/district/${this.userInfo.activeInstituteIdentifier}/yukon-report/${this.calcFromDate}/${this.calcToDate}`;
        window.open(url);
      } catch (error) {
        console.error(error);
        this.setFailureAlert(
          error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to retrieve report.'
        );
      } finally {
        this.isLoading = false;
      }
    },
    async validateForm() {
      const valid = await this.$refs.yukonDateForm.validate();
      this.isValid = valid.valid;
    },
  }
};
</script>
        
<style scoped>
:deep(.dp__input_wrap) {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}
.dp__action_row .dp__action_buttons .dp__action_select {
  color: var(--dp-primary-text-color);
}
.containerSetup{
  padding-right: 10em !important;
  padding-left: 10em !important;
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}
h3 {
  color: #38598a;
}
</style>
        
    
  
