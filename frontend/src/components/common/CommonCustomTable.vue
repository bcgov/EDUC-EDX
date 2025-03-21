<template>
  <div>
    <v-data-table-server
      v-model:page.sync="pageNumber"
      v-model:items-per-page.sync="pageSize"
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
            <div>
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
            <span v-if="column.key === 'resolution'">
              <slot
                :student="props.item"
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

export default {
  name: 'CommonCustomTable',
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
  },
  emits: ['reload'],
  data() {
    return {
      pageSize: 15,
      pageNumber: 1,
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
    reset: {
      handler() {
        this.pageNumber = 1;
      },
      immediate: true
    }
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

.school-router{
  color: #003366;
}

.valueIsDiff{
  color: green;
}

.school-router:hover{
  text-decoration: underline;
}
</style>
