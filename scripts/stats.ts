
module stats {

    class StatsController {

        selectedProjectile: number = 1;
        motorSpeed: number;

        constructor($scope) {

            $scope.projectiles = [{
                id: 0,
                type: parts.ROCKET_TYPE,
                name: 'Rockets'
            },
            {
                id: 1,
                type: parts.BULLET_TYPE,
                name: 'Bullets'
            }];

            $scope.changeWeapon = () => {
                robots.player.selectedProjectile = this.selectedProjectile;
            }

            $scope.changeMotorSpeed = () => {
                parts.motorSpeed = this.motorSpeed;
            }

            $scope.velocity = { x: 0, y: 0 };
            /*$scope.$watch(() => {
                if (robots.player && robots.player.body && robots.player.body.body)
                    return robots.player.body.body.velocity
                else
                    return { x: 0, y: 0 };
            }, (newVal) => {
                if (typeof newVal !== 'undefined') $scope.velocity = newVal;
            });*/
            setInterval(() => {
                if (robots.player && robots.player.body && robots.player.body.body) {
                    $scope.velocity = robots.player.body.body.velocity;
                    $scope.$apply();
                    //console.log($scope.x);
                }
            }, 200);

        }

    }

    var app = angular.module('stats', []);
    app.controller('StatsController', StatsController);

}
