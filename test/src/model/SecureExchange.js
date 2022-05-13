class SecureExchange {

    constructor() {
        this.createUser = null;
        this.updateUser = null;
        this.createDate = null;
        this.updateDate = null;
        this.secureExchangeID = null;
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

}

export default SecureExchange;


