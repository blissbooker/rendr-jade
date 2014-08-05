'use strict';

var fs = require('fs');
var templateFinderFn = require('../shared/templateFinder');

module.exports = function (jade) {

    var templateFinder = templateFinderFn(jade);

    return {
        getLayout: function (name, entryPath, callback) {
            var layoutPath = entryPath + '/app/templates/' + name + '.jade';
            fs.readFile(layoutPath, 'utf8', function (err, str) {
                if (err) {
                    return callback(err);
                }
                var template = jade.compile(str, {
                    filename: '/app/templates/' + name + '.jade'
                });
                callback(null, templateFinder.extendTemplate(template));
            });
        }
    };

};
