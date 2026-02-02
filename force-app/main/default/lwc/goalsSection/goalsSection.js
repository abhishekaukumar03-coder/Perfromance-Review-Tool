import { LightningElement, api, wire, track } from 'lwc';
import getReview from '@salesforce/apex/ReviewController.getReview';
import saveGoals from '@salesforce/apex/ReviewController.saveGoals';
import { refreshApex } from '@salesforce/apex';
export default class GoalsSection extends LightningElement {
   @api recordId;
   @track goals;
   draftValues=[];
   wiredData;
   columns = [
       { label:'Goal', fieldName:'Goal_Name__c'},
       { label:'Comment', fieldName:'Self_Comment__c', editable:true},
       { label:'Weight', fieldName:'Weight__c'},
       { label:'Self Score', fieldName:'Self_Score__c', editable:true, type:'number'}
       
   ];
   @wire(getReview,{reviewId:'$recordId'})
   wiredReview(result){
       this.wiredData=result;
       if(result.data){
           this.goals=result.data.Review_Goals__r;
       }
   }
   async handleSave(event){
       await saveGoals({goals:event.detail.draftValues});
       refreshApex(this.wiredData);
   }

   async submitReview(){
        await submitSelfReview({ reviewId: this.recordId });
        refreshApex(this.wiredData);
    }
}