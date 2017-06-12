// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.addons.mod_data', ['mm.core'])

.constant('mmaModDataComponent', 'mmaModData')

.config(function($stateProvider) {

    $stateProvider

    .state('site.mod_data', {
        url: '/mod_data',
        params: {
            module: null,
            courseid: null,
            group: null
        },
        views: {
            'site': {
                controller: 'mmaModDataIndexCtrl',
                templateUrl: 'addons/mod/data/templates/index.html'
            }
        }
    });

})

.config(function($mmCourseDelegateProvider, $mmContentLinksDelegateProvider, $mmCoursePrefetchDelegateProvider) {
    $mmCourseDelegateProvider.registerContentHandler('mmaModData', 'data', '$mmaModDataHandlers.courseContent');
    $mmCoursePrefetchDelegateProvider.registerPrefetchHandler('mmaModData', 'data', '$mmaModDataPrefetchHandler');
    $mmContentLinksDelegateProvider.registerLinkHandler('mmaModData:index', '$mmaModDataHandlers.indexLinksHandler');
});