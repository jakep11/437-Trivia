//Controller for questions
app.controller('myQstsController',
 ['$scope', '$state','$rootScope', '$http', '$uibModal', 'notifyDlg', 'qsts', 'ctgs',
 function($scope, $state, $rootScope, $http, $uibM, nDlg, qsts, ctgs) {
   $scope.qsts = qsts;
   $scope.ctgs = ctgs;
   console.log("My questions controller");

   $scope.newQst = function() {
      $scope.title = null;
      $scope.dlgTitle = "New Question";

      $uibM.open({
         templateUrl: 'Question/addQstDlg.template.html',
         scope: $scope
      }).result
      .then(function(newQst) {
         console.log("calling new qst http");
         console.log(newQst);
         
         return $http.post('/Qsts/', 
            {
               "title": newQst.newTitle,
               "categoryId": newQst.ctg.id,
               "answer": newQst.answer
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

   $scope.editQst = function(qst) {
      $scope.title = null;
      $scope.dlgTitle = "Edit Question";

      var editTitle = qst.title;
      var editCategory = qst.category;
      var editAnswer = qst.answer;

      $scope.editQst = {
         title: editTitle,
         ctg: editCategory,
         answer: editAnswer
      }


      $uibM.open({
         templateUrl: 'Question/editQstDlg.template.html',
         scope: $scope
      }).result
      .then(function(editedQst) {
         console.log("calling new qst http");
         console.log(editedQst);
         
         return $http.put('/Qsts/' + qst.id, 
            {
               "title": editedQst.title,
               "categoryId": editedQst.ctg.id,
               "answer": editedQst.answer
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

}]);
