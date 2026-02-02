import { LightningElement, api, wire, track } from 'lwc';
import getReview from '@salesforce/apex/ReviewController.getReview';
import saveGoals from '@salesforce/apex/ReviewController.saveGoals';
import submitSelfReview from '@salesforce/apex/ReviewController.submitSelfReview';
import { refreshApex } from '@salesforce/apex';

export default class EmployeeReview extends LightningElement {

    @api recordId;
    @track goals = [];
    draftValues = [];
    wiredResult;
    columns = [
        { label: 'Goal', fieldName: 'Name' },
        { label: 'Self Score', fieldName: 'Self_Score__c', editable: true, type:'number' },
        { label: 'Self Comment', fieldName: 'Self_Comment__c', editable: true }
    ];

    @wire(getReview, { reviewId: '$recordId' })
    wiredReview(result){
        this.wiredResult = result;
        if(result.data){
            this.goals = result.data.Review_Goals__r;
        }
    }

    async handleSave(event){
        await saveGoals({ goals: event.detail.draftValues });
        this.draftValues = [];
        refreshApex(this.wiredResult);
    }

    async submitReview(){
        await submitSelfReview({ reviewId: this.recordId });
        refreshApex(this.wiredResult);
    }
}