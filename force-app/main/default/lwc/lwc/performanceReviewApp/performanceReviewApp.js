import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';

const FIELDS = [
    'Review__c.Status__c',
    'Review__c.Employee__c',
    'Review__c.Manager__c',
    'Review__c.Validation_Checked__c',
    'Review__c.Performance_Rating__c'
];

export default class PerformanceReviewApp extends LightningElement {

    @api recordId;

    currentUserId = USER_ID;

    status;
    employeeId;
    managerId;
    validationChecked;
    performanceRating;

    showModal = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredReview({ data }) {
        if (data) {
            this.status = data.fields.Status__c.value;
            this.employeeId = data.fields.Employee__c.value;
            this.managerId = data.fields.Manager__c.value;
            this.validationChecked = data.fields.Validation_Checked__c.value;
            this.performanceRating = data.fields.Performance_Rating__c.value;
        }
    }

    /* ================= ROLES ================= */

    get isEmployee() {
        return this.currentUserId === this.employeeId;
    }

    get isManager() {
        return this.currentUserId === this.managerId;
    }

    /* ================= STAGES ================= */

    get isDraft() {
        return this.status === 'Draft';
    }

    get isSubmitted() {
        return this.status === 'Manager Review';
    }

    get isCompleted() {
        return this.status === 'Completed';
    }

    /* ================= LOCKING ================= */

    get baseLocked() {
        return this.isSubmitted || this.isCompleted;
    }

    get goalsLocked() {
        return !(this.isDraft && this.isEmployee);
    }

    get commentsLocked() {
        return this.isCompleted;
    }

    get managerSectionLocked() {
        return !this.isManager || this.isCompleted;
    }

    /* ================= VISIBILITY ================= */

    get showManagerSection() {
        return this.isSubmitted || this.isCompleted;
    }

    get showEmployeeSubmit() {
        return this.isDraft && this.isEmployee;
    }

    get showManagerComplete() {
        return this.isSubmitted && this.isManager;
    }

    /* ================= GLOBAL SAVE ================= */

    get showGlobalButtons() {

        const sections = this.template.querySelectorAll(
            'c-review-comments, c-review-comment1, c-review-final-reflection, c-review-priorities'
        );

        return Array.from(sections).some(
            section => section.hasUnsavedChanges
        );
    }

    async handleGlobalSave() {

        const sections = this.template.querySelectorAll(
            'c-review-comments, c-review-comment1, c-review-final-reflection, c-review-priorities'
        );

        try {

            for (let section of sections) {
                if (section.hasUnsavedChanges) {
                    await section.save();
                }
            }

            this.showToast('Success', 'All changes saved successfully.');

        } catch (error) {

            this.showToast(
                'Error',
                error.body?.message || 'Error saving changes',
                'error'
            );
        }
    }

    handleGlobalCancel() {

        const sections = this.template.querySelectorAll(
            'c-review-comments, c-review-comment1, c-review-final-reflection, c-review-priorities'
        );

        sections.forEach(section => {
            section.cancel();
        });
    }

    /* ================= SUBMIT ================= */

    handleSubmit() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    confirmSubmit() {

        const fields = {
            Id: this.recordId,
            Status__c: 'Manager Review'
        };

        updateRecord({ fields })
            .then(() => {
                this.status = 'Manager Review';
                this.showModal = false;
                this.showToast('Success', 'Review submitted to Manager.');
            })
            .catch(error => {
                this.showToast(
                    'Error',
                    error.body?.message || 'Error submitting review',
                    'error'
                );
            });
    }

    /* ================= COMPLETE ================= */

    handleManagerComplete() {

        if (!this.validationChecked) {
            this.showToast('Error', 'Validation must be checked.', 'error');
            return;
        }

        if (!this.performanceRating) {
            this.showToast('Error', 'Performance rating is required.', 'error');
            return;
        }

        const fields = {
            Id: this.recordId,
            Status__c: 'Completed'
        };

        updateRecord({ fields })
            .then(() => {
                this.status = 'Completed';
                this.showToast('Success', 'Review completed successfully.');
            })
            .catch(error => {
                this.showToast(
                    'Error',
                    error.body?.message || 'Error completing review',
                    'error'
                );
            });
    }

    /* ================= UTIL ================= */

    showToast(title, message, variant = 'success') {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }

    get containerClass() {
        return this.isCompleted
            ? 'slds-theme_shade slds-p-around_medium'
            : 'slds-p-around_medium';
    }
}