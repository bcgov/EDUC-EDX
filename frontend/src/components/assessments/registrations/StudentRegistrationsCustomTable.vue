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
            <div v-if="column.title === 'select'">
              <v-checkbox
                v-model="allSelected"
                :indeterminate="!allSelected && selected.length > 0"
                hide-details="true"
              />
            </div>
            <div v-if="column.title !== 'select'">
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
          :style="{background: activeSession.sessionID === props.item['sessionID'] && activeSession.assessmentRegistrationsExportDate !== null && props.item['downloadDate'] === null ? 'lightgoldenrodyellow' : 'white'}"
          @click="rowClicked(props.item)"
        >
          <td
            v-for="column in headers"
            :key="column.key"
            class="td-data"
          >
            <v-checkbox
              v-if="column.title === 'select'"
              v-model="selected"
              :value="props.item"
              hide-details="true"
              @click.stop
            />
            <span v-if="column.key === 'alert'">
              <span v-if="activeSession.sessionID === props.item['sessionID'] && activeSession.assessmentRegistrationsExportDate !== null && props.item['downloadDate'] === null">
                <v-tooltip text="Registration not transferred to e-Assessments System.">
                  <template #activator="{ props: tooltipProps }">
                    <v-icon
                      icon="mdi-alert-outline"
                      v-bind="tooltipProps"
                      color="warning"
                    />
                  </template>
                </v-tooltip>
              </span>
            </span>
            <span v-else-if="column.key === 'session'">
              {{ props.item['courseYear'] }}/{{ props.item['courseMonth'] }}
            </span>
            <span v-else-if="column.key === 'name'">
              {{ props.item['surname'] }}, {{ props.item['givenName'] }}
            </span>
            <span v-else-if="props.item[column.key]">{{ props.item[column.key] }}</span>
            <span v-else-if="column.key === 'select'" />
            <span v-else>-</span>
          </td>
        </tr>
      </template>
      <template #bottom>
        <div class="pagination-controls">
          <v-btn
            icon
            :disabled="!canLoadPrevious || isLoading"
            @click="$emit('loadPrevious')"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            icon
            :disabled="!canLoadNext || isLoading"
            @click="$emit('loadNext')"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>

<script>

import { mapState } from 'pinia';
import {authStore} from '../../../store/modules/auth';
import {appStore} from '../../../store/modules/app';
import {displayName} from '../../../utils/format';

export default {
  name: 'StudentRegistrationsCustomTable',
  components: {},
  props: {
    headers: {
      type: Array,
      required: true,
      default: null,
    },
    data: {
      type: Array,
      required: true,
      default: null,
    },
    selectedRows: {
      type: Array,
      required: true,
      default: null,
    },
    hidePagination: {
      type: Boolean,
      default: false,
    },
    totalElements: {
      type: Number,
      required: true,
      default: 0,
    },
    isLoading: {
      type: Boolean,
      required: true,
      default: false,
    },
    canLoadNext: {
      type: Boolean,
      required: true,
      default: false,
    },
    canLoadPrevious: {
      type: Boolean,
      required: true,
      default: false,
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    activeSession: {
      type: Object,
      required: true,
      default: null
    },
  },
  emits: [ 'reload-registrations', 'editSelectedRow', 'loadPrevious', 'loadNext', 'selected-rows-changed'],
  data() {
    return {
      pageNumber: 1,
      pageSize: 15,
      loading: true,
      edxURL: null,
      user: null
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
    selected: {
      get() {
        if (this.selectedRows === null) {
          return [];
        }
        return this.selectedRows;
      },
      set(newSelectedRows) {
        this.$emit('selected-rows-changed', newSelectedRows);
      }
    },
    allSelected: {
      get() {
        if (this.data.length <= 0) {
          return false;
        }
        return this.data.length === this.selected.length;
      },
      set(allSelected) {
        if (allSelected) {
          this.selected = [...this.data];
        } else {
          this.selected = [];
        }
      }
    }
  },
  watch: {
    pageNumber(val) {
      if (val) {
        this.$emit('reload-registrations', { pageNumber: val });
      }
    }
  },
  created() {
    appStore()
      .getConfig()
      .then(() => {
        this.edxURL = this.config.EDX_URL;
      });
    authStore()
      .getUserInfo()
      .then(() => {
        this.user = this.userInfo;
      });
  },
  methods: {
    rowClicked(props) {
      this.$emit('editSelectedRow', props);
    },
    displayName,
  },
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

.pagination-controls {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 0.5rem;
  padding-bottom: 0.2rem;
  padding-top: 1rem;
}
</style>
