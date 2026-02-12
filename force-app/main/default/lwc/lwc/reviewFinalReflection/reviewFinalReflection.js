import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import REVIEW_OBJECT from '@salesforce/schema/Review__c';
import PERFORMANCE_FIELD from '@salesforce/schema/Review__c.Performance_Rating__c';

const FIELDS = [
    'Review__c.Performance_Rating__c',
    'Review__c.Manager__c'
];

const USER_FIELDS = ['User.Profile.Name'];

export default class ReviewFinalReflection extends LightningElement {

    @api recordId;
    @api isLocked;
    @api currentUserId;

    performanceRating = '';
    originalPerformanceRating = '';

    ratingOptions = [];
    hasChanges = false;
    isManager = false;
    isSystemAdmin = false;

    currentProfileName;

    /* ============================= */
    /* Load Current User Profile     */
    /* ============================= */

    @wire(getRecord, { recordId: '$currentUserId', fields: USER_FIELDS })
    wiredCurrentUser({ data }) {
        if (data) {
            this.currentProfileName =
                data.fields?.Profile?.value?.fields?.Name?.value;

            this.isSystemAdmin =
                this.currentProfileName === 'System Administrator';
        }
    }

    /* ============================= */
    /* Load Review Record            */
    /* ============================= */

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredReview({ data }) {
        if (data) {

            this.performanceRating =
                data.fields.Performance_Rating__c.value || '';

            this.originalPerformanceRating =
                this.performanceRating;

            const managerId = data.fields.Manager__c.value;
            this.isManager = managerId === this.currentUserId;

            this.hasChanges = false;
        }
    }

    /* ============================= */
    /* Fetch Picklist Values         */
    /* ============================= */

    @wire(getObjectInfo, { objectApiName: REVIEW_OBJECT })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: PERFORMANCE_FIELD
    })
    wiredPicklist({ data }) {
        if (data) {
            this.ratingOptions = data.values;
        }
    }

    /* ============================= */
    /* Disable Logic                 */
    /* ============================= */

    get isFieldDisabled() {
        return this.isLocked || !(this.isManager || this.isSystemAdmin);
    }

    /* ============================= */
    /* Change Handling               */
    /* ============================= */

    handleChange(event) {
        this.performanceRating = event.detail.value || '';

        this.hasChanges =
            this.performanceRating !== this.originalPerformanceRating;
    }

    handleCancel() {
        this.performanceRating = this.originalPerformanceRating;
        this.hasChanges = false;
    }

    /* ============================= */
    /* Save Logic (UPDATED)          */
    /* ============================= */

    handleSave() {

        const fields = {
            Id: this.recordId,
            Performance_Rating__c: this.performanceRating
        };

        // 🔥 RETURN the promise for parent orchestration
        return updateRecord({ fields })
            .then(() => {

                this.originalPerformanceRating =
                    this.performanceRating;

                this.hasChanges = false;

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Performance rating saved successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body?.message || 'Error saving rating',
                        variant: 'error'
                    })
                );

                // 🔥 Important for global save
                throw error;
            });
    }

    /* ============================= */
    /* Global Save Support           */
    /* ============================= */

    @api
    save() {
        return this.handleSave();
    }

    @api
    cancel() {
        this.handleCancel();
    }

    @api
    get hasUnsavedChanges() {
        return this.hasChanges;
    }
}