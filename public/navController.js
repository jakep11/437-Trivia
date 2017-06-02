app.controller('navBar', ['$scope','$rootScope', '$state', 'login', 'errMap', 
 function($scope,$rootScope, $state, login, errMap) {
   $rootScope.language = "EN";
   $scope.errMap = errMap;

   $scope.logout = function() {
      var response = login.logout();
      $rootScope.user = null;
      $state.go('home');
   }
}]);