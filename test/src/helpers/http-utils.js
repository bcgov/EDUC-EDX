import {ClientFunction} from "testcafe";

const getURL = ClientFunction(() => window.location.href);
const refreshPage = ClientFunction(() => location.reload(true));

/**
 * Common functions for dealing with various http requests, etc.
 */
const httpUtils = {

    /**
     * Returns the current page url
     * @returns {Promise<ClientFunction<string, []>>}
     */
    async getPageUrl() {
        const url = await getURL();
        return url;
    },

    /**
     * Returns true if url contains the passed in string
     * @param content a portion of a url
     * @returns {Promise<void>}
     */
    async urlContains(content) {
        const url = await getURL();
        return url.indexOf(content) > -1;
    },

    async refreshPage() {
        return refreshPage();
    }

};

module.exports = httpUtils;
