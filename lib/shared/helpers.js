'use strict';

// Lazy-required.
var BaseView = null;

/**
 * Get a property that is being passed down through helpers, such as `_app`
 * or `_view`. It can either live on the context, i.e. `this._app`, or in the
 * `options.data` object passed to the helper, i.e. `options.data._app`, in the
 * case of a block helper like `each`.
 */
function getProperty(key, context, options) {
    return context[key] || (options.data || {})[key];
}

module.exports = function (jade, getTemplate) {

    return {
        view: function (viewName, options) {
            var ViewClass, viewOptions, view;
            BaseView = BaseView || require('rendr/shared/base/view');
            options = options || {};
            viewOptions = options;

            // Pass through a reference to the app.
            var app = getProperty('_app', this, options);
            if (app) {
                viewOptions.app = app;
                viewName = app.modelUtils.underscorize(viewName);
            } else {
                throw new Error("An App instance is required when rendering a view, it could not be extracted from the options.");
            }

            // Pass through a reference to the parent view.
            var parentView = getProperty('_view', this, options);
            if (parentView) {
                viewOptions.parentView = parentView;
            }

            // get the Backbone.View based on viewName
            ViewClass = BaseView.getView(viewName, app.options.entryPath);
            view = new ViewClass(viewOptions);

            // create the outerHTML using className, tagName
            return view.getHtml();
        },

        partial: function (templateName, options) {
            var locals, template;

            template = getTemplate(templateName);

            locals = options || {};

            locals._app = getProperty('_app', this, options);
            return template(locals);
        },

        json: function (object, spacing) {
            return JSON.stringify(object, null, spacing);
        }

    };
};
