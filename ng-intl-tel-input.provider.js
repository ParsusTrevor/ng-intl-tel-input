angular.module('ngIntlTelInput')
  .provider('ngIntlTelInput', function () {
    var me = this;
    var props = {};
    var setFn = function (obj) {
      if (typeof obj === 'object') {
        for (var key in obj) {
          props[key] = obj[key];
        }
      }
    };
    me.set = setFn;

    me.$get = ['$log', function ($log) {
      return Object.create(me, {
        init: {
          value: function (elm, opts) {
            if (!window.intlTelInputUtils) {
              $log.warn('intlTelInputUtils is not defined. Formatting and validation will not work.');
            }
            // Merge provider props with per-instance opts (opts takes precedence)
            var mergedOpts = {};
            for (var key in props) {
              mergedOpts[key] = props[key];
            }
            if (opts) {
              for (var key in opts) {
                mergedOpts[key] = opts[key];
              }
            }
            elm.intlTelInput(mergedOpts);
          }
        },
      });
    }];
  });
