import { LightningElement, api, track, wire } from 'lwc';
import getEmployeeName from '@salesforce/apex/ReviewController.getEmployeeName';
import getReviewStatus from '@salesforce/apex/ReviewController.getEmployeeName';
export default class PerformanceReviewApp extends LightningElement {
   @api recordId;
   @track currentStep = 'intro';
   steps = ['intro','info','goals','manager','summary'];
   get isIntro() { return this.currentStep === 'intro'; }
   get isInfo() { return this.currentStep === 'info'; }
   get isGoals() { return this.currentStep === 'goals'; }
   get isManager() { return this.currentStep === 'manager'; }
   get isSummary() { return this.currentStep === 'summary'; }
   year = new Date().getFullYear();
   handleNext(){
       let i = this.steps.indexOf(this.currentStep);
       if(i < this.steps.length-1){
           this.currentStep = this.steps[i+1];
       }
   }
   handleBack(){
       let i = this.steps.indexOf(this.currentStep);
       if(i > 0){
           this.currentStep = this.steps[i-1];
       }
   }

    employeeName = '';
    
    @wire(getEmployeeName, { reviewId: '$recordId' })
    wiredEmployee({ data, error }) {
        if (data) {
            this.employeeName = data;
            //this.cardTitle = `Year-End Review Form ${this.year} for ${this.employeeName}`;
        } else if (error) {
            console.error('Error fetching employee name:', error);
        }
    }

    cardTitle = `Year-End Review Form ${this.year} for ${this.employeeName}`;

    status = '';
    @wire(getReviewStatus, { reviewId: '$recordId' })
    wiredStatus({ data, error }) {
        if (data) {
            this.status = data;
        } else if (error) {
            console.error('Error fetching review status:', error);
        }
    }

}