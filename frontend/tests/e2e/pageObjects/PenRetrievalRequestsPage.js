import { Selector, t } from 'testcafe'

class PenRetrievalRequestPage {


    constructor() {

        this.mainSearchBar = Selector('#input-72')
        this.statusSearchBar = Selector('#input-48')
        this.lastNameSearchBar = Selector('#input-51')
        this.firstNameSearchBar = Selector('#input-54')
        this.reviewerSearchBar = Selector('#input-57')
        this.statusResultFirstElement = Selector('div.v-application--wrap tr:nth-of-type(1) td:nth-of-type(2)')
    }


    async setMainStatusBar(t, data) {
        await t.typeText(this.mainSearchBar, data)
    }

    async setStatusSearchBar(data){
        await t.typeText( this.statusSearchBar,data)
    }

    async setLastNameSearchBar(data){
        await t.typeText(this.lastNameSearchBar,data)
    }

    async setFirstNameSearchBar(data){
        await t.typeText(this.firstNameSearchBar,data)
    }

    async setReviewerSearchBar(data){
        await t.typeText(this.reviewerSearchBar,data)
    }

    async clickStatusResultFirstElement(){
        await t.click(this.statusResultFirstElement)
    }

}

export default PenRetrievalRequestPage