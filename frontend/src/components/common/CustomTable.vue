<template>
  <div>
    <v-data-table-server
      v-model:page.sync="pageNumber"
      v-model:items-per-page.sync="pageSize"
      v-model="selected"
      :items-length="totalElements"
      :items="data"
      :headers="headers"
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
            <div v-if="column.title === 'select' && schoolCollection?.sdcSchoolCollectionStatusCode !== 'SUBMITTED'">
              <v-checkbox
                v-model="masterCheckbox"
                :indeterminate="selected.length > 0 && !isAllSelected()"
                hide-details="true"
                @change="toggle()"
              />
            </div>
            <div v-else-if="column.title === 'PEN'">
              <div class="header-text">
                Assigned PEN
              </div>
              <div
                v-if="column.hasOwnProperty('subHeader')"
                class="header-text"
              >
                {{ column.subHeader.title }}
              </div>
            </div>
            <div v-else-if="column.title !== 'select'">
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
          @click="rowclicked(props.item)"
        >
          <td
            v-for="column in headers"
            :key="column.key"
            class="td-data"
          >
            <v-checkbox
              v-if="column.title === 'select' && schoolCollection?.sdcSchoolCollectionStatusCode !== 'SUBMITTED'"
              :model-value="isSelected(props.item) !== undefined"
              hide-details="true"
              @click.prevent.stop="onClick(props)"
            />
            <v-tooltip
              v-else-if="column.key === 'sdcSchoolCollectionStudentStatusCode'"
              :style="{ display: getSdcStudentStatusHoverText(props.item['sdcSchoolCollectionStudentStatusCode']) ? '' : 'none' }"
            >
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  v-bind="tooltipProps"
                  size="25"
                  :color="getSdcStudentStatusIconColor(props.item['sdcSchoolCollectionStudentStatusCode'])"
                >
                  {{ getSdcStudentIssueIcon(props.item['sdcSchoolCollectionStudentStatusCode']) }}
                </v-icon>
              </template>
              {{ getSdcStudentStatusHoverText(props.item['sdcSchoolCollectionStudentStatusCode']) }}
            </v-tooltip>
            <div v-else>
              <span v-if="column.key === 'studentPen'">
                {{ getAssignedPen(props.item['assignedPen']) }}
              </span>

              <div v-else-if="column.key === 'schoolName' && props.item['sdcSchoolCollectionID']">
                <router-link
                  class="school-router"
                  :to="{ name: 'sdcCollection', params: { schoolCollectionID: props.item['sdcSchoolCollectionID'] }}"
                  target="_blank"
                  @click.stop
                >
                  {{ props.item['schoolName'] }}
                </router-link>
              </div>

              <span v-else-if="column.key === 'legalName'">
                {{ displayName(props.item['legalFirstName'], props.item['legalMiddleNames'], props.item['legalLastName']) }}
              </span>

              <div v-else-if="column.key === 'isAdult'">
                <span v-if="props.item['isAdult'] !== null && props.item['isAdult'] !== undefined">{{ props.item['isAdult'] === "true" ? 'Yes' : 'No' }}</span>
                <span v-else>-</span>
              </div>

              <div v-else-if="column.key === 'fte'">
                <span>{{ props.item['fte'] === 0 ? 0 : props.item['fte'] }}</span>
              </div>
              <div v-else-if="column.key === 'mappedIndigenousEnrolledProgram' || column.key === 'mappedLanguageEnrolledProgram'">
                <template v-if="props.item[column.key]">
                  <span
                    v-for="(progs, idx) in props.item[column.key].split(',')"
                    :key="idx"
                  >
                    <div>{{ progs }}</div>
                  </span>
                </template>
                <template v-else>
                  <div>-</div>
                </template>
              </div>
              <span v-else-if="column.key === 'resolution'">
                <slot
                  :sdc-school-collection-student="props.item"
                  name="resolution"
                >
                  <template v-if="props.item[column.key]">
                    {{ props.item[column.key] }}
                  </template>
                  <template v-else>-</template>
                </slot>
              </span>
              <span v-else-if="props.item[column.key]">{{ props.item[column.key] }}</span>
              <span v-else-if="column.title !== 'select'">-</span>

              <div v-if="column.hasOwnProperty('subHeader')">
                <div v-if="column.subHeader.key === 'usualName'">
                  <span v-if="props.item['usualLastName'] || props.item['usualFirstName'] || props.item['usualMiddleNames']">
                    {{ displayName(props.item['usualFirstName'], props.item['usualMiddleNames'], props.item['usualLastName']) }}
                  </span>
                  <span v-else>-</span>
                </div>
                <div v-else-if="column.subHeader.key === 'isGraduated'">
                  <span v-if="props.item['isGraduated'] !== null && props.item['isGraduated'] !== undefined">{{ props.item['isGraduated'] === "true" ? 'Yes' :'No' }}</span>
                  <span v-else>-</span>
                </div>
                <span v-else-if="props.item[column.subHeader.key]">{{ props.item[column.subHeader.key] }}</span>
                <span v-else>-</span>
              </div>
            </div>
          </td>
        </tr>
      </template>
      <template
        v-if="hidePagination"
        #bottom
      />
    </v-data-table-server>
  </div>
</template>

<script>

import {displayName} from '../../utils/format';

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
    hidePagination: {
      type: Boolean,
      default: false
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
    },
    reset: {
      type: Boolean,
      required: true,
      default: false
    },
    schoolCollection: {
      type: Object,
      required: false,
      default: null
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
    },
    reset: {
      handler(val) {
        if(val) {
          this.masterCheckbox = false;
          this.selected.splice(0);
        }
      },
      immediate: true
    }
  },
  created() {

  },
  methods: {
    rowclicked(props) {
      this.$emit('editSelectedRow', props);
    },
    onClick(prop) {
      let selectedValue = prop.item;
      if(this.isSelected(selectedValue)) {
        this.selected.splice(this.selected.findIndex(value => value.sdcSchoolCollectionStudentID === selectedValue.sdcSchoolCollectionStudentID), 1);
      } else {
        this.selected.push(prop.item);
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
    getSdcStudentStatusHoverText(status) {
      if (status === 'FUNDWARN') {
        return 'Funding Warning';
      } else if (status === 'INFOWARN') {
        return 'Info Warning';
      }
    },
    getAssignedPen(assignedPen) {
      if (assignedPen) {
        return assignedPen;
      } else {
        return 'Under Review';
      }
    },
    displayName
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

.school-router{
  color: #003366;
}

.school-router:hover{
  text-decoration: underline;
}
</style>
