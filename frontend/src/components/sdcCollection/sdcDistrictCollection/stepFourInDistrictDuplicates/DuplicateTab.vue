<template>
  <v-row class="mt-3 mb-3 pl-3">
    <v-btn-toggle
      v-model="duplicateView"
      color="#003366"
      rounded="0"
      :divided="true"
    >
      <v-btn
        :id="'nonAllowable' + duplicateType + 'Button'"
        value="1"
        size="large"
        class="duplicate-type-button"
      >
        Non-Allowable ({{ nonAllowableDuplicates.length }})
      </v-btn>
      <v-btn
        v-if="allowableDuplicates"
        id="allowableButton"
        value="2"
        size="large"
        class="duplicate-type-button"
      >
        Allowable ({{ allowableDuplicates.length }})
      </v-btn>
      <v-btn
        :id="'resolved' + duplicateType + 'Button'"
        value="3"
        size="large"
        class="duplicate-type-button"
      >
        Resolved ({{ resolvedDuplicates.length }})
      </v-btn>
    </v-btn-toggle>
  </v-row>
  <template v-if="duplicateView==='1'">
    <strong>Duplicate Students Found: {{ nonAllowableDuplicates.length }}</strong>
    <v-row
      v-for="duplicate in nonAllowableDuplicates"
      :key="duplicate.sdcDuplicateID"
      class="pt-4"
      no-gutters
    >
      <v-col class="pa-0">
        <v-row no-gutters>
          <v-col class="pb-2">
            <v-chip color="primary">
              <v-col>Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}</v-col>
              <v-col
                v-if="duplicateType==='enrollment'"
              >
                Error: {{ duplicate.duplicateErrorDescriptionCode }}
              </v-col>
              <v-col v-else>
                Duplicate Program: {{ duplicate.programDuplicateTypeCodeDescription }}
              </v-col>
            </v-chip>
          </v-col>
        </v-row>
        <CustomTable
          :headers="IN_DISTRICT_DUPLICATES.nonAllowableTableHeaders"
          :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
          :is-loading="false"
          :reset="false"
          :total-elements="2"
          :hide-pagination="true"
        >
          <template #resolution="{ sdcSchoolCollectionStudent }">
            <v-menu
              v-model="editOptionsOpen[sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate.sdcDuplicateID]"
              transition="fab-transition"
              location="end"
              offset="10"
            >
              <template #activator="{ props }">
                <v-btn
                  :id="'resolve' + duplicateType +'MenuBtn' + sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate.sdcDuplicateID"
                  color="primary"
                  icon="mdi-playlist-edit"
                  variant="text"
                  v-bind="props"
                />
              </template>
              <v-list>
                <v-list-item v-if="sdcSchoolCollectionStudent.canChangeGrade">
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-pencil
                  </v-icon>
                  <span class="ml-2">Change Grade</span>
                </v-list-item>
                <v-list-item 
                  id="resolve"
                  @click="resolveDuplicate(duplicate)"
                  >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-check
                  </v-icon>
                  <span class="ml-2">Resolve</span>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </CustomTable>
      </v-col>
    </v-row>
    <v-row
      v-if="nonAllowableDuplicates.length === 0"
      class="pt-4"
      no-gutters
    >
      <v-alert
        :id="duplicateType + 'non-allowable-alert'"
        density="compact"
        type="success"
        variant="tonal"
        text="Congratulations! There are no non-allowable duplicates."
      />
    </v-row>
  </template>
  <template v-if="duplicateView==='2'">
    <strong>Duplicate Students Found: {{ allowableDuplicates.length }}</strong>
    <v-row
      v-for="duplicate in allowableDuplicates"
      :key="duplicate.sdcDuplicateID"
      class="pt-4"
      no-gutters
    >
      <v-col class="pa-0">
        <v-row no-gutters>
          <v-col class="pb-2">
            <v-chip color="primary">
              <v-col>
                Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}
              </v-col>
            </v-chip>
          </v-col>
        </v-row>
        <CustomTable
          :headers="IN_DISTRICT_DUPLICATES.allowableTableHeaders"
          :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
          :is-loading="false"
          :reset="false"
          :total-elements="2"
          :hide-pagination="true"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="allowableDuplicates.length === 0"
      class="pt-4"
      no-gutters
    >
      <v-alert
        :id="duplicateType + 'allowable-alert'"
        density="compact"
        type="info"
        variant="tonal"
        text="There are no allowable duplicates."
      />
    </v-row>
  </template>
  <template v-if="duplicateView==='3'">
    <strong>Duplicate Students Found: {{ resolvedDuplicates.length }}</strong>
    <v-row
      v-for="duplicate in resolvedDuplicates"
      :key="duplicate.sdcDuplicateID"
      class="pt-4"
      no-gutters
    >
      <v-col class="pa-0">
        <v-row no-gutters>
          <v-col class="pb-2">
            <v-chip color="primary">
              <v-col>
                Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}
              </v-col>
            </v-chip>
          </v-col>
        </v-row>
        <CustomTable
          :headers="IN_DISTRICT_DUPLICATES.resolvedTableHeaders"
          :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
          :is-loading="false"
          :reset="false"
          :total-elements="2"
          :hide-pagination="true"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="resolvedDuplicates.length === 0"
      class="pt-4"
      no-gutters
    >
      <v-alert
        :id="duplicateType + 'resolved-alert'"
        density="compact"
        type="info"
        variant="tonal"
        text="There are no resolved duplicates."
      />
    </v-row>
  </template>
  <v-bottom-sheet
    v-model="openProgramResolutionView"
   
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
  <ProgramDuplicateResolution 
    :selectedProgramDuplicate="selectedProgramDuplicate"
    @close="openProgramResolutionView = !openProgramResolutionView"
    @close-refresh="closeAndRefreshDuplicates()"
    >
  </ProgramDuplicateResolution>
  </v-bottom-sheet>
</template>
<script>
import {defineComponent} from 'vue';
import CustomTable from '../../../common/CustomTable.vue';
import {IN_DISTRICT_DUPLICATES} from '../../../../utils/sdc/DistrictCollectionTableConfiguration';
import ProgramDuplicateResolution from './ProgramDuplicateResolution.vue';

export default defineComponent({
  name: 'DuplicateTab',
  components: { 
    CustomTable, 
    ProgramDuplicateResolution
  },
  props: {
    duplicateType: {
      type: String,
      required: true
    },
    nonAllowableDuplicates: {
      type: Array,
      required: true
    },
    allowableDuplicates: {
      type: Array,
      default: null
    },
    resolvedDuplicates: {
      type: Array,
      required: true
    }
  },
  emits:['refresh-duplicates'],
  data() {
    return {
      duplicateView: '1',
      editOptionsOpen: [],
      openProgramResolutionView: false,
      selectedProgramDuplicate: {}
    };
  },
  computed: {
    IN_DISTRICT_DUPLICATES() {
      return IN_DISTRICT_DUPLICATES;
    }
  },
  methods: {
    resolveDuplicate(duplicate) {
      if(this.duplicateType === 'program') {
        this.selectedProgramDuplicate = duplicate;
        this.openProgramResolutionView = !this.openProgramResolutionView;
      }
    },
    closeAndRefreshDuplicates() {
      this.openProgramResolutionView = !this.openProgramResolutionView;
      this.$emit('refresh-duplicates');
    }
  }
});
</script>
<style scoped>
.duplicate-type-button {
  border: 1px solid lightgray;
}
</style>
