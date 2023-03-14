<template>
  <v-card class="add-student">
    <v-alert
      id="addStudentAlert"
      v-model="alert"
      dense
      outlined
      dismissible
      :class="alertType"
      class="mb-3"
    >
      {{ alertMessage }}
    </v-alert>
    <v-form
      ref="studentForm"
      v-model="validForm"
    >
      <v-row>
        <v-col
          class="d-flex justify-center px-5"
          style="min-width: 50em"
        >
          <v-text-field
            id="studentPenTextField"
            v-model="penNumber"
            class="pr-5"
            clearable
            variant="underlined"
            label="Student's PEN"
            :rules="penRules"
            maxlength="9"
            counter="9"
          />
          <PrimaryButton
            id="searchPenBtn"
            class="mt-2"
            width="7rem"
            :disabled="enableSearchButton"
            text="Search"
            :loading="isSearchingStudent"
            :click-action="searchStudentForGivenPEN"
          />
        </v-col>
      </v-row>
    </v-form>
    <v-row
      v-if="showStudentDetails"
      no-gutters
    >
      <v-icon
        v-if="showStudentDetails"
        x-large
        class="pr-2"
      >
        mdi-account-box-outline
      </v-icon>
      <div
        v-if="showStudentDetailsForMinistryStaff"
        :class="['d-flex', 'flex-column']"
      >
        <span class="pt-0 pl-0 pb-2">Student details will be available for ministry staff. </span>
      </div>
      <div
        v-if="showStudentDetails"
        :class="['d-flex', 'flex-column']"
      >
        <strong>{{ student['studentName'] }}</strong>
        <span>{{ student['studentLocalID'] }}</span>
        <span>{{ student['studentDoB'] }}</span>
        <span>{{ student['studentGender'] }}</span>
      </div>
    </v-row>
    <v-row class="justify-end pr-2 pt-2">
      <PrimaryButton
        id="cancelAddStudentBtn"
        secondary
        text="Cancel"
        class="mr-2"
        :click-action="closeForm"
      />
      <PrimaryButton
        id="addStudentToNewMessageBtn"
        :disabled="!studentExist"
        text="Add"
        width="7rem"
        :click-action="addStudentToMessage"
      />
    </v-row>
  </v-card>
</template>

<script>
import ApiService from '../common/apiService';
import alertMixin from '../mixins/alertMixin';
import PrimaryButton from './util/PrimaryButton.vue';
import {isValidPEN} from '../utils/validation';
import {ApiRoutes, MINISTRY_NAME} from '../utils/constants';
import { appStore } from '../store/modules/app';
import { mapState } from 'pinia';

export default {
  components: {PrimaryButton},
  mixins: [alertMixin],
  props: {
    eager: {
      type: Boolean,
      default: false
    },
    schoolID: {
      type: String,
      required: true
    },
    additionalStudentAddWarning:{
      type: String,
      required: false,
      default: ''
    }
  },
  emits: ['close:form','add-student','update-additional-student-add-warning'],
  data() {
    return {
      isSearchingStudent: false,
      showStudentDetails: false,
      showStudentDetailsForMinistryStaff:false,
      penNumber: null,
      validForm: false,
      penRules: [v => !!v || 'Required', v => (!v || isValidPEN(v))],
      studentExist: false,
      student: {},
      alert: false,
      alertMessage: null,
      alertType: null
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap']),
    enableSearchButton() {
      return !(isValidPEN(this.penNumber));
    }
  },
  watch: {
    additionalStudentAddWarning: {
      handler(newValue) {
        if (!newValue) {
          return;
        }
        this.setInfoAlert(newValue);
      },
      immediate: true
    },
    alert(newVal){
      if(!newVal){
        this.$emit('update-additional-student-add-warning','');
      }
    },
    penNumber(newVal) {
      if (!(isValidPEN(newVal))) {
        this.student = {};
        this.showStudentDetails=false;
        this.showStudentDetailsForMinistryStaff=false;
        this.studentExist=false;
        if(this.alertType && this.alertType !== 'bootstrap-info'){
          this.alert = false;
        }
      }
    },
  },
  mounted() {
    this.validateForm();
  },
  methods: {
    setErrorAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    setInfoAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-info';
      this.alert = true;
    },
    async validateForm() {
      const valid = this.$refs.studentForm.validate();
      this.isFormValid = valid.valid;
    },
    searchStudentForGivenPEN() {
      this.isSearchingStudent = true;
      this.studentExist = false;
      this.student = {};
      ApiService.apiAxios.get(ApiRoutes.studentRequest.SEARCH_URL, {
        params: {
          pen: this.penNumber,
          mincode: this.schoolsMap.get(this.schoolID)?.mincode //this remains as we need to pass the mincode for checking
        }
      })
        .then(response => {
          this.populateStudentInfoCard(response.data);
        })
        .catch(error => {
          if (error?.response?.data?.message) {
            this.setErrorAlert(error?.response?.data?.message);
          } else {
            this.setErrorAlert(`PEN must be a valid PEN associated with a student at the ${MINISTRY_NAME}`);
          }
        }).finally(() => {
          this.isSearchingStudent = false;
        });

    },
    populateStudentInfoCard(data) {
      this.alert = false;
      this.studentExist = true;
      this.showStudentDetails = true;
      this.student = {};
      if (!data.firstName) {
        this.student['studentID'] = data.studentID;
        this.student['pen']=data.pen;
        this.showStudentDetailsForMinistryStaff=true;
      } else {
        this.student['pen']=data.pen;
        this.student['studentID'] = data.studentID;
        this.student['studentName'] = data.firstName + ' ' + (data.middleName ?? '') + ' ' + data.lastName;
        this.student['studentLocalID'] = data.localID;
        this.student['studentGender'] = data.gender;
        this.student['studentDoB'] = data.doB;
        this.showStudentDetailsForMinistryStaff=false;
      }
    },
    closeForm() {
      this.resetForm();
      this.$emit('close:form');
    },
    resetForm() {
      this.$refs.studentForm.reset();
      this.alert = false;
      this.alertMessage = null;
      this.validateForm();
    },
    addStudentToMessage() {
      let secureExchangeStudent = {
        studentID: this.student['studentID'],
        pen: this.student['pen']
      };
      this.$emit('add-student', secureExchangeStudent);
      this.resetForm();
      this.$emit('close:form');
    },
  },


};
</script>

<style scoped>
.add-student {
  padding: 1.1rem;
  max-width: 50rem;
  min-width: 10rem;
}

p {
  padding-top: 10px;
}

ul {
  width: 100%;
}


h3 {
  font-size: 1.2rem
}
.v-alert >>> .v-alert__content {
  max-width: 28em;
}
</style>
