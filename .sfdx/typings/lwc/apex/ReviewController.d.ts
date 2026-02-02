declare module "@salesforce/apex/ReviewController.getReview" {
  export default function getReview(param: {reviewId: any}): Promise<any>;
}
declare module "@salesforce/apex/ReviewController.saveGoals" {
  export default function saveGoals(param: {goals: any}): Promise<any>;
}
declare module "@salesforce/apex/ReviewController.submitSelfReview" {
  export default function submitSelfReview(param: {reviewId: any}): Promise<any>;
}
declare module "@salesforce/apex/ReviewController.approveReview" {
  export default function approveReview(param: {reviewId: any, comments: any}): Promise<any>;
}
