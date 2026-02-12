import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [

    // Employee fields
    'Review__c.Employee__r.FirstName',
    'Review__c.Employee__r.LastName',
    'Review__c.Employee__r.Email',
    'Review__c.Employee__r.Phone',
    'Review__c.Employee__r.Department',
    'Review__c.Employee__r.Country',

    // Manager
    'Review__c.Manager__r.Name',

    // Other
    'Review__c.Cycle__r.Name',
    'Review__c.Status__c'
];

export default class ReviewEmployeeInfo extends LightningElement {

    @api recordId;

    employeeName;
    email;
    phone;
    department;
    country;

    manager;
    cycle;
    status;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredReview({ data }) {

        if (!data) return;

        const emp = data.fields.Employee__r.value.fields;

        const first = emp.FirstName?.value || '';
        const last = emp.LastName?.value || '';

        this.employeeName = `${first} ${last}`;
        this.email = emp.Email?.value;
        this.phone = emp.Phone?.value;
        this.department = emp.Department?.value;
        this.country = emp.Country?.value;

        this.manager = data.fields.Manager__r.displayValue;
        this.cycle = data.fields.Cycle__r.displayValue;
        this.status = data.fields.Status__c.value;
    }
}