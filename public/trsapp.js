
var app = angular.module('mainApp', [
   'ui.router',
   'ui.bootstrap'
]);

app.constant("errMap", 
{
   EN: {
      tags: {
         missingField: 'Field missing from request: ',
         badValue: 'Field has bad value: ',
         notFound: 'Entity not present in DB',
         badLogin: 'Email/password combination invalid',
         dupEmail: 'Email duplicates an existing email',
         noTerms: 'Acceptance of terms is required',
         forbiddenRole: 'Role specified is not permitted.',
         noOldPwd: 'Change of password requires an old password',
         oldPwdMismatch: 'Old password that was provided is incorrect.',
         dupTitle: 'Conversation title duplicates an existing one',
         dupEnrollment: 'Duplicate enrollment',
         forbiddenField: 'Field in body not allowed.',
         queryFailed: 'Query failed (server problem).'
      },
      languages: {
         EN: "English",
         ES: "Spanish"
      }
   },
   ES: {
      tags: {
         missingField: '[ES] Field missing from request: ',
         badValue: '[ES] Field has bad value: ',
         notFound: '[ES] Entity not present in DB',
         badLogin: '[ES] Email/password combination invalid',
         dupEmail: '[ES] Email duplicates an existing email',
         noTerms: '[ES] Acceptance of terms is required',
         forbiddenRole: '[ES] Role specified is not permitted.',
         noOldPwd: '[ES] Change of password requires an old password',
         oldPwdMismatch: '[ES] Old password that was provided is incorrect.',
         dupTitle: '[ES] Conversation title duplicates an existing one',
         dupEnrollment: '[ES] Duplicate enrollment',
         forbiddenField: '[ES] Field in body not allowed.',
         queryFailed: '[ES] Query failed (server problem).'
      },
      languages: {
         EN: "Inglés",
         ES: "Español"
      }
   }
});

app.filter('tagError', ['errMap', '$rootScope', function(errMap, $rootScope) {
   return function(err) {
      var lang = $rootScope.language;

      return errMap[lang].tags[err.tag] + (err.params ? err.params[0] : "");
   };
}]);

//Fixes the "Transition superseded" error
app.config(['$qProvider', function ($qProvider) {
   $qProvider.errorOnUnhandledRejections(false);
}]);

app.directive('cnvSummary', [function() {
   return {
      restrict: 'E',
      scope: {
         cnv: "=toSummarize",
         user: "=",
         editCnv: "&onEdit",
         delCnv: "&onDelete"
      },
      templateUrl: "./Conversation/cnvLine.template.html"
   };
}]);
