/**
 * Created by Jon Stewart on 1/10/2016.
 */

declare interface String {
    reverse: Function;
}

String.prototype.reverse = function () { return this.valueOf().split('').reverse().join(''); };

var util = {

    isPlainObject: function (obj) {

        if ('object' !== typeof obj) {
            return false;
        }

        for (p in obj) {
            if (obj.hasOwnProperty(p)) return false;
        }

        return true;

    },

    __extends: function () {

        var options, name, src, copy, target = {},
            k = 0, l = arguments.length, deep = false, clone, isArray = false;
        if ('boolean' === typeof arguments[0]) {
            deep = arguments[0];
            k++;
        }
        for (; k < l; k++) {
            if ((options = arguments[k]) !== null) {
                for (name in options) {
                    copy = options[name];
                    if ('undefined' == typeof copy) continue;
                    if (deep) target[name] = this.cloneObject(copy);
                    else target[name] = copy;
                }
            }
        }
        return target;

    },

    __extend: function () {

        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1, l = arguments.length,
            deep = false;

        if (typeof target === "boolean") {

            deep = target;
            target = arguments[i++] || {};

        }

        if (typeof target !== 'object' && typeof target !== 'function') {

            target = {};
            // throw new Error('__extend function requires target to be an object or function.');

        }

        if (i === l) {

            // target = this;
            options = this;
            i--;

        }

        for (; i < l; i++) { // edge case?: no arguments

            if ((options = options === this ? options : arguments[i]) != null) { // nonono no no no.///......

                for (name in options) {

                    src = target[name];
                    copy = options[name];

                    if (target === copy) continue;

                    if (deep && (copy && (this.isPlainObject(copy) || (copyIsArray = copy.constructor === Array)))) {

                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && src.constructor === Array ? src : [];
                        } else {
                            clone = src && this.isPlainObject(src) ? src : {};
                        }

                        target[name] = this.__extend(deep, clone, copy);

                    } else {

                        if (copy !== undefined) target[name] = copy;

                    } // end if

                } // end for in

            } // end if

        } // end for

        return target;

    },

    // Creates deep-ish copy of an object
    cloneObject: function (obj) {

        var copy;
        // if ('undefined' === typeof obj || null === obj || 'object' !== typeof obj) return obj;
        if ('object' !== typeof obj) return obj;
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
        } else if (Array === obj.constructor) {
            copy = [];
            for (var i = 0; i < obj.length; i++) {
                copy[i] = this.cloneObject(obj[i]);
            }
        } else if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = this.cloneObject(obj[attr]);
            }
        } else throw new Error("Couldn't clone object!");
        return copy;

    },

    defined: function (val) {

        return typeof val !== 'undefined' && val !== null;

    },

    incrementingArr: function (n) {

        var fn, context;
        if (arguments[1] === undefined) {
            fn = Number.call;
            context = Number;
        } else {
            fn = Function.call;
            context = this.randNumber.bind(null, arguments[2] ? arguments[1] : 0, arguments[2] || arguments[1]);
        }
        return Array.apply(null, { length: n }).map(fn, context);

    },

    getExecutedLine: function () {

        function getErrorObject() { try { throw Error('') } catch (err) { return err; } }
        var err = getErrorObject();
        var caller_line = err.stack.split("\n")[6];
        // var caller_line = (new Error).stack.split("\n")[4]
        var index = caller_line.indexOf("at ");
        var clean = caller_line.slice(index + 2, caller_line.length);
        var final = clean.slice(0, clean.indexOf('('));
        final += clean.slice(clean.lastIndexOf('/'), -1);
        return final;

    },

    debugMode: true,

    debugMsg: function (str, error) {

        if (this.debugMode) {
            // var printer = error ? console.warn : console.debug;
            var text = '%c' + str;
            console.debug(text, 'color: #0F0; background: #000');
            console.debug('%cExecuted at line:' + this.getExecutedLine(), 'color: #0CF; background: #000');
        }

    },

    shuffleArray: function (arr) {

        for (var j, temp, i = arr.length; i; j = Math.floor(Math.random() * i),
            temp = arr[--i], arr[i] = arr[j], arr[j] = temp);

    },

    randNumber: function (a, b) {

        if (b === undefined || b === null) {
            b = a;
            a = 0;
        }
        return Math.floor(Math.random() * (b - a + 1)) + a;

    },

    randElement: function (arr) {

        if (typeof arr == 'undefined' || arr == null || arr.constructor !== Array) throw new Error('I NEED ARRAY!');
        if (arr.length === 0) throw new Error('EMPTY ARRAY!');
        return arr[this.randNumber(arr.length - 1)];

    },

    randProperty: function (obj) {

        if (typeof obj == 'undefined' || obj == null || !(obj instanceof Object)) throw new Error('randProperty() requires an object');
        var ctr = 0, oSize = this.objectSize(obj), randNum = this.randNumber(oSize - 1);
        if (!oSize) throw new Error('Cannot use randProperty() on empty object.');
        for (var key in obj) if (obj.hasOwnProperty(key)) if (ctr++ === randNum) return key;

    },

    objectSize: function (obj) {

        var size = 0;
        for (var key in obj)
            if (obj.hasOwnProperty(key)) size++;
        return size;

    }

};