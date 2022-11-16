import {ClientFunction} from "testcafe";

/**
 * Common functions for dealing with various http requests, etc.
 * @type {{getPageUrl(): Promise<ClientFunction<string, []>>}}
 */
const httpUtils = {

    /**
     * Returns the current page url
     * @returns {Promise<ClientFunction<string, []>>}
     */
    async getPageUrl() {
        return ClientFunction(() => window.location.href);
    }

}

module.exports = httpUtils;
