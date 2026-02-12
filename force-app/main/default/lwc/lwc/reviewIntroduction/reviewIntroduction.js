import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = ['Review__c.Introduction__c'];

export default class ReviewIntroduction extends LightningElement {

    @api recordId;

    introduction = '';

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredReview({ data }) {
        if (data) {
            this.introduction = data.fields.Introduction__c.value || '';
        }
    }
}