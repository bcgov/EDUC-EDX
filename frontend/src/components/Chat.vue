<template>
  <v-container class="pa-0" fluid>
    <!-- <v-row class="pb-5" v-if="requestComment"> -->
      <v-card class="mb-5" v-if="status === requestStatuses.RETURNED">
        <v-toolbar flat color="#036" class="white--text" height="45rem">
          <v-toolbar-title>Request</v-toolbar-title>
        </v-toolbar>
        <div>
          <v-progress-linear
            indeterminate
            absolute
            top
            color="indigo darken-2"
            v-if="loading"
          ></v-progress-linear>
          <SingleComment
            v-for="comment in requestComments"
            :comment="comment"
            :myself="myself"
            :participants="participants"
            :key="comment.id"
            :highlight="true"
          ></SingleComment>
        </div>
      </v-card>
    <!-- </v-row> -->
    <!-- <v-row class="pb-5"> -->
      <v-card class="mb-5" v-if="status === requestStatuses.RETURNED">
        <v-toolbar flat color="#036" class="white--text" height="45rem">
          <v-toolbar-title>Respond Here</v-toolbar-title>
        </v-toolbar>
        <div id="comments-outer" class="comments-outside">
          <v-progress-linear
            indeterminate
            absolute
            top
            color="indigo darken-2"
            v-if="loading"
          ></v-progress-linear>
          <Comments 
            :unsubmittedDocuments="unsubmittedDocuments"
          ></Comments>
        </div>
      </v-card>
    <!-- </v-row> -->
    <!-- <v-row class="pb-5"> -->
      <v-card class="mb-5" v-if="hasHistory">
        <v-toolbar flat color="#036" class="white--text" height="45rem">
          <v-toolbar-title>Discussion History</v-toolbar-title>
        </v-toolbar>
        <div>
          <v-progress-linear
            indeterminate
            absolute
            top
            color="indigo darken-2"
            v-if="loading"
          ></v-progress-linear>
          <SingleComment 
            v-for="comment in commentHistory"
            :comment="comment"
            :myself="myself"
            :participants="participants"
            :key="comment.id"
          ></SingleComment>
        </div>
      </v-card>
    <!-- </v-row> -->
  </v-container>
</template>
<script>
import SingleComment from './SingleComment.vue';
import Comments from './Comment.vue';
import ApiService from '@/common/apiService';
import { mapGetters } from 'vuex';
import { groupBy, sortBy, findLastIndex } from 'lodash';
import { RequestStatuses } from '@/utils/constants';

export default {
  components: {
    Comments,
    SingleComment,
  },
  data() {
    return {
      participants: [],
      toLoad: [],
      loading: true,
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters(['requestType']),
    request() {
      return this.$store.getters[`${this.requestType}/request`];
    },
    unsubmittedDocuments() {
      return this.$store.getters[`${this.requestType}/unsubmittedDocuments`];
    },
    commentHistory() {
      return this.$store.getters[`${this.requestType}/commentHistory`];
    },
    requestComments() {
      return this.$store.getters[`${this.requestType}/requestComments`];
    },
    myself() {
      return { name: this.userInfo.displayName, id: '1' };
    },
    hasHistory() {
      return this.commentHistory && this.commentHistory.length > 0;
    },
    status() {
      return this.request[`${this.requestType}StatusCode`];
    },
    requestStatuses() {
      return RequestStatuses;
    },
    requestID() {
      return this.request[`${this.requestType}ID`];
    }
  },
  created() {
    Promise.all([
      ApiService.getDocumentList(this.requestID, this.requestType),
      ApiService.getCommentList(this.requestID, this.requestType),
      this.getDocumentTypeCodes()
    ]).then(([documentRes, commentRes]) => {
      this.participants = commentRes.data.participants;

      let [messages, unsubmittedDocuments] = this.linkDocumentsToComments(commentRes.data.messages, documentRes.data);
      this.splitComments(messages, unsubmittedDocuments);
    }).catch(error => {
      console.log(error);
      this.alert = true;
    }).finally(() => {
      if(!this.userInfo){
        console.log('UserInfo undefined');
      }
      if(!this.request){
        console.log('request object undefined');
      }
      if(!this.unsubmittedDocuments){
        console.log('unsubmittedDocuments object undefined');
      }
      if(!this.commentHistory){
        console.log('Comment History object undefined');
      }
      if(!this.setRequestComments){
        console.log('Set Request Comments objects undefined');
      }
      this.loading = false;
    });
  },
  methods: {
    getDocumentTypeCodes() {
      return this.$store.dispatch(`${this.requestType}/getDocumentTypeCodes`);
    },
    setUnsubmittedDocuments(unsubmittedDocuments) {
      this.$store.commit(`${this.requestType}/setUnsubmittedDocuments`, unsubmittedDocuments);
    },
    setCommentHistory(commentHistory) {
      this.$store.commit(`${this.requestType}/setCommentHistory`, commentHistory);
    },
    setUnsubmittedComment(unsubmittedComment) {
      this.$store.commit(`${this.requestType}/setUnsubmittedComment`, unsubmittedComment);
    },
    setRequestComments(requestComments) {
      this.$store.commit(`${this.requestType}/setRequestComments`, requestComments);
    },
    linkDocumentsToComments(messages, documents) {
      const myMessages = messages.filter(message => message.myself);
      documents = sortBy(documents, ['createDate']);

      const documentGroup = groupBy(documents, document => {
        const dates = myMessages.map(message => message.timestamp);
        return dates.findIndex(date => date >= document.createDate);
      });

      myMessages.forEach((message, i) => {
        message.documents = documentGroup[i];
      });

      return [messages, documentGroup[-1]];
    },
    splitComments(messages, unsubmittedDocuments) {
      const lastMessage = messages[messages.length - 1];
      let requestIndex = messages.length;
      if(this.status === this.requestStatuses.RETURNED && lastMessage) {
        if(lastMessage.myself) {
          this.setUnsubmittedComment(lastMessage);
          unsubmittedDocuments = (unsubmittedDocuments || []).concat(lastMessage.documents || []);
          messages = messages.slice(0, messages.length - 1);          
        }
        
        const historyIndex = findLastIndex(messages, ['myself', true]);
        requestIndex = historyIndex + 1;
        this.setRequestComments(messages.slice(requestIndex));
      }

      this.setCommentHistory(messages.slice(0, requestIndex));
      this.setUnsubmittedDocuments(unsubmittedDocuments);
    }
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
}
hr {
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid #ececec;
  margin: 1em;
  padding: 0;
}
.comments-outside {
  /* box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3); */
  margin-top: 0;
  max-width: 100%;
  height:100%;
  width: 100%;
  position: relative;
  overflow-y: hidden;

}
.comments-header {
  background-color: #C8C8C8;
  padding: 1rem;
  align-items: center;
  display: flex;
  justify-content: space-between;
  color: #333;
  min-height: 80px;
  font-size: 2rem;
}
.comments-header .comments-stats span {
  margin-left: 1rem;
}
.post-owner {
  display: flex;
  align-items: center;
}

.post-owner .username > a {
  color: #333;
}

.custom-scrollbar::-webkit-scrollbar-track
{
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    -moz-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
    background-color: #fff;
}
.custom-scrollbar::-webkit-scrollbar
{
    width: 0.8rem;
    background-color: #fff;
}
.custom-scrollbar::-webkit-scrollbar-thumb
{
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    -moz-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: #555;
}

.v-toolbar /deep/ .v-toolbar__content {
  padding-left: 20px !important;
}
</style>
