<template>
  <v-container 
    class="containerSetup"
    fluid
  >
    <div class="inner-border">
      <v-row>
        <v-col class="pr-0" cols="3">
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
                    <v-icon size="35" color="#d90606">mdi-alert-circle-outline</v-icon>
                    <span style="font-size: x-large">5</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider :thickness="1" inset color="#b3b0b0" class="border-opacity-75" vertical></v-divider>
              <v-col class="ml-5 mr-5">
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
          <div style="border-radius: 5px; background-color: #f6f5f5">
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
                  <v-col cols="5" class="d-flex justify-start">
                    <v-text-field
                      id="penSearch"
                      placeholder="PEN"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <PrimaryButton
                      id="clearSearch"
                      secondary
                      width="3em"
                      text="Clear"
                      class="mr-2"
                    />
                  </v-col>
                  <v-col>
                    <PrimaryButton
                      id="searchButton"
                      text="Search"
                      width="6em"
                      class="mr-2"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
          <div>
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              :items-length="studentList.length"
              :items="studentList"
              :loading="loading"
              class="mt-2"
              item-title="name"
              item-value="name"
            >
              <template v-slot:headers>
                <v-row no-gutters style="border-bottom-style: groove; border-bottom-color: rgb(255 255 255 / 45%);">
                  <v-col cols="5" offset="1">
                    <v-row>
                      <v-col>
                        <span class="headerVal">PEN</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="headerVal">Local ID</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="5">
                    <v-row>
                      <v-col>
                        <span class="headerVal">Legal Name</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="headerVal">Usual Name</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </template>
              <template v-slot:item="{ item, index }">
                <v-row class="hoverTable" no-gutters style="border-bottom-style: groove; border-bottom-color: rgb(255 255 255 / 45%);">
                  <v-col cols="1">
                    <v-icon class="mt-2" size="25" :color="getIssueIconColor(item.value)">{{getIssueIcon(item.value)}}</v-icon>
                  </v-col>
                  <v-col cols="5">
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{item.value.pen}}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{item.value.localID}}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{item.value.legalName}}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{item.value.usualName}}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </template>
            </v-data-table-server>
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
                <v-row class="mt-6">
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
              <v-divider :thickness="1" inset color="#b3b0b0" class="border-opacity-75 mt-16" vertical></v-divider>
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
                <v-row>
                  <v-col class="pl-0 pr-6">
                    <v-timeline
                      v-if="studentIssues"
                      side="end"
                      align="start"
                      truncate-line="start"
                    >
                      <v-timeline-item
                        v-for="(issue,index) in studentIssues"
                        :key="issue.issueID"
                        dot-color="white"
                        fill-dot
                        :icon-color="getIssueIconColor(issue)"
                        :icon="getIssueIcon(issue)"
                        size="large"
                        width="100%"
                      >
                        <v-row class="mt-n1">
                          <v-col>
                            <h3 :style="`color:` + getIssueIconColor(issue)">{{ issue.type }}</h3>
                          </v-col>
                        </v-row>
                        <v-row no-gutters>
                          <v-col>
                            <span> {{ issue.description }}</span>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col>
                            <div v-for="(field,index) in issue.fields"
                                 :key="field.fieldName">
                              <v-text-field
                                :label="field.fieldName"
                                density="compact"
                                variant="underlined"
                                v-model="field.fieldValue"
                              >
                              </v-text-field>
                            </div>
                          </v-col>
                        </v-row>
                      </v-timeline-item>
                    </v-timeline>
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
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      itemsPerPage: 10,
      headers: [
        {
          title: 'PEN',
          align: 'start',
          sortable: false,
          key: 'name',
        },
        { title: 'Local ID', key: 'calories', align: 'end' }
      ],
      studentIssues: [
        {
          issueID: '1',
          type: 'Error',
          description: 'PEN reported more than once. Correct the PEN or remove the appropriate student from the submission.',
          fields: [
            {
              fieldName: 'PEN',
              fieldValue: '123456789'
            }
          ]
        },
        {
          issueID: '2',
          type: 'Error',
          description: 'Students must be reported with both a Band of Residence and a Funding Code of Living on Reserve (20). Add or remove both values.',
          fields: [
            {
              fieldName: 'Funding Code',
              fieldValue: '20 - Living on Reserve',
            },
            {
              fieldName: 'Band of Residence',
              fieldValue: ' ',
            }
          ]
        },
        {
          issueID: '3',
          type: 'Warning',
          description: 'Missing Postal Code.',
          fields: [
            {
              fieldName: 'Postal Code',
              fieldValue: ' '
            }
          ]
        },
      ],
      studentList: [
        {
          pen: '123456789',
          localID: '2468',
          legalName: 'SMITH, EMILY ANNE',
          usualName: 'SMITH, XX',
          type: 'Error'
        },
        {
          pen: '123456789',
          localID: '2468',
          legalName: 'SMITH, EMILY ANNE',
          usualName: null,
          type: 'Error'
        },
        {
          pen: '852963741',
          localID: '2356',
          legalName: 'BROWN, JAKE',
          usualName: null,
          type: 'Error'
        },
        {
          pen: '753951826',
          localID: '7458',
          legalName: 'ROSE, ADAM',
          usualName: null,
          type: 'Warning'
        },
        {
          pen: '147321596',
          localID: '9654',
          legalName: 'SHARPE, MICHAEL',
          usualName: null,
          type: 'Warning'
        },
        {
          pen: '789258741',
          localID: '4018',
          legalName: 'WILSON, FRANK',
          usualName: null,
          type: 'Warning'
        },
      ],
      loading: true,
      totalItems: 0
    };
  },
  methods: {
    next() {
      this.$emit('next');
    },
    getIssueIcon(issue) {
      switch (issue.type) {
      case 'Error':
        return 'mdi-alert-circle-outline';
      case 'Warning':
        return 'mdi-alert-outline';
      default:
        return '';
      }
    },
    getIssueIconColor(issue) {
      switch (issue.type) {
      case 'Error':
        return '#d90606';
      case 'Warning':
        return '#2196F3';
      default:
        return '';
      }
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
     padding: 20px;
     margin-bottom: 2em;
 }

  @media screen and (max-width: 1200px) {
    .containerSetup{
      padding-right: 3em !important;
      padding-left: 3em !important;
    }
  }

 :deep(.v-data-table-footer__items-per-page) {
     display: none;
 }

 .hoverTable:hover{
     background-color: #e8e8e8;
     cursor: pointer;
 }

 .headerVal{
    color: #7f7f7f;
 }

 .tableItemVal{
     font-size: small;
 }
</style>




