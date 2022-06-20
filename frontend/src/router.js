import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';

import moment from 'moment';

import Home from '@/components/Home.vue';
import Logout from './components/Logout';
import UserActivationLinkError from './components/UserActivationLinkError';
import SessionExpired from './components/SessionExpired';
import ErrorPage from '@/components/ErrorPage.vue';
import LoginError from '@/components/LoginError.vue';
import authStore from './store/modules/auth';
import store from './store/index';
import Login from '@/components/Login.vue';
import BackendSessionExpired from '@/components/BackendSessionExpired';
import {PAGE_TITLES} from '@/utils/constants';
import MessageDisplay from './components/SecureExchange/MessageDisplay';
import ExchangePage from './components/SecureExchange/ExchangeInbox';
import NewMessagePage from './components/SecureExchange/NewMessagePage';
import RouterView from './components/RouterView';
import ActivateEdxAccount from '@/components/common/ActivateEdxAccount';
import AccessUsersPage from '@/components/SecureExchange/AccessUsersPage';

Vue.prototype.moment = moment;

Vue.use(VueRouter);
Vue.use(VueMeta);
// a comment for commit.
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        pageTitle: PAGE_TITLES.DASHBOARD,
        requiresAuth: true
      },

    },
    {
      path: '/error',
      name: 'error',
      component: ErrorPage
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    },
    {
      path: '/session-expired',
      name: 'session-expired',
      component: SessionExpired
    },
    {
      path: '/login-error',
      name: 'login-error',
      component: LoginError
    },
    {
      path: '/activation-error',
      name: 'activation-error',
      component: UserActivationLinkError
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/user-activation',
      name: 'User Activation',
      component: ActivateEdxAccount,
      meta: {
        pageTitle: PAGE_TITLES.ACTIVATE_USER,
        requiresAuth: true
      },
    },
    {
      path: '/access',
      name: 'exchangeAccess',
      component: AccessUsersPage,
      props: { mincode: '00899178' },
      meta: {
        pageTitle: PAGE_TITLES.EXCHANGE_USERS,
        requiresAuth: true,
        role: 'EXCHANGE_ACCESS_ROLE'
      }
    },
    {
      path: '*',
      name: 'notfound',
      redirect: '/',
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/token-expired',
      name: 'backend-session-expired',
      component: BackendSessionExpired
    },
    {
      path: '/',
      component: RouterView,
      children: [
        {
          path: 'inbox',
          name: 'inbox',
          component: ExchangePage,
          meta: {
            pageTitle: PAGE_TITLES.EXCHANGE,
            requiresAuth: true,
            role: '*'
          }
        },
        {
          path: 'exchange/:secureExchangeID',
          name: 'viewExchange',
          component: MessageDisplay,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.VIEW_EXCHANGE,
            requiresAuth: true,
            role: '*'
          }
        },
        {
          path: 'newExchange',
          name: 'newExchange',
          component: NewMessagePage,
          meta: {
            pageTitle: PAGE_TITLES.NEW_EXCHANGE,
            requiresAuth: true,
            role: '*'
          }
        }
      ]
    },

  ]
});

router.beforeEach((to, _from, next) => {
  // this section is to set page title in vue store
  if (to && to.meta) {
    store.commit('app/setPageTitle',to.meta.pageTitle);
  } else {
    store.commit('app/setPageTitle','');
  }
  if (to.meta.requiresAuth && authStore.state.isAuthenticated) {
    store.dispatch('auth/getJwtToken').then(() => {
      if (!authStore.state.isAuthenticated) {
        next('/token-expired');
      } else {
        store.dispatch('auth/getUserInfo').then(() => {
          next();
        }).catch(() => {
          next('error');
        });
      }
    }).catch(() => {
      next('/token-expired');
    });
  }
  else{
    next();
  }
});
export default router;
