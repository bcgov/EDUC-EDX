import {createRouter, createWebHistory} from 'vue-router';
import Home from './components/Home.vue';
import Logout from './components/Logout.vue';
import UserActivationLinkError from './components/UserActivationLinkError.vue';
import SessionExpired from './components/SessionExpired.vue';
import ErrorPage from './components/ErrorPage.vue';
import LoginError from './components/LoginError.vue';
import Unauthorized from './components/common/Unauthorized.vue';
import {authStore} from './store/modules/auth';
import {appStore} from './store/modules/app';
import Login from './components/Login.vue';
import BackendSessionExpired from './components/BackendSessionExpired.vue';
import {PAGE_TITLES} from './utils/constants';
import MessageDisplay from './components/SecureExchange/MessageDisplay.vue';
import ExchangePage from './components/SecureExchange/ExchangeInbox.vue';
import NewMessagePage from './components/SecureExchange/NewMessagePage.vue';
import RouterView from './components/RouterView.vue';
import AccessSchoolUsersPage from './components/admin/SchoolUsersAccessPage.vue';
import InstituteSelection from './components/InstituteSelection.vue';
import ActivateEdxUserAccount from './components/common/ActivateEdxUserAccount.vue';
import SchoolListPage from './components/school/SchoolList.vue';
import SchoolContactsPage from './components/school/SchoolContacts.vue';
import SchoolDetailsPage from './components/school/SchoolDetails.vue';
import AccessDistrictUsersPage from './components/admin/DistrictUsersAccessPage.vue';
import ViewAllDistrictSchoolUsersPage from './components/admin/ViewAllDistrictSchoolUsersPage.vue';
import DistrictDetails from './components/district/DistrictDetails.vue';
import DistrictContactsPage from './components/district/DistrictContacts.vue';
import SDCCollectionView from './components/sdcCollection/SDCCollectionView.vue';
import StepFourSchoolDetails from './components/sdcCollection/StepFourSchoolDetails.vue';
import StepFiveSchoolContacts from './components/sdcCollection/StepFiveSchoolContacts.vue';
import StepOneUploadData from './components/sdcCollection/StepOneUploadData.vue';
import StepTwoViewDataIssues from './components/sdcCollection/stepTwoValidateData/StepTwoViewDataIssues.vue';
import SDCCollectionSummary from './components/sdcCollection/SDCCollectionSummary.vue';
import StepThreeVerifyData from './components/sdcCollection/stepThreeVerifyData/StepThreeVerifyData.vue';
import InviteSelection from './components/InviteSelection.vue';
import AccessSchoolUsersDetailsPage from './components/admin/SchoolUsersAccessDetailsPage.vue';

