import { Selector } from 'testcafe';

class MessageDisplay {
    constructor() {
        this.navTitle = Selector('#navTitle');
        this.subjectHeading = Selector('.secureExchangeHeader h3.subjectHeading');
        this.ministryOwnershipTeamName = Selector('.secureExchangeHeader span.ministryOwnershipTeamName');
        this.createDate = Selector('.secureExchangeHeader span.createDate');
        this.secureExchangeStatusCode = Selector('.secureExchangeHeader span.secureExchangeStatusCode');
        this.sequenceNumber = Selector('.secureExchangeHeader span.sequenceNumber');
        this.editOptionsMenu = Selector('#editOptionsMenu');
        this.editOptionsMenuButton = Selector('#editOptionsMenuBtn');
        this.newMessageButton = Selector('#newMessageToConvBtn');
        this.newMessageTextArea = Selector ('#newMessageToConvTextArea');
        this.sendMessageButton = Selector('#newMessagePostBtn');
        this.markAsButton = Selector('#markAsButton');
        this.markAsSpan = this.markAsButton.find('span.markAsSpan');
        this.lastActivity = Selector('.v-timeline:last-child');
        this.activityTitle = this.lastActivity.find('div.activityTitle');
        this.activityDisplayDate = this.lastActivity.find('div.activityDisplayDate');
        this.activityContent = this.lastActivity.find('div.activityContent');
    }
}

export default MessageDisplay;
