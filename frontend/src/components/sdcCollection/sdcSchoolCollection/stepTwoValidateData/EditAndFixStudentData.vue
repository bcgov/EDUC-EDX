<template>
  <v-card
    id="editAndFixCard"
  >
    <v-card-title
        id="viewStudentCardTitle"
        class="sheetHeader pt-1 pb-1"
      >
        Edit Student
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row
      >
        
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="#003366"
            text="Cancel"
            variant="outlined"
            class="mr-1"
            @click="cancel"
          />
          <v-btn
            id="removeRecord"
            color="#003366"
            large-icon
            prepend-icon="mdi-delete"
            text="Remove"
            variant="outlined"
            class="mr-1"
            :disabled="showConfirmationBanner"
            @click="showBanner"
          />
          <v-btn
            id="revertChanges"
            disabled
            large-icon
            color="#003366"
            variant="outlined"
            prepend-icon="mdi-arrow-u-left-top"
            text="Revert"
            class="mr-1"
          />
          <v-btn
            id="saveRecord"
            color="#003366"
            text="Validate & Save"
            class="mr-1"
            @click="save"
            :disabled="!studentDetailsFormValid || showConfirmationBanner"
          />
        </v-col>
      </v-row>

      <v-row class="pt-2 pb-2" v-if="showConfirmationBanner">
        <v-banner
            lines="one"
            :border="0"
            text="Are you sure that you would like to remove this student from the 1701 submission?"
            style="background-color: rgb(235, 237, 239);"
          >
            <v-banner-actions>
              <PrimaryButton
                id="rejectBtn"
                secondary
                text="Cancel"
                :click-action="reject"
                class="mr-4"
              />
              <PrimaryButton
                id="resolveBtn"
                text="Yes"
                :click-action="deleteStudent"
              />
            </v-banner-actions>
          </v-banner>
      </v-row>

      <EditStudent
        :selected-students="selectedStudents"
        :total-students="totalStudents"
        :save-event="saveStudent"
        :remove-event="removeStudent"
        @form-validity="isValid"
        @reset-parent="reset()"
        @show-issues="cancel"
        @clear-filter="clearFilter"
        @filter-pen="filterByPen"
        @reset-pagination=resetPagination
      />
      </v-card-text>
  </v-card>
</template>
<script>


import PrimaryButton from '../../../util/PrimaryButton.vue';
import EditStudent from '../../../common/EditStudent.vue';

export default {
  name: 'EditAndFixStudentData',
  components: {
    PrimaryButton,
    EditStudent
  },
  props: {
    selectedStudents: {
      type: Array,
      required: true,
      default: null
    },
    totalStudents: {
      type: Number,
      required: false,
      default: null
    }
  },
  emits: ['next', 'clear-filter', 'filter-pen', 'close', 'reset-pagination'],
  data() {
    return {
      saveStudent: false,
      removeStudent: false,
      studentDetailsFormValid: true,
      showConfirmationBanner: false
    };
  },
  computed: {

  },
  watch: {
   
  },
  mounted() {
  },
  async created() {

  },
  methods: {
    resetPagination() {
      this.$emit('reset-pagination');
    },
    isValid($event) {
      this.studentDetailsFormValid = $event;
    },
    reset() {
      this.saveStudent =false;
      this.removeStudent=false;
    },
    save() {
      this.saveStudent =true;
    },
    showBanner() {
      this.showConfirmationBanner = true;
    },
    deleteStudent() {
      this.removeStudent=true;
      this.showConfirmationBanner= !this.showConfirmationBanner;
    },
    clearFilter() {
      this.$emit('clear-filter');
    },
    filterByPen($event) {
      this.$emit('filter-pen', $event);
    },
    cancel() {
      this.$emit('close');
    },
    reject() {
      this.showConfirmationBanner= false;
      this.reset();
    }
  }
};
</script>

<style scoped>
 .containerSetup{
    padding-right: 0em !important;
    padding-left: 0em !important;
  }

  .border {
    border: 2px solid grey;
    border-radius: 5px;
    padding: 35px;
    margin-bottom: 2em;
  }

  .clear-message {
    border: 1px solid darkgreen;
    color: darkgreen;
    background-color: transparent;
    padding: 10px;
  }

 .inner-border {
   display: inline-block;
   min-width: 100%;
   border: 1px solid rgba(42, 45, 38, 0.38);
   border-radius: 5px;
   padding: 2em;
   margin-bottom: 2em;
 }

  @media screen and (max-width: 1200px) {
    .containerSetup{
      padding-right: 3em !important;
      padding-left: 3em !important;
    }
  }

  .footer-text {
    font-style: italic;
    color: grey;
  }

  .filter-text {
    font-style: italic;
    color: rgb(56, 89, 138);
  }

  .filter-text:hover {
  text-decoration: underline;
  }

  .success-message{
    vertical-align: sub;
   }
   .sheetHeader {
        background-color: #003366;
        color: white;
        font-size: medium !important;
        font-weight: bolder !important;
    }

</style>
