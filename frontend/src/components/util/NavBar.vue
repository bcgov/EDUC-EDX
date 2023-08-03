<template>
  <div class="mb-1">
    <v-navigation-drawer
      v-model="drawer"
      clipped
      app
      color="#E9EBEF"
      :width="navWidth"
      temporary
    >
      <v-list>
        <div
          v-for="(item) in items.filter(obj => obj.authorized)"
          :key="item.title"
        >
          <v-list-item
            v-if="!item.items"
            :id="stripWhitespace(item.title + `MenuBtn`)"
            :key="item.title+`1`"
            class="menuRow"
          >
            <router-link
              :to="item.link"
              :target="item.newTab ? '_blank' : '_self'"

              class="router"
            >
              <v-list-item>
                <v-list-item-title
                  v-if="item.link === $route.name"
                  class="menuItem"
                >
                  <strong>{{ item.title }}</strong>
                </v-list-item-title>
                <v-list-item-title
                  v-else
                  class="menuItem"
                >
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </router-link>
          </v-list-item>
          <v-list-group
            v-else
            :id="stripWhitespace(item.title) + `MenuBtn`"
            :key="item.title"
            no-action
            active-class="active"
            class="groupMenu"
            append-icon=""
            @click="setActive(item)"
          >
            <template #activator="{props}">
              <v-list-item
                v-bind="props"
              >
                <v-list-item-title
                  class="menuItem ml-4"
                  v-text="item.title"
                />
              </v-list-item>
            </template>

            <v-list-item
              v-for="subItem in item.items.filter(obj => obj.authorized)"
              :id="stripWhitespace(subItem.title) + `MenuBtn`"
              :key="subItem.title"
              class="subMenuRow pl-9"
            >
              <router-link
                :to="subItem.link"
                :target="subItem.newTab ? '_blank' : '_self'"
                class="router"
              >
                <v-list-item>
                  <v-list-item-title
                    v-if="subItem.link === $route.name"
                    class="menuItem"
                  >
                    <strong>{{ subItem.title }}</strong>
                  </v-list-item-title>
                  <v-list-item-title
                    v-else
                    class="menuItem"
                    v-text="subItem.title"
                  />
                </v-list-item>
              </router-link>
            </v-list-item>
          </v-list-group>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      v-if="hasAnyItems"
      id="navBar"
      absolute
      color="#38598A"
      style="z-index: 1001;"
      :dark="true"
      class="pl-4 pr-8"
      :class="{'pl-16': $vuetify.display.mdAndUp}"
    >
      <v-app-bar-nav-icon
        id="menuBtn"
        class="ml-n5"
        style="color: white"
        @click="drawer=true"
      >
        <v-icon v-if="!drawer">
          $menu
        </v-icon>
        <v-icon v-else>
          $close
        </v-icon>
        <p class="ma-0 pl-3 pr-2 hidden-sm-and-down">
          Menu
        </p>
      </v-app-bar-nav-icon>
      <v-toolbar-title
        id="navTitle"
        class="nav-title pl-6"
        :class="{'ml-4': $vuetify.display.mdAndUp, 'pl-1': $vuetify.display.smAndDown}"
      >
        {{ title }}
      </v-toolbar-title>
    </v-app-bar>
    <v-app-bar
      v-if="bannerColor !== ''"
      style="color: white; z-index: 1000;"
      :color="bannerColor"
      absolute
      density="compact"
    >
      <div>
        <h3 class="envBanner pl-5">
          {{ bannerEnvironment }} Environment
        </h3>
      </div>
    </v-app-bar>
  </div>
</template>

