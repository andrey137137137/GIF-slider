import axios from 'axios';
import Vue from 'vue';
import VueVirtualScroller from 'vue-virtual-scroller';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import App from './App.vue';
import { IS_DEV } from '@apiHelpers';
import { SERVER_BASE_URL } from '@helpers';

// Import Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);
Vue.use(VueVirtualScroller);
Vue.config.productionTip = !IS_DEV;

axios.interceptors.request.use(
  config => {
    config.baseURL = SERVER_BASE_URL;
    // config.timeout = 5000;
    config.headers = { 'Content-Type': 'application/json' };
    config.withCredentials = true;
    return config;
  },
  err => {
    if (IS_DEV) {
      console.log(err.response.status);
    }
    return Promise.reject();
  },
);

new Vue({
  render: h => h(App),
}).$mount('#app');
