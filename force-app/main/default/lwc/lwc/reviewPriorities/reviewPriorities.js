import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getGoals from '@salesforce/apex/GoalService.getGoals';
import saveGoalsApex from '@salesforce/apex/GoalService.saveGoals';
import deleteGoal from '@salesforce/apex/GoalService.deleteGoal';

import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import GOAL_OBJECT from '@salesforce/schema/Goal__c';
import STATUS_FIELD from '@salesforce/schema/Goal__c.Status__c';

export default class ReviewPriorities extends LightningElement {

    @api isLocked;
    @api recordId;

    @track goals = [];

    counter = 0;
    hasChanges = false;
    originalGoals = [];
    statusOptions = [];

    /* ============================= */
    /* Load Goals                    */
    /* ============================= */

    @wire(getGoals, { reviewId: '$recordId' })
    wiredGoals({ data }) {
        if (data) {
            this.goals = data.map(g => ({ ...g, localId: this.counter++ }));
            this.originalGoals = JSON.parse(JSON.stringify(this.goals));
            this.hasChanges = false;
        }
    }

    /* ============================= */
    /* Metadata                      */
    /* ============================= */

    @wire(getObjectInfo, { objectApiName: GOAL_OBJECT })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: STATUS_FIELD
    })
    wiredStatus({ data }) {
        if (data) {
            this.statusOptions = data.values;
        }
    }

    /* ============================= */
    /* Add Goal                      */
    /* ============================= */

    addGoal() {

        this.goals = [
            ...this.goals,
            {
                localId: this.counter++,
                Review__c: this.recordId,
                Title__c: '',
                Weight__c: 0,
                Status__c: 'Draft', // must match picklist value
                Self_Score__c: 0,
                Manager_Score__c: 0
            }
        ];

        this.hasChanges = true;
    }

    /* ============================= */
    /* Update Goal                   */
    /* ============================= */

    handleChange(event) {

        const updated = event.detail;

        this.goals = this.goals.map(g =>
            g.localId === updated.localId ? updated : g
        );

        this.hasChanges = true;
    }

    /* ============================= */
    /* Delete Goal                   */
    /* ============================= */

    handleDelete(event) {

        const goal = event.detail;

        if (goal.Id) {

            deleteGoal({ goalId: goal.Id })
                .then(() => {
                    this.goals =
                        this.goals.filter(g => g.localId !== goal.localId);

                    this.hasChanges = true;

                    this.showToast('Success', 'Goal deleted', 'success');
                })
                .catch(error => {
                    this.showToast(
                        'Error',
                        error.body?.message || 'Delete failed',
                        'error'
                    );
                });

        } else {

            this.goals =
                this.goals.filter(g => g.localId !== goal.localId);

            this.hasChanges = true;
        }
    }

    /* ============================= */
    /* Cancel                        */
    /* ============================= */

    handleCancel() {

        this.goals = JSON.parse(JSON.stringify(this.originalGoals));
        this.hasChanges = false;
    }

    /* ============================= */
    /* Save (UPDATED FOR GLOBAL)     */
    /* ============================= */

    saveGoals() {

        // Auto reorder
        this.goals.forEach((g, index) => {
            g.Order__c = index + 1;
        });

        // 🔥 RETURN the promise
        return saveGoalsApex({ goals: this.goals })
            .then(() => {

                this.originalGoals =
                    JSON.parse(JSON.stringify(this.goals));

                this.hasChanges = false;

                this.showToast(
                    'Success',
                    'Goals saved successfully',
                    'success'
                );
            })
            .catch(error => {

                this.showToast(
                    'Error',
                    error.body?.message || 'Error saving goals',
                    'error'
                );

                // 🔥 Required so parent can catch
                throw error;
            });
    }

    /* ============================= */
    /* Global Save Support           */
    /* ============================= */

    @api
    save() {
        return this.saveGoals();
    }

    @api
    cancel() {
        this.handleCancel();
    }

    @api
    get hasUnsavedChanges() {
        return this.hasChanges;
    }

    /* ============================= */
    /* Utility                       */
    /* ============================= */

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}