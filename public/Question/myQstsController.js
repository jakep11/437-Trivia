//Controller for questions
app.controller('myQstsController',
 ['$scope', '$state','$rootScope', '$http', '$uibModal', 'notifyDlg', 'qsts', 
 'ctgs', function($scope, $state, $rootScope, $http, $uibM, nDlg, qsts, ctgs) {
   $scope.qsts = qsts;
   $scope.ctgs = ctgs;

   $scope.addQst = function() {
      var newTitle = null;
      var newAnswer = null;
      $scope.title = null;
      $scope.dlgTitle = "New Question";

      $uibM.open({
         templateUrl: 'Question/addQstDlg.template.html',
         scope: $scope
      }).result
      .then(function(newQst) {
         newTitle = newQst.newTitle;
         newAnswer = newQst.answer;
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
         if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another question already has title: " 
             + newTitle, "Error");
         else if (err.data[0].tag == "badValue"){
            if (err.data[0].params[0] === "title") {
               nDlg.show($scope, "Title is too long. Please shorten title: " 
             + newTitle, "Error");
            }
            else if (err.data[0].params[0] === "answer") {
               nDlg.show($scope, "Answer is too long. Please shorten answer: " 
             + newAnswer, "Error");
            }
         }
      });
   };

   $scope.updateQst = function(qst) {
      $scope.title = null;
      $scope.dlgTitle = "Edit Question";
      var newTitle = null;
      var newAnswer = null;
      var editTitle = qst.title;
      var editCategory = qst.category;
      var editAnswer = qst.answer;
      
      //Find correct category to initialize modal
      for (var i = 0; i < $scope.ctgs.length; i++) {
         if ($scope.ctgs[i].title === qst.category) {
            editCategory = $scope.ctgs[i];
            break;
         }
      }

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
         newTitle = editedQst.title;
         newAnswer = editedQst.answer;
         
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
         if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another question already has title: " 
             + newTitle, "Error");
         else if (err.data[0].tag == "badValue"){
            if (err.data[0].params[0] === "title") {
               nDlg.show($scope, "Title is too long. Please shorten title: " 
             + newTitle, "Error");
            }
            else if (err.data[0].params[0] === "answer") {
               nDlg.show($scope, "Answer is too long. Please shorten answer: " 
             + newAnswer, "Error");
            }
         }
      });
   };

}]);
