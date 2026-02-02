import { LightningElement, api, wire, track } from 'lwc';
import getReview from '@salesforce/apex/ReviewController.getReview';
import employeeInfo from '@salesforce/apex/EmployeeController.employeeInfo';
import { refreshApex } from '@salesforce/apex';

export default class EmployeeInformation extends LightningElement {
    

    @api recordId;
    @track goals = [];
    draftValues = [];
    wiredResult;
    columns = [
        { label: 'First Name', fieldName: 'FirstName' },
        { label: 'Last Name', fieldName: 'LastName' },
        { label: 'Email', fieldName: 'Email' },
        { label: 'Department', fieldName: 'Department' },
        { label: 'Country', fieldName: 'Country' }
    ];

    @wire(employeeInfo, { reviewId: '$recordId' })
    wiredReview(result){
        this.wiredResult = result;
        if(result.data){
            this.goals = result.data.Review_Goals__r;
        }
    }
}