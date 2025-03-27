<template>
  <a
    :class="{ 'disabled-link': loading }"
    @click="handleClick"
  >
    <template v-if="loading">
      <v-progress-circular
        size="20"
        indeterminate
        color="primary"
        class="mr-1"
      />
    </template>
    <template v-else>
      <v-icon
        :icon="icon"
        class="mr-1"
      />
    </template>
    {{ label }}
  </a>
</template>

<script>
export default {
  name: 'DownloadLink',
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: 'mdi-download'
    },
    downloadAction: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      loading: false
    };
  },
  methods: {
    async handleClick() {
      if (this.loading) return;
      this.loading = true;
      try {
        await this.downloadAction();
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.disabled-link {
  pointer-events: none;
  opacity: 0.6;
}
</style>
