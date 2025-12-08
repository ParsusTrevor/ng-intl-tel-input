angular.module('ngIntlTelInput')
  .directive('ngIntlTelInput', ['ngIntlTelInput', '$log', '$window', '$parse',
    function (ngIntlTelInput, $log, $window, $parse) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attr, ctrl) {
          // Warning for bad directive usage.
          if ((!!attr.type && (attr.type !== 'text' && attr.type !== 'tel')) || elm[0].tagName !== 'INPUT') {
            $log.warn('ng-intl-tel-input can only be applied to a *text* or *tel* input');
            return;
          }

          var opts = {};

          // Set opts specified with directive attribute (fork feature)
          if (attr.ngIntlTelInput &&
              attr.$normalize(attr.ngIntlTelInput) !== 'ngIntlTelInput') {
            opts = scope.$eval(attr.ngIntlTelInput);
          }

          // Override initial country (support both for backwards compat)
          if (attr.initialCountry) {
            opts.initialCountry = attr.initialCountry;
          } else if (attr.defaultCountry) {
            opts.initialCountry = attr.defaultCountry;
          }

          // Initialize with per-instance options (fork feature)
          ngIntlTelInput.init(elm, opts);

          // Set Selected Country Data (upstream feature)
          function setSelectedCountryData(model) {
            var getter = $parse(model);
            var setter = getter.assign;
            setter(scope, elm.intlTelInput('getSelectedCountryData'));
          }
          // Handle Country Changes
          function handleCountryChange() {
            setSelectedCountryData(attr.selectedCountry);
          }
          // Country Change cleanup
          function cleanUp() {
            angular.element($window).off('countrychange', handleCountryChange);
          }
          // Selected Country Data
          if (attr.selectedCountry) {
            setSelectedCountryData(attr.selectedCountry);
            angular.element($window).on('countrychange', handleCountryChange);
            scope.$on('$destroy', cleanUp);
          }

          // Validation with extension support (fork feature)
          ctrl.$validators.ngIntlTelInput = function (value) {
            // if phone number is deleted / empty do not run phone number validation
            if (value || elm[0].value.length > 0) {
              var result = elm.intlTelInput('isValidNumber');
              if (result) {
                return true;
              }

              if (!opts.allowExtensions) {
                return false;
              }

              // Get validation error to see if this is because an extension was entered
              var error = elm.intlTelInput('getValidationError');
              if (typeof intlTelInputUtils !== 'undefined' &&
                  error === intlTelInputUtils.validationError.IS_POSSIBLE) {
                // Possible valid so considering valid
                return true;
              }

              return false;
            } else {
              return true;
            }
          };

          // Set model value to valid, formatted version with extension support (fork feature)
          ctrl.$parsers.push(function (value) {
            var extension = elm.intlTelInput('getExtension');
            return elm.intlTelInput('getNumber') + (extension ? 'x' + extension : '');
          });

          // Set input value to model value and trigger evaluation
          ctrl.$formatters.push(function (value) {
            if (value) {
              if (value.charAt(0) !== '+') {
                value = '+' + value;
              }
              elm.intlTelInput('setNumber', value);
              // Update value to number formatted by plugin (fork feature)
              value = elm.val();
            }
            return value;
          });
        }
      };
    }]);
