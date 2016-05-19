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

angular.module('mm.addons.mod_certificate')

/**
 * Certificate index controller.
 *
 * @module mm.addons.mod_certificate
 * @ngdoc controller
 * @name mmaModCertificateIndexCtrl
 */
.controller('mmaModCertificateIndexCtrl', function($scope, $stateParams, $mmaModCertificate, $mmUtil, $q, $mmCourse) {
    var module = $stateParams.module || {},
        courseid = $stateParams.courseid,
        certificate;

    $scope.title = module.name;
    $scope.description = module.description;
    $scope.courseid = courseid;

    // Convenience function to get Certificate data.
    function fetchCertificate(refresh) {
        return $mmaModCertificate.getCertificate(courseid, module.id).then(function(certificatedata) {
            certificate = certificatedata;
            $scope.title = certificate.name || $scope.title;
            $scope.description = certificate.intro || $scope.description;
            $scope.certificate = certificate;

            // Requeriments for issue certificates not met yet, ommit try to download already issued certificates.
            if (certificate.requiredtimenotmet) {
                return $q.when();
            }

            // Every time we access we call the issue certificate WS, this may fail if the user is connected, so we must retrieve
            // the issued certificate to use the cache on failure.
            return $mmaModCertificate.issueCertificate(certificate.id).finally(function() {
                return $mmaModCertificate.getIssuedCertificates(certificate.id).then(function(issues) {
                    $scope.issues = issues;
                });
            });
        }).catch(function(message) {
            if (!refresh) {
                // Some call failed, retry without using cache since it might be a new activity.
                return refreshAllData();
            }

            if (message) {
                $mmUtil.showErrorModal(message);
            } else {
                $mmUtil.showErrorModal('Error while getting the certificate', true);
            }
            return $q.reject();
        });
    }

    // Convenience function to refresh all the data.
    function refreshAllData() {
        var p1 = $mmaModCertificate.invalidateCertificate(courseid),
            p2 = certificate.requiredtimenotmet ? $mmaModCertificate.invalidateIssuedCertificates(certificate.id) : $q.when();
            p3 = certificate.requiredtimenotmet ? $mmaModCertificate.invalidateDownloadedCertificates(module.id) : $q.when();

        return $q.all([p1, p2, p3]).finally(function() {
            return fetchCertificate(true);
        });
    }

    $scope.downloadCertificate = function() {

        var modal = $mmUtil.showModalLoading();

        // Extract the first issued, file URLs are always the same.
        var issuedCertificate = $scope.issues[0];

        $mmaModCertificate.downloadCertificate(issuedCertificate, module.id)
        .catch(function(error) {
            if (error && typeof error == 'string') {
                $mmUtil.showErrorModal(error);
            } else {
                $mmUtil.showErrorModal('Error while downloading the certificate', true);
            }
        }).finally(function() {
            modal.dismiss();
        });
    };

    fetchCertificate().then(function() {
        $mmaModCertificate.logView(certificate.id).then(function() {
            $mmCourse.checkModuleCompletion(courseid, module.completionstatus);
        });
    }).finally(function() {
        $scope.certificateLoaded = true;
    });

    // Pull to refresh.
    $scope.doRefresh = function() {
        refreshAllData().finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

});