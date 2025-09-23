<template>
  <v-container fluid>
    hello from PSI Selection
    <DownloadLink
      label="PSI Report"
      :download-action="() => downloadPsiReport()"
    />
  </v-container>
</template>

<script>
import DownloadLink from '../../../common/DownloadLink.vue';
import { mapState } from 'pinia';
import { authStore } from '../../../../store/modules/auth';
import alertMixin from '../../../../mixins/alertMixin';
import {ApiRoutes} from '../../../../utils/constants';
import ApiService from '../../../../common/apiService';

export default {
  name: 'PsiSelection',
  components: { DownloadLink },
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
    async downloadPsiReport() {
      this.isLoading = true;
      const url = `${ApiRoutes.psiSelection.REPORT}/school/${this.schoolID}`;

      try {
        const res = await ApiService.apiAxios.get(url, {
          responseType: 'blob'
        });

        const filename = 'psi-selection.csv';

        const urlObj = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = urlObj;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(urlObj);
      } catch (error) {
        console.error('Error downloading file:', error);
        let errorMsg;

        if (error.code === 'ERR_BAD_REQUEST') {
          errorMsg = `PSI report not found for ${this.schoolID}`;
        } else {
          errorMsg = 'Error encountered while attempting to retrieve PSI report.';
        }

        this.setFailureAlert(errorMsg);
      } finally {
        this.isLoading = false;
      }
    }
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
