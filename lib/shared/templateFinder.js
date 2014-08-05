'use strict';

var _ = require('underscore');
module.exports = function (jade) {

    /**
     * Provide a way for apps to specify that different template name patterns
     * should use different compiled template files.
     */
    var templatePatterns = [];
    var cachedTemplates = {};

    /**
     * binds helpers to a jade template
     */
    function extendTemplate(template) {
        var extendedTemplate = function (locals) {
            _.each(jade.helpers, function (fn, fnName) {
                locals[fnName] = fn.bind(locals);
            });
            return template.call(locals, locals);
        };
        extendedTemplate.extended = true;
        return extendedTemplate;
    }

    /**
     * Given a template name, return the compiled Handlebars template.
     */
    function getTemplate(templateName) {
        /**
         * Find the correct source file for this template.
         */
        var src = getSrcForTemplate(templateName);
        /**
         * Allow compiledTemplates to be created asynchronously.
         */
        if (!cachedTemplates[src]) {
            cachedTemplates[src] = require(src);
            if (typeof cachedTemplates[src] === 'function') {
                cachedTemplates[src] = cachedTemplates[src](jade);
            }
        }
        var template = cachedTemplates[src][templateName];
        // replace template with extendedtemplate
        if (!template) {
            throw new Error("template named '" + templateName + "' cannot be found");
        }
        if (!template.extended) {
            template = extendTemplate(template);
            cachedTemplates[src][templateName] = template;
        }
        return template;
    }

    /**
     * For a given template name, find the correct compiled templates source file
     * based on pattern matching on the template name.
     */
    function getSrcForTemplate(templateName) {
        var currentPattern = templatePatterns.filter(function (obj) {
            return obj.pattern.test(templateName);
        })[0];

        if (!currentPattern) {
            throw new Error('No pattern found to match template "' + templateName + '".');
        }

        return currentPattern.src;
    }

    return {
        getTemplate: getTemplate,
        getSrcForTemplate: getSrcForTemplate,
        templatePatterns: templatePatterns,
        extendTemplate: extendTemplate
    };
};
