<template>
  <v-container 
    class="containerSetup"
    fluid
  >
    <div class="inner-border">
      <v-row no>
        <v-col cols="3">
          <div class="inner-border">
            <v-row>
              <v-col class="d-flex justify-center">
                <h3>Summary of Data Issues</h3>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="mr-5">
                <v-row>
                  <v-col class="d-flex justify-end">
                    <span>Errors</span>
                  </v-col>
                </v-row>
                <v-row no-gutters class="mt-1">
                  <v-col class="d-flex justify-end">
                    <v-icon size="35" color="red">mdi-alert-circle-outline</v-icon>
                    <span style="font-size: x-large">5</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-col class="ml-5">
                <v-row>
                  <v-col class="d-flex justify-start">
                    <span>Warnings</span>
                  </v-col>
                </v-row>
                <v-row no-gutters class="mt-1">
                  <v-col class="d-flex justify-start">
                    <v-icon size="35" color="blue">mdi-alert-outline</v-icon>
                    <span style="font-size: x-large">18</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
          <div style="background-color: #f6f5f5">
            <v-row>
              <v-col class="mx-4 mt-1">
                <v-row>
                  <v-col class="d-flex justify-center">
                    <v-text-field
                      id="legalUsualNameSearch"
                      placeholder="Legal or Usual Name"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-5">
                <v-row no-gutters class="mt-1">
                  <v-col cols="4" class="d-flex justify-start">
                    <v-text-field
                      id="penSearch"
                      placeholder="PEN"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <PrimaryButton
                      id="cancelMessage"
                      secondary
                      text="Clear"
                      class="mr-2"
                    />
                  </v-col>
                  <v-col>
                    <PrimaryButton
                      id="cancelMessage"
                      text="Search"
                      class="mr-2"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
        </v-col>
        <v-col cols="9">
          <div class="inner-border">
            <v-row>
              <v-col cols="6">
                <v-row>
                  <v-col class="d-flex justify-start">
                    <h3>Student Record</h3>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <PrimaryButton
                      id="removeRecord"
                      secondary
                      large-icon
                      icon="mdi-trash-can-outline"
                      text="Remove Record"
                      class="mt-n1"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="PEN"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="pen"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Local ID"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="localID"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Birthdate"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="birthdate"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Gender"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="gender"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Legal Surname"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="legalSurname"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Usual Surname"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="usualSurname"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Legal Given"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="legalGiven"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Usual Given"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="usualGiven"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Legal Middle"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="legalMiddle"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Usual Middle"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="usualMiddle"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Grade"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="grade"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Funding Code"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="fundingCode"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Number of Courses"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="numberOfCourses"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Other Courses"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="otherCourses"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Support Blocks"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="supportBlocks"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Special Ed. Category"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="specialEducationCategory"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Indigenous Ancestry"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="indigenousAncestry"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Band of Residence"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="bandOfResidence"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Home Language"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="homeLanguage"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Postal Code"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="postalCode"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Career Code"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="careerCode"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Program Codes"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="programCodes"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider :thickness="1" inset color="black" class="border-opacity-75 mt-16" vertical></v-divider>
              <v-col>
                <v-row>
                  <v-col class="d-flex justify-end">
                    <PrimaryButton
                      id="revertChanges"
                      secondary
                      large-icon
                      icon="mdi-arrow-u-left-top"
                      text="Revert Changes"
                      class="mt-n1"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="d-flex justify-center">
                <v-btn
                  icon="mdi-arrow-left-circle-outline"
                  size="35"
                  class="mr-2"
                  variant="text"
                >
                </v-btn>
                <PrimaryButton
                  id="saveAndRefreshButton"
                  text="Save & Refresh List"
                />
                <v-btn
                  icon="mdi-arrow-right-circle-outline"
                  size="35"
                  class="ml-2"
                  variant="text"
                >
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>
    
<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
    
export default {
  name: 'StepFourValidateData',
  components: {PrimaryButton},
  mixins: [alertMixin],
  props: {
  },
  emits: ['next'],
  data() {
    return {
      pen: '123456789',
      localID: '2468',
      birthdate: '2024/06/01',
      legalSurname: 'SMITH',
      legalGiven: 'EMILY',
      legalMiddle: 'ANNE',
      usualSurname: 'SMITH',
      usualGiven: 'EM',
      gender: 'F',
      usualMiddle: ' ',
      grade: '07',
      fundingCode: '20 - Living on Reserve',
      numberOfCourses: ' ',
      otherCourses: ' ',
      supportBlocks: ' ',
      specialEducationCategory: ' ',
      indigenousAncestry: ' ',
      bandOfResidence: ' ',
      homeLanguage: 'English',
      postalCode: ' ',
      careerCode: ' ',
      programCodes: ' ',
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID
    };
  },
  methods: {
    next() {
      this.$emit('next');
    },
  },
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

 .inner-border {
     border: 1px solid grey;
     border-radius: 5px;
     padding: 25px;
     margin-bottom: 2em;
 }

  @media screen and (max-width: 1200px) {
    .containerSetup{
      padding-right: 3em !important;
      padding-left: 3em !important;
    }
  }

  .form-hint{
    color: rgb(56, 89, 138);
    font-size: 14px;
  }
</style>




