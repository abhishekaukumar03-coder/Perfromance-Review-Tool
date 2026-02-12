import { LightningElement, api, wire, track } from 'lwc';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getGoals from '@salesforce/apex/GoalService.getGoals';

export default class ReviewPrioritiesTable extends LightningElement {

    @api recordId;
    @track goals = [];

    counter = 0;

    @wire(getGoals, { reviewId: '$recordId' })
    wiredGoals({ data }) {
        if (data) {
            this.goals = data.map(g => ({ ...g, localId: this.counter++ }));
        }
    }

    addGoal() {
        this.goals = [
            ...this.goals,
            {
                localId: this.counter++,
                Review__c: this.recordId,
                Title__c: '',
                Weight__c: 0,
                Self_Score__c: 0,
                Manager_Score__c: 0
            }
        ];
    }

    handleChange(event) {
        const updated = event.detail;

        this.goals = this.goals.map(g =>
            g.localId === updated.localId ? updated : g
        );
    }

    handleDelete(event) {
        const goal = event.detail;

        if (goal.Id) {
            deleteGoal({ goalId: goal.Id });
        }

        this.goals = this.goals.filter(g => g.localId !== goal.localId);
    }

    saveGoals() {
        saveGoalsApex({ goals: this.goals })
            .then(() => {
                alert('Saved successfully');
            });
    }
}