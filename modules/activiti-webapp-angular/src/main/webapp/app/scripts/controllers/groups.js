
angular.module('activitiApp').controller('GroupsCtrl', function ($scope, $rootScope, $location, GroupService, $modal) {
    if (typeof  $rootScope.loggedin == 'undefined' || $rootScope.loggedin == false) {
        $location.path('/login');
        return;
    }
    $scope.groups = GroupService.get();

    /**
     * Initial data of new group
     * @type {{id: string, name: string, type: string}}
     */
    $scope.newGroup = {"id": "", "name": "", "type": "security-role"};

    /**
     * Create group function
     * @param newGroup
     */
    $scope.newGroupSubmited=false;
    $scope.createGroup = function (newGroup) {
        var group = new GroupService(newGroup);
        group.name = newGroup.name;
        group.id = newGroup.id;
        group.$save(function (u, putResponseHeaders) {
            $scope.groups.data.push(u);
            $scope.isCollapsed = true;
            $scope.newGroup.id = "";
            $scope.newGroup.name = "";
        });
    };

    /**
     * Controler for handling modal actions
     * @param $scope
     * @param $modalInstance
     * @param newGroup
     * @constructor
     */
    var ModalInstanceCtrl = function ($scope, $modalInstance, newGroup) {
        $scope.newGroup = newGroup;
        $scope.ok = function () {
            $modalInstance.close($scope.newGroup);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    /**
     * Open Modal
     */
    $scope.open = function () {
        var modalInstance = $modal.open({
            templateUrl: 'views/modals/createGroup.html',
            controller: ModalInstanceCtrl,
            resolve: {
                newGroup: function () {
                    return $scope.newGroup;
                }
            }
        });
        modalInstance.result.then(function (newGroup) {
            $scope.createGroup(newGroup);
        }, function () {
        });
    };

    /**
     * Remove Group
     * @param group
     */
    $scope.removeGroup = function (group) {
        GroupService.delete({"group": group.id}, function (data) {
            $scope.groups = GroupService.get();
        });
    };

    $scope.cancel = function () {
        $scope.newGroup.id = "";
        $scope.newGroup.name = "";
    };

    $scope.query = "";
});
