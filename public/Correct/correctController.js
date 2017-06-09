//Controller for correctly answered questions
app.controller('correctController',
 ['$scope', '$state', 'anrs',
    function($scope, $state, anrs) {
       $scope.anrs = anrs;
    }]);
