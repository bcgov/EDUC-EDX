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
import Unauthorized from '@/components/common/Unauthorized.vue';
import authStore from './store/modules/auth';
import store from './store/index';
import Login from '@/components/Login.vue';
import BackendSessionExpired from '@/components/BackendSessionExpired';
import {PAGE_TITLES} from '@/utils/constants';
import MessageDisplay from './components/SecureExchange/MessageDisplay';
import ExchangePage from './components/SecureExchange/ExchangeInbox';
import NewMessagePage from './components/SecureExchange/NewMessagePage';
import RouterView from './components/RouterView';
import AccessUsersPage from '@/components/SecureExchange/AccessUsersPage';
import InstituteSelection from '@/components/InstituteSelection.vue';
import NewUserInvitePage from '@/components/SecureExchange/NewUserPage';
import ActivateEdxUserAccount from '@/components/common/ActivateEdxUserAccount';


Vue.prototype.moment = moment;

Vue.use(VueRouter);
Vue.use(VueMeta);
// a comment for commit.
const excludeInstituteNameFromPageTitleList=[PAGE_TITLES.SELECTION, PAGE_TITLES.ACTIVATE_USER];
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
        requiresAuth: true,
        permission: 'SECURE_EXCHANGE'
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
      path: '/unauthorized',
      name: 'unauthorized',
      component: Unauthorized,
      meta: {
        requiresAuth: false
      }
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
      path: '/institute-selection',
      name: 'institute-selection',
      component: InstituteSelection,
      meta: {
        pageTitle: PAGE_TITLES.SELECTION,
        requiresAuth: true
      }
    },
    {
      path: '/activation-error',
      name: 'activation-error',
      component: UserActivationLinkError
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        pageTitle: PAGE_TITLES.LOGIN,
        requiresAuth: false
      }
    },
    {
      path: '/user-activation',
      name: 'User Activation',
      component: ActivateEdxUserAccount,
      props: {
        instituteTypeLabel: 'School',
        instituteTypeCode: 'SCHOOL',
        instituteIdentifierLabel: 'Mincode'
      },
      meta: {
        pageTitle: PAGE_TITLES.ACTIVATE_USER,
        requiresAuth: true
      },
    },
    {
      path: '/district-user-activation',
      name: 'District User Activation',
      component: ActivateEdxUserAccount,
      props: {
        instituteTypeLabel: 'District',
        instituteTypeCode: 'DISTRICT',
        instituteIdentifierLabel: 'Number'
      },
      meta: {
        pageTitle: PAGE_TITLES.ACTIVATE_USER,
        requiresAuth: true
      },
    },
    {
      path: '/access',
      name: 'exchangeAccess',
      component: AccessUsersPage,
      meta: {
        pageTitle: PAGE_TITLES.EXCHANGE_USERS,
        requiresAuth: true,
        permission: 'EDX_USER_SCHOOL_ADMIN'
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
            permission: 'SECURE_EXCHANGE'
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
            permission: 'SECURE_EXCHANGE'
          }
        },
        {
          path: 'newExchange',
          name: 'newExchange',
          component: NewMessagePage,
          meta: {
            pageTitle: PAGE_TITLES.NEW_EXCHANGE,
            requiresAuth: true,
            permission: 'SECURE_EXCHANGE'
          }
        },
        {
          path: 'newUserInvite',
          name: 'newUserInvite',
          component: NewUserInvitePage,
          meta: {
            pageTitle: PAGE_TITLES.NEW_USER_INVITE,
            requiresAuth: true,
            permission: 'SECURE_EXCHANGE'
          }
        }
      ]
    },

  ]
});

router.beforeEach((to, _from, next) => {
  // this section is to set page title in vue store
  if (to.meta.requiresAuth) {
    store.dispatch('auth/getJwtToken').then(() => {
      if (!authStore.state.isAuthenticated) {
        next('/token-expired');
      } else {
        store.dispatch('auth/getUserInfo').then(() => {
          if (to.meta.permission && authStore.state.userInfo?.userMinCodes?.length > 0 && (!authStore.state.userInfo.hasOwnProperty('activeInstitutePermissions') || authStore.state.userInfo.activeInstitutePermissions.filter(perm => perm === to.meta.permission).length < 1)) {
            next('/institute-selection');
          }else if (to.meta.permission && (!authStore.state.userInfo.hasOwnProperty('activeInstitutePermissions') || authStore.state.userInfo.activeInstitutePermissions.filter(perm => perm === to.meta.permission).length < 1)) {
            next('/unauthorized');
          }else if (to && to.meta) {
            if(authStore.state.userInfo.activeInstituteTitle && !excludeInstituteNameFromPageTitleList.includes(to.meta.pageTitle)){
              store.commit('app/setPageTitle',to.meta.pageTitle + ' | ' + authStore.state.userInfo.activeInstituteTitle);
            }else{
              store.commit('app/setPageTitle',to.meta.pageTitle);
            }
          }
          next();
        }).catch(() => {
          next('error');
        });
      }
    }).catch(() => {
      if (!authStore.state.userInfo) {
        next('/login');
      }else{
        next('/token-expired');
      }
    });
  }
  else{
    if (!authStore.state.userInfo) {
      next();
    }
    if (to && to.meta) {
      store.commit('app/setPageTitle',to.meta.pageTitle);
    } else {
      store.commit('app/setPageTitle','');
    }
    next();
  }
});
export default router;
