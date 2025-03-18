<template>
  <v-row class="align-center searchBox">
    <v-col
      cols="12"
      md="4"
      lg="4"
      class="d-flex justify-start"
    >
      <v-autocomplete
        id="school-code-name-filter"
        v-model="schoolCodeNameFilter"
        label="School Code & Name"
        variant="underlined"
        item-value="schoolID"
        item-title="schoolCodeName"
        autocomplete="off"
        :items="items"
        clearable
        @update:model-value="handleUpdate"
      >
        <template #prepend-inner>
          <v-icon
            v-if="schoolCodeNameFilter"
            :color="getStatusColorAuthorityOrSchool(items.find(item=>item.schoolID===schoolCodeNameFilter)?.status)"
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
    </v-col>
  </v-row>
</template>

<script>
import {getStatusColorAuthorityOrSchool} from '../../utils/institute/status';

export default {
  name: 'SchoolCodeNameFilter',
  props: {
    modelValue: {
      type: [String, Number, Object],
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'search'],
  computed: {
    schoolCodeNameFilter: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      }
    }
  },
  methods: {
    getStatusColorAuthorityOrSchool,
    handleUpdate(value) {
      this.$emit('search', value);
    },
  },
};
</script>