<script>
import {PAGE_TITLES} from '../../utils/constants';
import { authStore } from '../../store/modules/auth';
import {mapState} from 'pinia';
import {PERMISSION} from '../../utils/constants/Permission';
import {appStore} from '../../store/modules/app';
export default {
  name: 'NavBar',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      drawer: null,
      items: [],
      hasAnyItems: false,
      bannerEnvironment: null,
      bannerColor: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated', 'userInfo']),
    ...mapState(appStore, ['config']),
    navWidth () {
      switch (this.$vuetify.display.name) {
      case 'xs':
        return '50%';
      case 'sm':
        return '50%';
      default:
        return '15%';
      }
    }
  },
  watch:{
    userInfo: {
      handler() {
        this.refreshUserPermissions();
      },
      immediate: true,
      deep: true
    }
  },
  async created(){
    this.bannerEnvironment = this.config.BANNER_ENVIRONMENT;
    this.bannerColor = this.config.BANNER_COLOR;
  },
  methods: {
    refreshUserPermissions(){
      this.items = [
        {
          title: PAGE_TITLES.DASHBOARD,
          link: { name: 'home'},
          authorized: this.userInfo.activeInstituteType === 'DISTRICT' || this.userInfo.activeInstituteType === 'SCHOOL',
        },
        {
          title: PAGE_TITLES.EXCHANGE,
          link: { name: 'inbox'},
          authorized: this.hasRequiredPermission(PERMISSION.SECURE_EXCHANGE),
        },
        {
          title: PAGE_TITLES.SCHOOL_DETAILS,
          link: { name: 'schoolDetails', params: {schoolID: this.userInfo.activeInstituteIdentifier}},
          authorized: this.userInfo.activeInstituteType === 'SCHOOL',
        },
        {
          title: PAGE_TITLES.SCHOOL_CONTACTS,
          link: { name: 'schoolContacts', params: {schoolID: this.userInfo.activeInstituteIdentifier}},
          authorized: this.userInfo.activeInstituteType === 'SCHOOL',
        },
        {
          title: PAGE_TITLES.DATA_COLLECTION,
          link: { name: 'sdcCollectionSummary', params: {schoolID: this.userInfo.activeInstituteIdentifier}},
          authorized: this.userInfo.activeInstituteType === 'SCHOOL',
        },
        {
          title: PAGE_TITLES.SCHOOLS,
          link: { name: 'schools'},
          authorized: this.userInfo.activeInstituteType === 'DISTRICT',
        },
        {
          title: PAGE_TITLES.DISTRICT_DETAILS,
          link: { name: 'districtDetails'},
          queryParam: {districtID: this.userInfo.activeInstituteIdentifier},
          authorized: this.userInfo.activeInstituteType === 'DISTRICT',
        },
        {
          title: PAGE_TITLES.DISTRICT_CONTACTS,
          link: { name: 'districtContacts'},
          queryParam: {districtID: this.userInfo.activeInstituteIdentifier},
          authorized: this.userInfo.activeInstituteType === 'DISTRICT',
        },
        {
          title: PAGE_TITLES.ADMINISTRATION,
          authorized: this.hasRequiredPermission(PERMISSION.EDX_USER_SCHOOL_ADMIN) || this.hasRequiredPermission(PERMISSION.EDX_USER_DISTRICT_ADMIN),
          items: [
            {
              title: 'School User Management',
              link: { name: 'schoolAccess'},
              authorized: this.hasRequiredPermission(PERMISSION.EDX_USER_SCHOOL_ADMIN)
            },
            {
              title: 'District User Management',
              link: { name: 'districtAccess'},
              authorized: this.hasRequiredPermission(PERMISSION.EDX_USER_DISTRICT_ADMIN)
            }
          ],
        }
      ];
      this.hasAnyItems = this.items.filter(obj => obj.authorized).length > 0;
    },
    hasRequiredPermission(permission){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === permission).length > 0);
    },
    setActive(item) {
      let index = this.items.findIndex(obj => obj.title === item.title);
      if(item.active) {
        this.items[index].active = false;
      } else {
        this.items.filter(obj => obj.items && obj.active).forEach(obj => obj.active = !obj.active);
        this.items[index].active = true;
      }
    },
    stripWhitespace(title) {
      return title.replace(/\s+/g, '');
    }
  }
};
</script>
<style scoped>
.router {
  width: 100%;
}
.menuItem {
  color: #003366;
}
.menuRow, .groupMenu {
  border-bottom: 2px solid #d2d2d2;
}
.router:hover .v-list-item__content, /deep/.v-list-group__header:hover .v-list-item__content, .router-link-exact-active {
  text-decoration: underline #003366;
}
.subMenuRow {
  border-top: 2px solid #d2d2d2;
  border-left: 4px solid #FCBA19;
  background-color: white;
}
.menuRow /deep/ i {
  color: #003366;
}
/deep/ .active {
  border-left: 4px solid #FCBA19;
  background-color: white;
}
header /deep/ .v-toolbar__content {
  padding-left: 0 !important;
}
/deep/ .v-list-group__header:before {
  background-color: #E9EBEF;
}

:deep(.subMenuRow > div.v-list-item__append > i){
  display: none;
}

:deep(.subMenuRow > div.v-list-item__content > a > div > div.v-list-item__append > i){
  display: none;
}

.nav-title {
  font-size: 1.4rem;
  color: white;
}

@media screen and (max-width: 801px){
  .nav-title {
    font-size: 1.1rem;
  }
}
</style>
