<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <div class="inner-border">
      <v-row
        no-gutters
        class="mt-2 mb-2 d-flex justify-start"
      >
        <v-col
          cols="6"
          class="mt-1 d-flex justify-start"
        >
          <v-icon
            small
            color="#1976d2"
          >
            mdi-arrow-left
          </v-icon>
          <a
            class="ml-1"
            @click="backToDataIssues()"
          >Return to List of Data Issues</a>
        </v-col>
        <v-col class="d-flex justify-end">
          <PrimaryButton
            id="removeRecord"
            secondary
            large-icon
            icon="mdi-delete"
            text="Remove Record"
            class="mr-1"
            :click-action="deleteStudent"
          />
          <PrimaryButton
            id="revertChanges"
            disabled
            large-icon
            icon="mdi-arrow-u-left-top"
            text="Revert Changes"
            class="mr-1"
          />
          <PrimaryButton
            id="saveRecord"
            text="Validate & Save"
            class="mr-1"
            :click-action="save"
            :disabled="studentDetailsFormValid"
          />
        </v-col>
      </v-row>

      <EditStudent
        :selected-students="selectedStudents"
        :total-students="totalStudents"
        :save-event="saveStudent"
        :remove-event="removeStudent"
        @form-validity="isValid"
        @reset-parent="reset()"
        @clear-filter="clearFilter"
        @filter-pen="filterByPen"
      />
    </div>
  </v-container>
</template>
<script>


import PrimaryButton from '../../util/PrimaryButton.vue';
import EditStudent from '../../common/EditStudent.vue';

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
  emits: ['next', 'show-issues', 'clear-filter', 'filter-pen'],
  data() {
    return {
      saveStudent: false,
      removeStudent: false,
      studentDetailsFormValid: true,
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
    deleteStudent() {
      this.removeStudent=true;
    },
    backToDataIssues() {
      this.$emit('show-issues');
    },
    clearFilter() {
      this.$emit('clear-filter');
    },
    filterByPen($event) {
      this.$emit('filter-pen', $event);
    },
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

</style>
