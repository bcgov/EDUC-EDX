<template>
  <v-autocomplete
    id="school-code-name-filter"
    v-model="schoolCodeNameFilter"
    label="School Code & Name"
    variant="underlined"
    item-value="schoolID"
    item-title="schoolCodeName"
    autocomplete="off"
    :items="schoolSearchNames"
    clearable
    @update:model-value="handleUpdate"
  >
    <template #prepend-inner>
      <v-icon
        v-if="schoolCodeNameFilter"
        :color="getStatusColorAuthorityOrSchool(schoolSearchNames.find(school=>school.schoolID===schoolCodeNameFilter)?.status)"
      >
        mdi-circle-medium
      </v-icon>
    </template>
    <template #item="{ props, item }">
      <v-list-item
        v-bind="props"
        prepend-icon="mdi-circle-medium"
        :base-color="getStatusColorAuthorityOrSchool(item.raw.status)"
        title=""
      >
        <v-list-item-title style="color: black !important;">
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import {getStatusAuthorityOrSchool, getStatusColorAuthorityOrSchool} from '../../utils/institute/status';
import {mapState} from 'pinia';
import {appStore} from '../../store/modules/app';
import { LocalDateTime } from '@js-joda/core';

export default {
  name: 'SchoolCodeNameFilter',
  props: {
    modelValue: {
      type: [String, Number, Object],
      default: ''
    },
    districtID: {
      type: String,
      required: false,
      default: ''
    },
    collectionObject: {
      type: Object,
      required: false,
      default: null
    }
  },
  emits: ['update:modelValue', 'search'],
  data() {
    return {
      schoolsCacheMap: [],
      schoolSearchNames: []
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap']),

    schoolCodeNameFilter: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      }
    }
  },
  async created() {
    appStore().getInstitutesData().finally(() => {
      this.schoolsCacheMap = this.schoolsMap;
      this.getSchoolDropDownItems();
    });
  },
  methods: {
    getStatusColorAuthorityOrSchool,
    handleUpdate(value) {
      this.$emit('search', value);
    },
    getSchoolDropDownItems() {
      this.schoolSearchNames = [];
      const now = LocalDateTime.now();
      let cutoff = now;

      if (this.collectionObject) {
        const summerStart = LocalDateTime.parse(this.collectionObject.summerStart);
        const schYrEnd = LocalDateTime.parse(this.collectionObject.schYrEnd);
        const summerEnd = LocalDateTime.parse(this.collectionObject.summerEnd);
        cutoff = now.isBefore(summerStart) ? schYrEnd : summerEnd;
      }

      this.schoolsCacheMap.forEach(school => {
        if (school.districtID !== this.districtID) return;
        if (school.schoolCategoryCode !== 'PUBLIC') return;
        if (!school.canIssueTranscripts) return;
        if (!school.effectiveDate) return;

        const openDate = LocalDateTime.parse(school.effectiveDate);
        const endOfCloseDateGraceWindow = school.expiryDate ? LocalDateTime.parse(school.expiryDate).plusMonths(3) : null;

        if (cutoff.isBefore(openDate)) return;
        if (endOfCloseDateGraceWindow && cutoff.isAfter(endOfCloseDateGraceWindow)) return;

        this.schoolSearchNames.push({
          schoolCodeName: `${school.mincode} - ${school.schoolName}`,
          schoolID: school.schoolID,
          status: getStatusAuthorityOrSchool(school)
        });
      });
    },
  },
};
</script>
