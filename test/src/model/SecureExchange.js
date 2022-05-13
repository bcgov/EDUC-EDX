class SecureExchange {

    constructor() {
        this.createUser = null;
        this.updateUser = null;
        this.createDate = null;
        this.updateDate = null;
        this.secureExchangeId = null;
        this.contactIdentifier = null;
        this.ministryOwnershipTeamID = null;
        this.secureExchangeContactTypeCode = null;
        this.secureExchangeStatusCode = null;
        this.reviewer = null;
        this.subject = null;
        this.isReadByMinistry = null;
        this.isReadByExchangeContact = null;
        this.statusUpdateDate = null;
        this.sequenceNumber = null;
        this.commentsList = [];
    }

    addComment(comment) {
        this.commentsList.push(comment);
    }

    removeComment(commentId) {
        if(this.commentsList.filter(c => c.secureExchangeCommentID === commentId).length > 0){
            this.commentsList = this.commentsList.filter(c => c.secureExchangeCommentID === commentId);
        }
    }
}

export default SecureExchange;


