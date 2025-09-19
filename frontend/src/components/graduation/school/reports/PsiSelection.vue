<template>
  <v-container fluid>
    hello from PSI Selection
  </v-container>
</template>

<script>
import DownloadLink from '../../../common/DownloadLink.vue';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import { authStore } from '../../../../store/modules/auth';
import alertMixin from '../../../../mixins/alertMixin';

export default {
  name: 'PsiSelection',
  components: { DownloadLink, PrimaryButton },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: [],
  data() {
    return {
      isLoading: false,
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
  },
  async created() {
  },
  methods: {

  },
};
</script>

<style scoped>

h3 {
  color: #38598a;
}

button {
  color: #1976d2;
}

v-text-field{
  width: 4em;
}

ul {
  list-style-type: none;
  padding-top: 1em;
  padding-bottom: 2em;
}

li {
  padding-top: 1em;
}

p {
  padding-top: 1em;
  font-style: italic;
}

i {
  font-size: 1.25em;
}

</style>
