app.controller('loginController',
 ['$scope','$rootScope', '$state', 'login', 'notifyDlg',
 function($scope, $rootScope, $state, login, nDlg) {

   $scope.login = function() {
      login.login($scope.user)
      .then(function(user) {
         $rootScope.user = user;
         $state.go('home');
      })
      .catch(function() {
         nDlg.show($scope, "That name/password is not in our records",
          "Error");
      });
   };
}]);
