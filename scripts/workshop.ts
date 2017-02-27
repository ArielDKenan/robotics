
module workshop {

    // var GUN_TYPE = Math.pow(2, 1);
    // var WHEEL_TYPE = Math.pow(2, 2);
    // var THRUSTER_TYPE = Math.pow(2, 3);

    // var BULLET_TYPE = Math.pow(2, 0);
    // var ROCKET_TYPE = Math.pow(2, 1);

    export var partList: Array<any> = [];

    export var init: Function = () => {

        var $cont = $('.parts-holder');
        for (var ctr=0; ctr<25; ctr++) {
            var $div = $('<div>');
            $div.addClass('grid-square');
            $div.attr('id', ctr);
            $cont.append($div);

            if (ctr===12)  {
                $div.addClass('body2');
            } else {
                $div.droppable({
                    accept: '.part-thumb',
                    tolerance: 'intersect',
                    drop: function (e, ui) {
                        $(this).droppable('disable');
                        var $d = $(ui.draggable);
                        $d.draggable('disable');

                        var partType;
                        if ($d.hasClass('machine-gun') || $d.hasClass('rpg')) {
                            partType = parts.GUN_TYPE;
                        } else if ($d.hasClass('wheel')) {
                            partType = parts.WHEEL_TYPE;
                        } else if ($d.hasClass('thruster')) {
                            partType = parts.THRUSTER_TYPE;
                        }

                        var id = parseInt($(this).attr('id'));
                        var x = id % 5;
                        var y = id / 5;
                        // var x = id / 5;
                        // var y = id % 5;

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

        $('.part-thumb').draggable({
            snap: '.grid-square',
            revert: 'invalid'
        });

        $('.save-btn').on('click', function () {
            localStorage.setItem('useDefault', 'false');
            var jsonList = JSON.stringify(partList);
            localStorage.setItem('partList', jsonList);
            document.location.href = './arena.html';
        });

        $('.default-btn').on('click', function () {
            localStorage.setItem('useDefault', 'true');
            document.location.href = './arena.html';
        });

        $('.reset-btn').on('click', function (){
            location.reload();
        });
        
    }

}
