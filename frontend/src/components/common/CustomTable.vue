<template>
  <div>
    <v-data-table-server
      v-model:page.sync="pageNumber"
      v-model:items-per-page.sync="pageSize"
      v-model="selected"
      :items-length="totalElements"
      :items="data"
      :headers="headers"
      class="mt-2"
      mobile-breakpoint="0"
    >
      <template #top>
        <v-progress-linear
          v-show="isLoading"
          :indeterminate="true"
          color="primary"
        />
      </template>
      <template #headers>
        <tr class="header-row">
          <th
            v-for="column in headers"
            id="header"
            :key="column.key"
          >
            <div v-if="column.title === 'select'">
                <v-checkbox
                  v-model="masterCheckbox"
                  :indeterminate="selected.length > 0 && !isAllSelected()"
                  hide-details="true"
                  @change="toggle()"
                />
            </div>
            <div v-else>
              <div class="header-text">
                {{ column.title }}
              </div>
              <div
                v-if="column.hasOwnProperty('subHeader')"
                class="header-text"
              >
                {{ column.subHeader.title }}
              </div>
            </div>
          </th>
        </tr>
      </template>
      <template #item="props">
        <tr
          class="hoverTable"
          @click="rowclicked(props.item.raw)"
        >
          <td
            v-for="column in headers"
            :key="column.key"
            class="td-data"
          >
            <v-checkbox
              v-if="column.title === 'select'"
              :model-value="isSelected(props.item.raw) !== undefined"
              hide-details="true"
              @click.prevent.stop="onClick(props)"
            />
            <v-icon
              v-else-if="column.key === 'sdcSchoolCollectionStudentStatusCode'"
              size="25"
              :color="getSdcStudentStatusIconColor(props.item.raw['sdcSchoolCollectionStudentStatusCode'])"
            >
              {{ getSdcStudentIssueIcon(props.item.raw['sdcSchoolCollectionStudentStatusCode']) }}
            </v-icon>
            <div v-else>
              <span v-if="column.key === 'legalName'">
                {{ displayName(props.item.raw['legalFirstName'], props.item.raw['legalMiddleNames'], props.item.raw['legalLastName']) }}
              </span>

              <div v-else-if="column.key === 'isAdult'">
                <span v-if="props.item.raw['isAdult'] !== null || props.item.raw['isAdult' !== undefined]">{{ props.item.raw['isAdult'] === "true" ? 'Yes' : 'No' }}</span>
              </div>

              <div v-else-if="column.key === 'fte'">
                <span>{{ props.item.raw['fte'] === 0 ? 0 : props.item.raw['fte'] }}</span>
              </div>
              <div v-else-if="column.key === 'mappedIndigenousEnrolledProgram'">
                <span
                  v-for="(progs, idx) in props.item.raw[column.key].split(',')"
                  :key="idx"
                >
                  <div>{{ progs }}</div>
                </span>
              </div>
              <span v-else-if="props.item.raw[column.key]">{{ props.item.raw[column.key] }}</span>
              <span v-else>-</span>

              <div v-if="column.hasOwnProperty('subHeader')">
                <div v-if="column.subHeader.key === 'usualName'">
                  <span v-if="props.item.raw['usualLastName'] || props.item.raw['usualFirstName'] || props.item.raw['usualMiddleNames']">
                    {{ displayName(props.item.raw['usualFirstName'], props.item.raw['usualMiddleNames'], props.item.raw['usualLastName']) }}
                  </span>
                  <span v-else>-</span>
                </div>
                <div v-else-if="column.subHeader.key === 'isGraduated'">
                  <span v-if="props.item.raw['isGraduated'] !== null || props.item.raw['isGraduated'] !== undefined">{{ props.item.raw['isGraduated'] === "true" ? 'Yes' :'No' }}</span>
                </div>
                <span v-else-if="props.item.raw[column.subHeader.key]">{{ props.item.raw[column.subHeader.key] }}</span>
                <span v-else>-</span>
              </div>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table-server>
  </div>
</template>

<script>

export default {
  name: 'CustomTable',
  components: {

  },
  mixins: [],
  props: {
    headers: {
      type: Array,
      required: true,
      default: null
    },
    data: {
      type: Array,
      required: true,
      default: null
    },
    totalElements: {
      type: Number,
      required: true,
      default: 0
    },
    isLoading: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  emits: ['reload', 'editSelectedRow', 'selections'],
  data() {
    return {
      selected: [],
      pageNumber: 1,
      pageSize: 15,
      masterCheckbox: false,
      loading: true
    };
  },
  computed: {
  },
  watch: {
    pageNumber: {
      handler(val) {
        if(val) {
          this.$emit('reload', {pageNumber: val});
        }
      },
      immediate: true
    },
    selected: {
      handler(val) {
        if(val) {
          this.$emit('selections', this.selected);
        }
      },
      deep: true
    }
  },
  created() {

  },
  methods: {
    rowclicked(props) {
      this.$emit('editSelectedRow', props);
    },
    onClick(prop) {
      let selectedValue = prop.item.raw;
      if(this.isSelected(selectedValue)) {
        this.selected.splice(this.selected.findIndex(value => value.sdcSchoolCollectionStudentID === selectedValue.sdcSchoolCollectionStudentID), 1);
      } else {
        this.selected.push(prop.item.raw);
      }
      this.masterCheckbox = this.selected.length > 0 && this.isAllSelected();
    },
    isSelected(selectedValue) {
      return this.selected.find(value => value.sdcSchoolCollectionStudentID === selectedValue.sdcSchoolCollectionStudentID);
    },
    isAllSelected() {
      const numSelected = this.selected.length;
      const totalRows = this.data.length;
      return numSelected === totalRows;
    },
    toggle() {
      if(this.selected.length !== 0 || this.isAllSelected()) {
        this.selected.splice(0);
      } else {
        this.selected = [...this.data];
      }
      this.masterCheckbox = this.selected.length > 0 && this.isAllSelected();
    },
    getSdcStudentStatusIconColor(status) {
      if (status === 'FUNDWARN') {
        return '#ff9800';
      }
      else if (status === 'INFOWARN') {
        return '#2196F3';
      }
    },
    getSdcStudentIssueIcon(status) {
      if (status === 'FUNDWARN') {
        return 'mdi-alert-outline';
      }
      else if (status === 'INFOWARN') {
        return 'mdi-alert-circle-outline';
      }
    },
    displayName(first, middle, last) {
      let name = '';
      if (last) {
        name += last;
      }

      if (first && last) {
        name +=  `, ${first}` ;
      } else if (first) {
        name += first;
      }

      if ((first && middle) || (last && middle)) {
        name += ` (${middle})`;
      } else if (middle) {
        name += `(${middle})`;
      }

      return name;
    }
  }
};
</script>

<style scoped>
.header-text {
  color: #7f7f7f;
}

 .header-row {
    border-bottom-style: groove;
    border-bottom-color: rgb(255 255 255 / 45%);
    vertical-align: top !important;
 }

 :deep(.v-data-table-footer__items-per-page) {
       display: none;
 }

 tr:hover td {
  background-color: #e8e8e8 !important;
  cursor: pointer;
}
</style>
