

workshop = {};

(function (workshop) {

    workshop = workshop || {};

    var GUN_TYPE = Math.pow(2, 1);
    var WHEEL_TYPE = Math.pow(2, 2);
    var THRUSTER_TYPE = Math.pow(2, 3);

    var BULLET_TYPE = Math.pow(2, 0);
    var ROCKET_TYPE = Math.pow(2, 1);

    var partGrid = [];
    for (var i=0; i<5; i++) {
        partGrid.push([]);
        for (var j=0; j<5; j++) {
            partGrid[i].push(null);
        }
    }

    var partList = [];
    workshop.partList = partList;

    workshop.init = function () {
        var $cont = $('.left-container');
        for (var ctr=0; ctr<25; ctr++) {
            $div = $('<div>');
            $div.addClass('grid-square');
            $div.attr('id', ctr);
            if (ctr===12)  {
                $div.addClass('body2');
            } else {
                $div.droppable({
                    accept: '.part-thumb',
                    tolerance: 'intersect',
                    drop: function (e, ui) {
                        $(this).droppable('disable');
                        $d = $(ui.draggable);
                        $d.draggable('disable');
                        var partType;
                        if ($d.hasClass('machine-gun') || $d.hasClass('rpg')) {
                            partType = GUN_TYPE;
                        } else if ($d.hasClass('wheel')) {
                            partType = WHEEL_TYPE;
                        } else if ($d.hasClass('thruster')) {
                            partType = THRUSTER_TYPE;
                        }
                        var id = $(this).attr('id');
                        var x = id % 5;
                        var y = parseInt(id/5);

                        partList.push({ type: partType, position: { x: x, y: y } });
                    }
                });
            }
            $cont.append($div);         
        }

        $cont = $('.right-container');
        $cont.droppable({
            accept: '.part-thumb',
        });

        /*for (var ctr=0; ctr<25; ctr++) {
            var $div = $('<div>');
            var divClass;
            var a = ctr%4
            if (a == 0) {
                divClass = 'body1';
            } else if (a == 1) {
                divClass = 'thruster';
            } else if (a == 2) {
                divClass = 'machine-gun';
            } else {
                divClass = 'wheel';
            }
            $div.addClass(divClass);
            $div.addClass('part-thumb');
            $cont.append($div);

            $div.draggable({
                snap: '.grid-square',
                revert: 'invalid'
            });
        }*/
        $('.part-thumb').draggable({
            snap: '.grid-square',
            revert: 'invalid'
        });

        $('.save-btn').on('click', function () {
            localStorage.setItem('useDefault', 'false');
            jsonList = JSON.stringify(partList);
            localStorage.setItem('partList', jsonList);
            document.location.href = '/robots';
        });

        $('.default-btn').on('click', function () {
            localStorage.setItem('useDefault', 'true');
            document.location.href = '/robots';
        });
    }
})(workshop);

$(workshop.init);