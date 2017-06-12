app.controller('categoriesController', ['$scope','$rootScope', '$state', 
 '$http', '$uibModal', 'notifyDlg', 'ctgs', 
 function($scope, $rootScope, $state, $http, $uibM, nDlg, ctgs) {
   $scope.ctgs = ctgs;
   
   $scope.newCtg = function() {
      $scope.title = null;
      $scope.dlgTitle = "New Category";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Category/newCtgDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         selectedTitle = newTitle;
         return $http.post("Ctgs", {title: newTitle});
      })
      .then(function() {
         return $http.get('/Ctgs');
         
      })
      .then(function(rsp) {
         $scope.ctgs = rsp.data;
      })
      .catch(function(err) {
         if (err.data[0].tag === "dupTitle")
            nDlg.show($scope, "Another Category already has title: " 
             + selectedTitle, "Error");
         else if (err.data[0].tag === "badValue") {
            nDlg.show($scope, "Title must be less than 80 characters");
         }
      });
   };


   $scope.delCtg = function(ctg) {
      $scope.title = null;

      var ctgID = ctg.id;

      nDlg.show($scope, "Would you like to delete category: '" +
       ctg.title + "'?", "Delete Confirmation",
       ["OK", "Cancel"])
      .then(function(btn) {
         if (btn === "OK") {
            return $http.delete('/Ctgs/' + ctgID);
         }
      })
      .then(function() {
         return $http.get('/Ctgs');
      })
      .then(function(rsp) {
         $scope.ctgs = rsp.data;
      })
      .catch(function(err) {
         console.log(err);
      });
   };
}]);
