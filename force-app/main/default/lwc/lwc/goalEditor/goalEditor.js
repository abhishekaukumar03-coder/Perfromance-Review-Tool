import { LightningElement, api } from 'lwc';

export default class GoalEditor extends LightningElement {

    @api goal;
    @api statusOptions;
    @api isLocked;   // ⭐ receive lock state

    handleChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;

        const updated = { ...this.goal };
        updated[field] = value;

        this.dispatchEvent(
            new CustomEvent('changegoal', {
                detail: updated
            })
        );
    }

    deleteGoal() {
        this.dispatchEvent(
            new CustomEvent('delete', {
                detail: this.goal
            })
        );
    }
}