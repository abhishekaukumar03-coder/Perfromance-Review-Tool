import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const FIELDS = [
    'Review__c.Employee_Comments__c',
    'Review__c.People_Manager_Comments__c'
];

export default class ReviewComments extends LightningElement {

    @api recordId;
    @api isLocked;
    @api isEmployee;
    @api isManager;

    employeeComments = '';
    managerComments = '';

    originalEmployeeComments = '';
    originalManagerComments = '';

    hasChanges = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredReview({ data }) {
        if (data) {
            this.employeeComments =
                data.fields.Employee_Comments__c.value || '';

            this.managerComments =
                data.fields.People_Manager_Comments__c.value || '';

            this.originalEmployeeComments = this.employeeComments;
            this.originalManagerComments = this.managerComments;

            this.hasChanges = false;
        }
    }

    handleEmployeeChange(event) {
        this.employeeComments = event.target.value;
        this.updateDirtyFlag();
    }

    handleManagerChange(event) {
        this.managerComments = event.target.value;
        this.updateDirtyFlag();
    }

    updateDirtyFlag() {
        this.hasChanges =
            this.employeeComments !== this.originalEmployeeComments ||
            this.managerComments !== this.originalManagerComments;
    }

    handleCancel() {
        this.employeeComments = this.originalEmployeeComments;
        this.managerComments = this.originalManagerComments;
        this.hasChanges = false;
    }

    handleSave() {

        const fields = {
            Id: this.recordId,
            Employee_Comments__c: this.employeeComments,
            People_Manager_Comments__c: this.managerComments
        };

        return updateRecord({ fields })
            .then(() => {

                this.originalEmployeeComments = this.employeeComments;
                this.originalManagerComments = this.managerComments;
                this.hasChanges = false;

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Comments saved successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body?.message || 'Error saving comments',
                        variant: 'error'
                    })
                );

                throw error;
            });
    }

    @api save() {
        return this.handleSave();
    }

    @api cancel() {
        this.handleCancel();
    }

    @api get hasUnsavedChanges() {
        return this.hasChanges;
    }

    get employeeCommentDisabled() {
        return this.isLocked || !this.isEmployee;
    }

    get managerCommentDisabled() {
        return this.isLocked || !this.isManager;
    }
}