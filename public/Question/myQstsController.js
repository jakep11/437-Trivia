//Controller for questions
app.controller('myQstsController',
 ['$scope', '$state','$rootScope', '$http', '$uibModal', 'notifyDlg', 'qsts',
 function($scope, $state, $rootScope, $http, $uibM, nDlg, qsts) {
   $scope.qsts = qsts;

   $scope.newQst = function() {
      $scope.title = null;
      $scope.dlgTitle = "New Question";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Question/addQstDlg.template.html',
         scope: $scope
      }).result
      .then(function(content) {
         return $http.post('/Qsts/', 
            {
               "title": scope.newQst.newTitle,
               "categoryId": scope.newQst.category.id,
               "answer": scope.newQst.answer
            });
      })
      .then(function() {
         return $http.get('/Qsts?owner=' + $rootScope.user.id);
      })
      .then(function(rsp) {
         $scope.qsts = rsp.data;
      })
      .catch(function(err) {
         console.log("Error: " + JSON.stringify(err));
      });
   };

   $scope.editQst = function() {

   };

}]);
