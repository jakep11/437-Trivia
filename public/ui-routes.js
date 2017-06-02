
app.config(['$stateProvider', '$urlRouterProvider',
   function($stateProvider, $router) {

      //redirect to home if path is not matched
      $router.otherwise("/");

      $stateProvider
      .state('home',  {
         url: '/',
         templateUrl: 'Home/home.template.html',
         controller: 'homeController',
      })
      .state('login', {
         url: '/login',
         templateUrl: 'Login/login.template.html',
         controller: 'loginController',
      })
      .state('register', {
         url: '/register',
         templateUrl: 'Register/register.template.html',
         controller: 'registerController',
      })
      .state('cnvDetail', {
         url: '/cnvDetail/:cnvId',
         templateUrl: 'Conversation/cnvDetail.template.html',
         controller: 'cnvDetailController',
         resolve: {
            msgs: ['$q', '$http', '$stateParams', function($q, $http, 
             $stateParams) {
               return $http.get('/Cnvs/' + $stateParams.cnvId + '/Msgs')
               .then(function(response) {
                  return response.data;
               });
            }],
            cnv: ['$q', '$http', '$stateParams', function($q, $http, 
             $stateParams) {
               return $http.get('/Cnvs/' + $stateParams.cnvId)
               .then(function(response) {
                  return response.data;
               });
            }] 
         }
      })
      .state('cnvOverview', {
         url: '/cnvs',
         templateUrl: 'Conversation/cnvOverview.template.html',
         controller: 'cnvOverviewController',
         resolve: {
            cnvs: ['$q', '$http', function($q, $http) {
               return $http.get('/Cnvs')
               .then(function(response) {
                  return response.data;
               });
            }],
            prsID: function() {
               return null;
            }
         }
      })
      .state('myCnvOverview', {
         url: '/cnvs/:prsID',
         templateUrl: 'Conversation/cnvOverview.template.html',
         controller: 'cnvOverviewController',
         resolve: {
            cnvs: ['$q', '$http', '$stateParams', function($q, $http, 
             $stateParams) {
               return $http.get('/Cnvs?owner=' + $stateParams.prsID)
               .then(function(response) {
                  return response.data;
               });
            }],
            prsID: ['$stateParams', function($stateParams) {
               return $stateParams.prsID;
            }]
         }
      });
   }]);
