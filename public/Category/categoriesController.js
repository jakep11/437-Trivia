app.controller('categoriesController', ['$scope','$rootScope', '$state', 
 '$http', '$uibModal', 'notifyDlg', 'cnvs', 'prsID', 
 function($scope, $rootScope, $state, $http, $uibM, nDlg, cnvs, prsID) {
   $scope.cnvs = cnvs;
   $scope.prsID = prsID;
   $scope.user = $rootScope.user;

   $scope.newCnv = function() {
      $scope.title = null;
      $scope.dlgTitle = "New Conversation";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Category/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         return $http.post("Cnvs", {title: newTitle});
      })
      .then(function() {
         if (prsID) {
            return $http.get('/Cnvs?owner=' + $scope.prsID);
         }
         else {
            return $http.get('/Cnvs');
         }
         
      })
      .then(function(rsp) {
         $scope.cnvs = rsp.data;
      })
      .catch(function(err) {
         if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another conversation already has title " 
             + selectedTitle, "Error");
         else if (err.data[0].tag === "badValue") {
            nDlg.show($scope, "Title must be less than 80 characters");
         }
      });
   };

   $scope.editCnv = function(index) {
      $scope.title = $scope.cnvs[index].title;
      $scope.dlgTitle = "New Conversation";
      var selectedTitle;
      var cnvID = $scope.cnvs[index].id;


      $uibM.open({
         templateUrl: 'Category/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         selectedTitle = newTitle;
         return $http.put("/Cnvs/" + cnvID, {title: newTitle});
      })
      .then(function() {
         if (prsID) {
            return $http.get('/Cnvs?owner=' + $scope.prsID);
         }
         else {
            return $http.get('/Cnvs');
         }
      })
      .then(function(rsp) {
         $scope.cnvs = rsp.data;
      })
      .catch(function(err) {
         if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another conversation already has title "
             + selectedTitle, "Error");
         else if (err.data[0].tag === "badValue") {
            nDlg.show($scope, "Title must be less than 80 characters");
         }
      });
   };

   $scope.delCnv = function(index) {
      $scope.title = null;
      $scope.dlgTitle = "New Conversation";
      var selectedTitle;
      var cnvID = $scope.cnvs[index].id;

      nDlg.show($scope, "Would you like to delete conversation: '" +
       $scope.cnvs[index].title + "'?", "Delete Confirmation", 
       ["OK", "Cancel"])
      .then(function(btn) {
         if (btn == "OK") {
            return $http.delete('/Cnvs/' + cnvID);
         }
      })
      .then(function() {
         if ($scope.prsID) {
            return $http.get('/Cnvs?owner=' + $scope.prsID);
         }
         else {
            return $http.get('/Cnvs');
         }
      })
      .then(function(rsp) {
         $scope.cnvs = rsp.data;
      })
      .catch(function(err) {
         console.log(err);
      })
   };
}]);