// a comment for commit.
const excludeInstituteNameFromPageTitleList=[PAGE_TITLES.SELECTION, PAGE_TITLES.ACTIVATE_USER];
const router = createRouter({
  history: createWebHistory(),
  base: import.meta.env.BASE_URL,
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
      path: '/invite-selection',
      name: 'invite-selection',
      component: InviteSelection,
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
      path: '/schoolAccess',
      name: 'schoolAccess',
      component: AccessSchoolUsersPage,
      meta: {
        pageTitle: PAGE_TITLES.SCHOOL_EXCHANGE_USERS,
        requiresAuth: true,
        permission: 'EDX_USER_SCHOOL_ADMIN'
      }
    },
    {
      path: '/schoolAccessDetail/:schoolID',
      name: 'schoolAccessDetail',
      props: true,
      component: AccessSchoolUsersDetailsPage,
      meta: {
        pageTitle: PAGE_TITLES.SCHOOL_EXCHANGE_USERS,
        requiresAuth: true,
        permission: 'EDX_USER_SCHOOL_ADMIN'
      }
    },
    {
      path: '/districtAccess',
      name: 'districtAccess',
      component: AccessDistrictUsersPage,
      meta: {
        pageTitle: PAGE_TITLES.DISTRICT_EXCHANGE_USERS,
        requiresAuth: true,
        permission: 'EDX_USER_DISTRICT_ADMIN'
      }
    },
    {
      path: '/districtSchools',
      name: 'districtSchools',
      component: ViewAllDistrictSchoolUsersPage,
      meta: {
        pageTitle: PAGE_TITLES.ALL_DISTRICT_SCHOOL_USERS,
        requiresAuth: true,
        permission: 'EDX_USER_DISTRICT_ADMIN'
      }
    },
    {
      path: '/:catchAll(.*)',
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
          path: 'schools',
          name: 'schools',
          component: SchoolListPage,
          meta: {
            pageTitle: PAGE_TITLES.SCHOOLS,
            requiresAuth: true
          }
        },
        {
          path: 'districtDetails/:districtID',
          name: 'districtDetails',
          props: true,
          component: DistrictDetails,
          meta: {
            pageTitle: PAGE_TITLES.DISTRICT_DETAILS,
            requiresAuth: true
          }
        },
        {
          path: 'districtContacts/:districtID',
          name: 'districtContacts',
          component: DistrictContactsPage,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.DISTRICT_CONTACTS,
            requiresAuth: true
          }
        },
        {
          path: 'schoolContacts/:schoolID',
          name: 'schoolContacts',
          component: SchoolContactsPage,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.SCHOOL_CONTACTS,
            requiresAuth: true,
          }
        },
        {
          path: 'schoolDetails/:schoolID',
          name: 'schoolDetails',
          component: SchoolDetailsPage,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.SCHOOL_DETAILS,
            requiresAuth: true,
          }
        },
        {
          path: 'open-collection-summary/:schoolID',
          name: 'sdcCollectionSummary',
          component: SDCCollectionSummary,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.SDC,
            requiresAuth: true,
            permission: 'STUDENT_DATA_COLLECTION'
          },
        },
        {
          path: 'open-collection-details/:schoolCollectionID',
          name: 'sdcCollection',
          component: SDCCollectionView,
          props: true,
          meta: {
            pageTitle: PAGE_TITLES.SDC,
            requiresAuth: true,
            permission: 'STUDENT_DATA_COLLECTION'
          },
          children: [
            {
              path: 'step-1',
              name: 'step-1',
              component: StepOneUploadData,
              meta: {
                pageTitle: PAGE_TITLES.SDC,
                requiresAuth: true,
                permission: 'STUDENT_DATA_COLLECTION'
              },
              props: true
            },
            {
              path: 'step-2',
              name: 'step-2',
              component: StepTwoViewDataIssues,
              meta: {
                pageTitle: PAGE_TITLES.SDC,
                requiresAuth: true,
                permission: 'STUDENT_DATA_COLLECTION'
              }
            },
            {
              path: 'step-3',
              name: 'step-3',
              component: StepThreeVerifyData,
              meta: {
                pageTitle: PAGE_TITLES.SDC,
                requiresAuth: true,
                permission: 'STUDENT_DATA_COLLECTION'
              }
            },
            {
              path: 'step-4',
              name: 'step-4',
              component: StepFourSchoolDetails,
              meta: {
                pageTitle: PAGE_TITLES.SDC,
                requiresAuth: true,
                permission: 'STUDENT_DATA_COLLECTION'
              }
            },
            {
              path: 'step-5',
              name: 'step-5',
              component: StepFiveSchoolContacts,
              meta: {
                pageTitle: PAGE_TITLES.SDC,
                requiresAuth: true,
                permission: 'STUDENT_DATA_COLLECTION'
              }
            }
          ]
        }
      ]
    },

  ]
});

router.beforeEach((to, _from, next) => {
  const aStore = authStore();
  const apStore = appStore();
  // this section is to set page title in vue store
  if (to.meta.requiresAuth) {
    aStore.getJwtToken().then(() => {
      if (!aStore.isAuthenticated) {
        next('/token-expired');
      } else {
        aStore.getUserInfo().then(() => {
          if ((aStore.userInfo?.userSchoolIDs?.length > 0 || aStore.userInfo?.userDistrictIDs?.length > 0) && (!Object.prototype.hasOwnProperty.call(aStore.userInfo,'activeInstitutePermissions'))) {
            if(to.fullPath === '/institute-selection'){
              next();
            }else{
              next('/institute-selection');
            }
          }else if (to.meta.permission && (!Object.prototype.hasOwnProperty.call(aStore.userInfo,'activeInstitutePermissions') || aStore.userInfo.activeInstitutePermissions.filter(perm => perm === to.meta.permission).length < 1)) {
            next('/unauthorized');
          }else if (to && to.meta) {
            if(aStore.userInfo.activeInstituteTitle && !excludeInstituteNameFromPageTitleList.includes(to.meta.pageTitle)){
              apStore.setPageTitle(to.meta.pageTitle + ' | ' + aStore.userInfo.activeInstituteTitle);
            }else{
              apStore.setPageTitle(to.meta.pageTitle);
            }
            next();
          }
        }).catch(() => {
          next('error');
        });
      }
    }).catch(() => {
      if (!aStore.userInfo) {
        next('/login');
      }else{
        next('/token-expired');
      }
    });
  }
  else{
    if (!aStore.userInfo) {
      next();
    }
    if (to && to.meta) {
      apStore.setPageTitle(to.meta.pageTitle);
    } else {
      apStore.setPageTitle('');
    }
    next();
  }
});
export default router;
