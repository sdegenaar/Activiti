angular.module('activitiApp').factory('TasksModalService', function ($modal,FormDataService,TasksService,$rootScope) {

    var ModalInstanceCtrl = function ($scope, $modalInstance,moment, taskDetailed) {
        $scope.taskDetailed = taskDetailed;

        var emitRefresh = function()
        {
            $rootScope.$emit("refreshData",{});
        }

        $scope.cancel = function (taskDetailed) {
            $modalInstance.dismiss('cancel');
        };

        $scope.finish = function (detailedTask) {

            var objectToSave = {
                "taskId": detailedTask.id,
                properties: []
            }

            if (typeof detailedTask.propertyForSaving != "undefined") {
                for (var key in detailedTask.propertyForSaving) {
                    var forObject = detailedTask.propertyForSaving[key];

                    if (!forObject.writable) {//if this is not writeable property do not use it
                        continue;
                    }

                    if (forObject.value != null) {
                        var elem = {
                            "id": forObject.id,
                            "value": forObject.value
                        };
                        if (typeof forObject.datePattern != 'undefined') {//format
                            var date = new Date(forObject.value);
                            elem.value = moment(date).format(forObject.datePattern.toUpperCase());
                        }
                        objectToSave.properties.push(elem);
                    }
                }

                var saveForm = new FormDataService(objectToSave);
                saveForm.$save(function () {
                    //$scope.loadTasks();
                    emitRefresh();
                    $modalInstance.dismiss('cancel');
                });
            } else {
                var action = new TasksService();
                action.action = "complete";
                action.$save({"taskId": detailedTask.id}, function () {
                    emitRefresh();
                    $modalInstance.dismiss('cancel');
                });
            }

        };


        $scope.assignMe = function (detailedTask) {
            var taskToEdit = new TasksService({"assignee": $rootScope.username});
            taskToEdit.$update({"taskId": detailedTask.id}, function () {
                emitRefresh();
            });

        }

        $scope.takeOwnerShip = function (detailedTask) {
            var taskToEdit = new TasksService({"owner": $rootScope.username});
            taskToEdit.$update({"taskId": detailedTask.id}, function () {
                emitRefresh();
            });
        }

        $scope.openDatePicker = function (obj, $event) {
            $event.preventDefault();
            $event.stopPropagation();

            obj.opened = true;
        };

        $scope.setFormEnum = function (enumm, item) {
            item.value = enumm.id;
            item.name = enumm.name;
        };

    };



    var loadTaskForm  = function loadTaskForm(task) {
        FormDataService.get({"taskId": task.id}, function (data) {

            var propertyForSaving = {};

            for (var i = 0; i < data.formProperties.length; i++) {
                var elem = data.formProperties[i];
                propertyForSaving[elem.id] = {
                    "value": elem.value,
                    "id": elem.id,
                    "writable": elem.writable
                };

                if (elem.datePattern != null) {//if date
                    propertyForSaving[elem.id].opened = false; //for date picker
                    propertyForSaving[elem.id].datePattern = elem.datePattern;
                }

                if (elem.required == true && elem.type == "boolean") {
                    if (elem.value == null) {
                        propertyForSaving[elem.id].value = false;
                    }
                }
            }

            task.form = data;
            task.propertyForSaving = propertyForSaving;
        }, function (data) {

            if (data.data.statusCode == 404) {
                alert("there was an error");
            }

        });

    };


    var factory = {
        loadForm: function (task) {
            var modalInstance = $modal.open({
                templateUrl: 'views/modals/taskForm.html',
                controller: ModalInstanceCtrl,

                resolve: {
                    taskDetailed: function () {
                        return task;
                    }
                }
            });

            modalInstance.result.then(function (taskDetailed) {

            }, function () {

            });
            loadTaskForm(task);
        },
        showdialog: function (task) {

        }
    };
    return factory;
});