app.controller('registerController',
 ['$scope', '$state', '$http','login', 'notifyDlg',
 function($scope, $state, $http, log, nDlg) {
   $scope.user = {role: 0};
   $scope.errors = [];
   
   $scope.registerUser = function() {
      $http.post("Prss", $scope.user)
      .then(function() {
         return nDlg.show($scope, "Registration succeeded. " +
          " Login automatically?", "Login", ["Yes", "No"]);
      })
      .then(function(btn) {
         if (btn == "Yes") {
            var userData = {
               "email": $scope.user.email, 
               "password": $scope.user.password
            };
            return log.login(userData);
         }
         else {
            $state.go('home');
         }
      })
      .then(function(user) {
         $scope.$parent.user = user;
         $state.go('home');
      })
      .catch(function(err) {
         $scope.errors = err.data;
      });
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
