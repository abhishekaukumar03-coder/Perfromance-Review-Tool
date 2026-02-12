import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import USER_ID from '@salesforce/user/Id';

const FIELDS = [
    'Review__c.Validation_Checked__c',
    'Review__c.Manager__c',
    'Review__c.Status__c'
];

const USER_FIELDS = ['User.Profile.Name'];

export default class ReviewValidation extends LightningElement {

    @api recordId;
    @api isLocked;

    validationChecked = false;
    originalValue = false;

    isManager = false;
    isSystemAdmin = false;

    hasChanges = false;

    currentUserId = USER_ID;
    currentProfileName;

    @wire(getRecord, { recordId: '$currentUserId', fields: USER_FIELDS })
    wiredCurrentUser({ data, error }) {
        if (data) {
            // Safely access nested relationship field
            this.currentProfileName = data.fields?.Profile?.value?.fields?.Name?.value;
        } else if (error) {
            this.currentProfileName = undefined;
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredReview({ data }) {
        if (data) {

            this.validationChecked =
                data.fields.Validation_Checked__c.value;

            this.originalValue = this.validationChecked;

            const managerId = data.fields.Manager__c.value;
            const status = data.fields.Status__c.value;

            this.isManager = managerId === this.currentUserId;
            this.isSystemAdmin = this.currentProfileName === 'System Administrator';

            const STATUS = { SUBMITTED: 'Submitted' };
            if (status === STATUS.SUBMITTED) {
                this.isLocked = true;
            }

            this.hasChanges = false;
        }
    }

    get isCheckboxDisabled() {
        return this.isLocked || !(this.isManager || this.isSystemAdmin);
    }

    handleChange(event) {
        this.validationChecked = event.target.checked;
        this.hasChanges = this.validationChecked !== this.originalValue;
    }

    handleCancel() {
        this.validationChecked = this.originalValue;
        this.hasChanges = false;
    }

    handleSave() {

        const fields = {
            Id: this.recordId,
            Validation_Checked__c: this.validationChecked
        };

        updateRecord({ fields })
            .then(() => {

                this.originalValue = this.validationChecked;
                this.hasChanges = false;

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Validation updated successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                const message =
                    error?.body?.message ||
                    (Array.isArray(error?.body) ? error.body.map(e => e.message).join(', ') : 'Error saving validation');
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message,
                        variant: 'error'
                    })
                );
            });
    }
}
