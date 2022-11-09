import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
import App from './App';
import router from './router';
import store from './store';

/**
* The globalThis.regeneratorRuntime = undefined addresses a potentially unsafe-eval problem
* Source: https://github.com/facebook/regenerator/issues/378#issuecomment-802628326
* Date: July 14, 2021
 * eslint-disable to stop complaint that globalThis does not exist. It exists since Node 12 and we are using Node 14
*/
/* eslint-disable */
globalThis.regeneratorRuntime = undefined;

Vue.config.productionTip = false;
new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app');
