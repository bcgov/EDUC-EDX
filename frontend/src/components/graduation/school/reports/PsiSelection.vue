<template>
  <v-container fluid>
    <v-row class="mb-1">
      <v-col>
        The report shows all students in the final (grade 12 or AD) of an active program and any transcript orders sent by the student to a PSI during the current reporting period (October 1st to September 30th).
      </v-col>
    </v-row>
    <DownloadLink
      :label="'PSI Selections Report ' + currentYearRange"
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
      currentYearRange: '',
      isLoading: false
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
  },
  created() {
    this.populateYearFields();
  },
  methods: {
    populateYearFields() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      let startingYear = null;
      
      if (currentMonth < 10) {
        startingYear = currentYear - 1;
      } else {
        startingYear = currentYear;
      }
      let endingYear = startingYear + 1;
      this.currentYearRange = startingYear + '/' + endingYear;
    },
    async downloadPsiReport() {
      this.isLoading = true;
      const url = `${ApiRoutes.psiSelection.REPORT}/school/${this.schoolID}`;

      try {
        const res = await ApiService.apiAxios.get(url, {
          responseType: 'blob'
        });

        let filename = 'PSI Selection Report.csv';
        const dispo = res.headers?.['content-disposition'] || res.headers?.['Content-Disposition'];
        if (dispo) {
          const m = dispo.match(/filename\*?=(?:UTF-8''|")(.*?)(?:"|;|$)/i);
          if (m?.[1]) filename = decodeURIComponent(m[1]);
        }

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
