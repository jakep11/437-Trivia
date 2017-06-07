//Controller for questions
app.controller('myQstsController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'msgs', 'cnv',
 function($scope, $state, $http, $uibM, nDlg, msgs, cnv) {
   $scope.msgs = msgs;
   $scope.cnv = cnv;
   var cnvUrl = "Cnvs/" + $scope.cnv.id + "/Msgs"

   $scope.newMsg = function() {
      $scope.title = null;
      $scope.dlgTitle = "New Message";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Category/addMsgDlg.template.html',
         scope: $scope
      }).result
      .then(function(content) {
         return $http.post(cnvUrl, {"content": content});
      })
      .then(function() {
         return $http.get(cnvUrl);
      })
      .then(function(rsp) {
         $scope.msgs = rsp.data;
      })
      .catch(function(err) {
         console.log("Error: " + JSON.stringify(err));
      });
   };

}]);
