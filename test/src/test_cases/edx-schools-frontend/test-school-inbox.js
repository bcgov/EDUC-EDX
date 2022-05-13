/**
 * Tests to run against the school inbox page
 */
import { base_url } from '../../config/constants';
import { getToken } from "../../helpers/oauth-utils";
import {getAllMinistryTeams} from "../../services/edx-api-service";
import log from "npmlog";
import SecureExchange from "../../model/SecureExchange";
import SecureExchangeComment from "../../model/SecureExchangeComment";

let token = '';

fixture `school-inbox`
    .page(base_url)
    .before(tkn => {
        getToken().then(async (data) => {
            token = data.access_token;
        }).catch((error => {
            log.error(error);
            throw new Error("Failed to retrieve token");
        }));
        let secureExchange = new SecureExchange();
        let comment = new SecureExchangeComment();
        comment.content = 'My first comment';
        secureExchange.addComment(comment);

        log.info(JSON.stringify(secureExchange));

    })
    .after(async ctx => {
        // TODO: remove pre-loaded messages
    log.info("Performing tear-down operation");
});

/**
 * login
 */
test('login', async t => {
    log.info("Logged in.");
});

/**
 * navigate to inbox
 */
test('click-view-inbox', async t => {
    log.info("Going to inbox.");
});

/**
 * view 'Active Only'
 */
test('view-active-only', async t => {
    log.info("Viewing Active Only.");
});

/**
 * view 'All'
 */
test('view-all', async t => {
    log.info("Viewing All.");
});

/**
 * toggle filters
 */
test('toggle-filters', async t => {
    log.info("toggling filters.");
});

/**
 * filter by subject
 */
test('filter-by-subject', async t => {
    log.info("filtering by subject.");
});

/**
 * filter by message date
 */
test('filter-by-date', async t => {
    log.info("filtering messages by date.");
});

/**
 * filter by status
 */
test('filter-by-status', async t => {
    log.info("filtering by status.");
});

/**
 * mixed filtering
 */
test('mixed-filtering', async t => {
    log.info("testing mixed filtering.");
});

/**
 * clear filters
 */
test('clear-filters', async t => {
    log.info("clearing filters.");
});

