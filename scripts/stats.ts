
module stats {

    class StatsController {

        selectedProjectile: number;

        constructor($scope) {

            $scope.projectiles = [{
                id: 1,
                type: parts.BULLET_TYPE,
                name: 'Bullets'
            },
            {
                id: 2,
                type: parts.ROCKET_TYPE,
                name: 'Rockets'
            }];

            $scope.changeWeapon = () => {
                console.log(this.selectedProjectile);
                robots.player.selectedProjectile = this.selectedProjectile;
            }

        }

    }

    var app = angular.module('stats', []);
    app.controller('StatsController', StatsController);

}
