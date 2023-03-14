<template>
  <div style="display: none">
    <a
      id="logout_href"
      :href="routes.SESSION_EXPIRED"
    />
  </div>
</template>

<script>
import {AuthRoutes} from '../utils/constants';
import ApiService from '../common/apiService';
import { authStore } from '../store/modules/auth';
import { mapState } from 'pinia';

export default {
  data() {
    return {
      routes: AuthRoutes
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated']),
  },
  async mounted() {
    await this.checkAndLogoutUserOnSessionExpiry();
  },
  methods: {

    async checkAndLogoutUserOnSessionExpiry() {
      if (this.isAuthenticated) {
        try {
          const response = await ApiService.apiAxios
            .get(AuthRoutes.SESSION_REMAINING_TIME);
          if (response.data > 0) {
            const timeOutValue = parseInt(response.data) + 200; // add 200 ms
            setTimeout(() => {
              this.checkAndLogoutUserOnSessionExpiry();
            }, timeOutValue);
          } else {
            window.location = document.getElementById('logout_href').href;
          }
        } catch (e) {
          window.location = document.getElementById('logout_href').href;
        }
      }

    }
  }
};
</script>
