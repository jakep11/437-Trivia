//Controller for correctly answered questions

app.controller('correctController',
 ['$scope', '$state','$rootScope', '$http', '$uibModal', 'notifyDlg', 'qsts',
 function($scope, $state, $rootScope, $http, $uibM, nDlg, qsts) {
   $scope.qsts = qsts;

   

}]);