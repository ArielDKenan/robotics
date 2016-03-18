

workshop = {};

(function (workshop) {
    workshop = workshop || {};

    workshop.init = function () {
        var $cont = $('.left-container');
        for (var ctr=0; ctr<12; ctr++) {
            $div = $('<div>');
            $div.addClass('grid-square');
            $cont.append($div);

            $div.droppable({
                accept: '.part-thumb',
                tolerance: 'intersect'
            });
        }

        $cont = $('.right-container');
        $cont.droppable({
            accept: '.part-thumb'
        });

        for (var ctr=0; ctr<12; ctr++) {
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
        }
    }
})(workshop);

$(workshop.init);