public with sharing class ReviewController {

    // Fetch review with goals
    @AuraEnabled(cacheable=true)
    public static Performance_Review__c getReview(Id reviewId){
        return [
            SELECT Id, Name, Status__c, Final_Score__c, Overall_Rating__c,
                   Manager_Comments__c,
                   (SELECT Id, Name, Description__c, Weight__c,
                           Self_Score__c, Self_Comment__c,
                           Manager_Score__c, Manager_Feedback__c,
                           Final_Goal_Score__c
                    FROM Review_Goals__r
                    ORDER BY CreatedDate)
            FROM Performance_Review__c
            WHERE Id = :reviewId
        ];
    }

    // Save goal updates (self or manager)
    @AuraEnabled
    public static void saveGoals(List<Review_Goal__c> goals){
        update goals;
    }
    
    // Employee submits
    @AuraEnabled
    public static void submitSelfReview(Id reviewId){
        update new Performance_Review__c(
            Id = reviewId,
            Status__c = 'Manager Review',
            Submitted_Date__c = Date.today()
        );
    }

    // Manager approves
    @AuraEnabled
    public static void approveReview(Id reviewId, String comments){
        update new Performance_Review__c(
            Id = reviewId,
            Status__c = 'Approved',
            Manager_Comments__c = comments,
            Approved_Date__c = Date.today()
        );
    }
}