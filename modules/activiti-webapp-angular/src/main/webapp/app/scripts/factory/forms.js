angular.module('activitiApp').factory('FormDataService', function ($resource) {
    var data = $resource('service/form/form-data?taskId=:taskId', {taskId: "@taskId"});
    return data;
});