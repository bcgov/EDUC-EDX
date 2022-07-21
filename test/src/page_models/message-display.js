import { Selector, t } from 'testcafe';
import log from 'npmlog';

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
        this.addAttachmentMenuButton = Selector('#addAttachmentConvButton');
    }

    async clickEditOptionsMenuButton() {
        await t.click(this.editOptionsMenuButton);
        log.info('Edit options menu button clicked');
    }

    async clickAddAttachmentMenuButton() {
        await t.click(this.addAttachmentMenuButton);
        log.info('Add attachment menu option button clicked');
    }

    async verifyTimelineAttachmentByText(text) {
        await t.expect(Selector('.v-card__text')
        .withExactText(text).count)
        .eql(1, {timeout: 60000});
        log.info(`Exchange message with text - ${text} - found`);
    }
}

export default MessageDisplay;
