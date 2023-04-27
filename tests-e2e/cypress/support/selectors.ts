export class Selectors {

    dashboard: any = {
        title: '#navTitle > div',
        dataCollectionsTileTitle: '#studentDataCollectionCard > div.v-row.pl-4 > div.v-col.mt-2 > div:nth-child(1) > div > h4',
        dataCollectionsTile: '#studentDataCollectionCard'
    };

    dataCollectionsLanding: any = {
        title: '#navTitle > div',
        continue: '.navigate'
    };

    schoolDetails: any = {
        subjectHeading: 'h2.subjectHeading'
    }

    schoolContacts: any = {
        subjectHeading: 'h2.subjectHeading'
    }

    stepOneSchoolDetails: any = {
        nextButton: '#nextButton'
    }

    stepTwoSchoolContacts: any = {
        nextButton: '#nextButton'
    }


}