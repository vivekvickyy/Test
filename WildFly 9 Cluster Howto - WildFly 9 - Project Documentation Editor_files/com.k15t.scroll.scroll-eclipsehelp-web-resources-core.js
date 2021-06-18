(function($) {
	var radioCheck = /radio|checkbox/i,
		keyBreaker = /[^\[\]]+/g,
		numberMatcher = /^[\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?$/;

	var isNumber = function( value ) {
		if ( typeof value == 'number' ) {
			return true;
		}

		if ( typeof value != 'string' ) {
			return false;
		}

		return value.match(numberMatcher);
	};

	$.fn.extend({

        paramsToForm : function(obj, prefix, inArray) {
            if (!prefix) {
                // Execute this only once at the top level. We need to uncheck them all, because
                // only those inside the preset are checked again. Those not inside the preset are
                // not handled below at all -> uncheck them here.
                $("input").filter(":checkbox").filter(".omit-unchecked").attr("checked", false).change();
            }

            inArray = (inArray === undefined) ? false : inArray;

            $.each(obj, function(index, value) {

                if( KJS.getType(value) === 'array' ) {
                    var localPrefix = ( !prefix ? index : (prefix + "[@" + index + "]") );
                    $.each(obj, function(index, value) {
                        $(this).paramsToForm(value, localPrefix, true);
                    });
                  // dont use "value instanceof Object", because "(function(){} instanceof Object) === true"
                } else if ( KJS.getType(value) === 'object' ) {
                    var localPrefix = ( !prefix ? index : (prefix + (inArray ? "" : "[" + index + "]") ) );
                    $(this).paramsToForm(value, localPrefix);
                } else {
                    var localPrefix = ( !prefix ? index : (prefix + "[" + index + "]") );

                    $("select[name=\"" + localPrefix + "\"], input[name=\"" + localPrefix + "\"], textarea[name=\"" + localPrefix + "\"]").each(function(idx, val) {
                        if($(this).is(":radio")) {
                            value = value || ""; // set value if null or undefined
                            var id = $(this).attr('id');
                            if( id && id === value) { // set radio button by id
                                $(this).attr("checked", true).change();
                            }else if( $(this).val() === value ){ // set radio button by group name
                                $( 'input[name="'+localPrefix+'"]').val( [value] ).change();
                                return false;
                            }
                            
                        } else if($(this).is(":checkbox")) {
                            if ($(this).hasClass('omit-unchecked')) {
                                $(this).filter("[value='" + value + "']").attr("checked", true).change();
                            } else {
                                // convert value to boolean (could be a string)
                                var booleanValue = false;

                                if((typeof(value) === "string") && (value === 'true')) {
                                    booleanValue = true;
                                } else if(typeof(value) === "boolean") {
                                    booleanValue = value;
                                }
                                $(this).attr("checked", booleanValue).change();
                            }
                        } else if($(this).is("select")) {
                           var $this = $(this);
                           $this.val(value).change();
                           // in case select does not have the option with that value
                           if(($this.val() == null || $this.val().length === 0) && !$this.hasClass('no-option-create')){
                              // create new option and append it to select
                              var newOption = jQuery('<option />',{
                                 'text' : value,
                                 'value' : value
                              });
                              $this.append( newOption );
                              $this.val(value).change();
                           }
                           

                        } else {
                            value = ( (value===null || value===undefined)? "" : value ); // "null" content in textfields
                            $(this).val(value);
                            
                        }
                    });

                    //$("select").val("com.k15t.scroll.scroll-publisher:html-default-template");

                }
            });

        },

		/**
		 * @parent dom
		 * @download jquery/dist/jquery.formparams.js
		 * @plugin jquery/dom/form_params
		 * @test jquery/dom/form_params/qunit.html
		 * <p>Returns an object of name-value pairs that represents values in a form.
		 * It is able to nest values whose element's name has square brackets. </p>
		 * Example html:
		 * @codestart html
		 * &lt;form>
		 *   &lt;input name="foo[bar]" value='2'/>
		 *   &lt;input name="foo[ced]" value='4'/>
		 * &lt;form/>
		 * @codeend
		 * Example code:
		 * @codestart
		 * $('form').formParams() //-> { foo:{bar:2, ced: 4} }
		 * @codeend
		 *
		 * @demo jquery/dom/form_params/form_params.html
		 *
		 * @param {Boolean} [convert] True if strings that look like numbers and booleans should be converted.  Defaults to true.
		 * @return {Object} An object of name-value pairs.
		 */
		formParams: function( convert ) {
			if ( this[0].nodeName.toLowerCase() == 'form' && this[0].elements ) {

				return jQuery(jQuery.makeArray(this[0].elements)).getParams(convert);
			}
			return jQuery("input[name], textarea[name], select[name]", this[0]).getParams(convert);
		},
		getParams: function( convert ) {
			var data = {},
				current;

			convert = (convert === undefined) ? true : convert;

			this.each(function() {
				var el = this,
					type = el.type && el.type.toLowerCase();

                //if we are submit, ignore
				if ((type == 'submit') || !el.name ) {
					return;
				}

				var key = el.name,
					value = $.fn.val.call([el]) || $.data(el, "value"),
					isRadioCheck = radioCheck.test(el.type),
					parts = key.match(keyBreaker),
					write = !isRadioCheck || !! el.checked,
					//make an array of values
					lastPart;

                // add unchecked checkboxes with value=false
                if(!write && /checkbox/i.test(el.type)) {
                    if ($(el).hasClass('omit-unchecked')) {
                        return;
                    }
                    write = true;
                    value = "false";
                }

				if ( convert ) {
					if ( isNumber(value) ) {
						value = parseFloat(value);
					} else if ( value === 'true' || value === 'false' ) {
						value = (value === 'true');
					}

				}

				// go through and create nested objects
				current = data;
				for ( var i = 0; i < parts.length - 1; i++ ) {

                    var key = (parts[i].indexOf("@") != 0) ? parts[i] : parts[i].substring(1);
                    var isArray = (parts[i].indexOf("@") == 0);

					if (!current[key]) {
                        if(isArray) {
                            // create an array
                            current[key] = [];
                            current[key].push({});
                            current = current[key][0];
                        } else {
                            // create an object
						    current[key] = {};
					        current = current[key];
                        }
					} else {
                        if($.isArray(current[key])) {
                            current[key].push({});
                            current = current[key][current[key].length-1];
                        } else if(typeof(current[key]) === "object") {
                            current = current[key];
                        }
                    }
				}
				lastPart = parts[parts.length - 1];

             if(write) {
                 current[lastPart] = value;
             }

			});
			return data;
		}
	});

})(jQuery);

/*
 * Javascript Humane Dates
 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
 * Re-write by Zach Leatherman (zachleat.com)
 *
 * Adopted from the John Resig's pretty.js
 * at http://ejohn.org/blog/javascript-pretty-date
 * and henrah's proposed modification
 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
 *
 * Licensed under the MIT license.
 */

function humaneDate(date, compareTo) {
    var lang = {
        ago: SCROLL.i18n.humane.ago,
        now: SCROLL.i18n.humane.now,
        minute: SCROLL.i18n.humane.minute,
        minutes: SCROLL.i18n.humane.minutes,
        hour: SCROLL.i18n.humane.hour,
        hours: SCROLL.i18n.humane.hours,
        day: SCROLL.i18n.humane.days,
        days: SCROLL.i18n.humane.days,
        week: SCROLL.i18n.humane.week,
        weeks: SCROLL.i18n.humane.weeks,
        month: SCROLL.i18n.humane.month,
        months: SCROLL.i18n.humane.months,
        year: SCROLL.i18n.humane.year,
        years: SCROLL.i18n.humane.years
    },
            formats = [
                [60, lang.now],
                [3600, lang.minute, lang.minutes, 60],
                // 60 minutes, 1 minute
                [86400, lang.hour, lang.hours, 3600],
                // 24 hours, 1 hour
                [604800, lang.day, lang.days, 86400],
                // 7 days, 1 day
                [2628000, lang.week, lang.weeks, 604800],
                // ~1 month, 1 week
                [31536000, lang.month, lang.months, 2628000],
                // 1 year, ~1 month
                [Infinity, lang.year, lang.years, 31536000],
                // Infinity, 1 year
            ],
            isString = typeof date == 'string',
            date = isString ?
                    new Date(('' + date).replace(/-/g, "/").replace(/[TZ]/g, " ")) :
                    date,
            compareTo = compareTo || new Date,
            seconds = (compareTo - date +
                    (compareTo.getTimezoneOffset() -
                        // if we received a GMT time from a string, doesn't include time zone bias
                        // if we got a date object, the time zone is built in, we need to remove it.
                            (isString ? 0 : date.getTimezoneOffset())
                            ) * 60000
                    ) / 1000,
            token;

    if (seconds < 0) {
        seconds = Math.abs(seconds);
        token = '';
    } else {
        token = ' ' + lang.ago;
    }

    /*
     * 0 seconds && < 60 seconds        Now
     * 60 seconds                       1 Minute
     * > 60 seconds && < 60 minutes     X Minutes
     * 60 minutes                       1 Hour
     * > 60 minutes && < 24 hours       X Hours
     * 24 hours                         1 Day
     * > 24 hours && < 7 days           X Days
     * 7 days                           1 Week
     * > 7 days && < ~ 1 Month          X Weeks
     * ~ 1 Month                        1 Month
     * > ~ 1 Month && < 1 Year          X Months
     * 1 Year                           1 Year
     * > 1 Year                         X Years
     *
     * Single units are +10%. 1 Year shows first at 1 Year + 10%
     */

    function normalize(val, single) {
        var margin = 0.1;
        if (val >= single && val <= single * (1 + margin)) {
            return single;
        }
        return val;
    }


    for (var i = 0, format = formats[0]; formats[i]; format = formats[++i]) {
        if (seconds < format[0]) {
            if (i === 0) {
                // Now
                return format[1];
            }

            var val = Math.ceil(normalize(seconds, format[3]) / (format[3]));
            return val +
                    ' ' +
                    (val != 1 ? format[2] : format[1]) +
                    (i > 0 ? token : '');
        }
    }
}
;
/*
 * jQuery validation plug-in 1.7
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright (c) 2006 - 2008 Jörn Zaefferer
 *
 * $Id: jquery.validate.js 6403 2009-06-17 14:27:16Z joern.zaefferer $
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function($) {

$.extend($.fn, {
	// http://docs.jquery.com/Plugins/Validation/validate
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if (!this.length) {
			options && options.debug && window.console && console.warn( "nothing selected, can't validate, returning nothing" );
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data(this[0], 'validator');
		if ( validator ) {
			return validator;
		}

		validator = new $.validator( options, this[0] );
		$.data(this[0], 'validator', validator);

		if ( validator.settings.onsubmit ) {

			// allow suppresing validation by adding a cancel class to the submit button
			this.find("input, button").filter(".cancel").click(function() {
				validator.cancelSubmit = true;
			});

			// when a submitHandler is used, capture the submitting button
			if (validator.settings.submitHandler) {
				this.find("input, button").filter(":submit").click(function() {
					validator.submitButton = this;
				});
			}

			// validate the form on submit
			this.submit( function( event ) {
				if ( validator.settings.debug )
					// prevent form submit to be able to see console output
					event.preventDefault();

				function handle() {
					if ( validator.settings.submitHandler ) {
						if (validator.submitButton) {
							// insert a hidden input as a replacement for the missing submit button
							var hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
						}
						validator.settings.submitHandler.call( validator, validator.currentForm );
						if (validator.submitButton) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						return false;
					}
					return true;
				}

				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}

		return validator;
	},
	// http://docs.jquery.com/Plugins/Validation/valid
	valid: function() {
        if ( $(this[0]).is('form')) {
            return this.validate().form();
        } else {
            var valid = true;
            var validator = $(this[0].form).validate();
            this.each(function() {
				valid &= validator.element(this);
            });
            return valid;
        }
    },
	// attributes: space seperated list of attributes to retrieve and remove
	removeAttrs: function(attributes) {
		var result = {},
			$element = this;
		$.each(attributes.split(/\s/), function(index, value) {
			result[value] = $element.attr(value);
			$element.removeAttr(value);
		});
		return result;
	},
	// http://docs.jquery.com/Plugins/Validation/rules
	rules: function(command, argument) {
		var element = this[0];

		if (command) {
			var settings = $.data(element.form, 'validator').settings;
			var staticRules = settings.rules;
			var existingRules = $.validator.staticRules(element);
			switch(command) {
			case "add":
				$.extend(existingRules, $.validator.normalizeRule(argument));
				staticRules[element.name] = existingRules;
				if (argument.messages)
					settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
				break;
			case "remove":
				if (!argument) {
					delete staticRules[element.name];
					return existingRules;
				}
				var filtered = {};
				$.each(argument.split(/\s/), function(index, method) {
					filtered[method] = existingRules[method];
					delete existingRules[method];
				});
				return filtered;
			}
		}

		var data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.metadataRules(element),
			$.validator.classRules(element),
			$.validator.attributeRules(element),
			$.validator.staticRules(element)
		), element);

		// make sure required is at front
		if (data.required) {
			var param = data.required;
			delete data.required;
			data = $.extend({required: param}, data);
		}

		return data;
	}
});

// Custom selectors
$.extend($.expr[":"], {
	// http://docs.jquery.com/Plugins/Validation/blank
	blank: function(a) {return !$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/filled
	filled: function(a) {return !!$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/unchecked
	unchecked: function(a) {return !a.checked;}
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

$.validator.format = function(source, params) {
	if ( arguments.length == 1 )
		return function() {
			var args = $.makeArray(arguments);
			args.unshift(source);
			return $.validator.format.apply( this, args );
		};
	if ( arguments.length > 2 && params.constructor != Array  ) {
		params = $.makeArray(arguments).slice(1);
	}
	if ( params.constructor != Array ) {
		params = [ params ];
	}
	$.each(params, function(i, n) {
		source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
	});
	return source;
};

$.extend($.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: [],
		ignoreTitle: false,
		onfocusin: function(element) {
			this.lastActive = element;

			// hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
				this.settings.unhighlight && this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				this.errorsFor(element).hide();
			}
		},
		onfocusout: function(element) {
			if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
				this.element(element);
			}
		},
		onkeyup: function(element) {
			if ( element.name in this.submitted || element == this.lastElement ) {
				this.element(element);
			}
		},
		onclick: function(element) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted )
				this.element(element);
			// or option elements, check parent select in that case
			else if (element.parentNode.name in this.submitted)
				this.element(element.parentNode);
		},
		highlight: function( element, errorClass, validClass ) {
			$(element).addClass(errorClass).removeClass(validClass);
		},
		unhighlight: function( element, errorClass, validClass ) {
			$(element).removeClass(errorClass).addClass(validClass);
		}
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
	setDefaults: function(settings) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		accept: "Please enter a value with a valid extension.",
		maxlength: $.validator.format("Please enter no more than {0} characters."),
		minlength: $.validator.format("Please enter at least {0} characters."),
		rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
		range: $.validator.format("Please enter a value between {0} and {1}."),
		max: $.validator.format("Please enter a value less than or equal to {0}."),
		min: $.validator.format("Please enter a value greater than or equal to {0}.")
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $(this.settings.errorLabelContainer);
			this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
			this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = (this.groups = {});
			$.each(this.settings.groups, function(key, value) {
				$.each(value.split(/\s/), function(index, name) {
					groups[name] = key;
				});
			});
			var rules = this.settings.rules;
			$.each(rules, function(key, value) {
				rules[key] = $.validator.normalizeRule(value);
			});

			function delegate(event) {
				var validator = $.data(this[0].form, "validator"),
					eventType = "on" + event.type.replace(/^validate/, "");
				validator.settings[eventType] && validator.settings[eventType].call(validator, this[0] );
			}
			$(this.currentForm)
				.validateDelegate(":text, :password, :file, select, textarea", "focusin focusout keyup", delegate)
				.validateDelegate(":radio, :checkbox, select, option", "click", delegate);

			if (this.settings.invalidHandler)
				$(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/form
		form: function() {
			this.checkForm();
			$.extend(this.submitted, this.errorMap);
			this.invalid = $.extend({}, this.errorMap);
			if (!this.valid())
				$(this.currentForm).triggerHandler("invalid-form", [this]);
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
				this.check( elements[i] );
			}
			return this.valid();
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/element
		element: function( element ) {
			element = this.clean( element );
			this.lastElement = element;
			this.prepareElement( element );
			this.currentElements = $(element);
			var result = this.check( element );
			if ( result ) {
				delete this.invalid[element.name];
			} else {
				this.invalid[element.name] = true;
			}
			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/showErrors
		showErrors: function(errors) {
			if(errors) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[name],
						element: this.findByName(name)[0]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function(element) {
					return !(element.name in errors);
				});
			}
			this.settings.showErrors
				? this.settings.showErrors.call( this, this.errorMap, this.errorList )
				: this.defaultShowErrors();
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/resetForm
		resetForm: function() {
			if ( $.fn.resetForm )
				$( this.currentForm ).resetForm();
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			this.elements().removeClass( this.settings.errorClass );
		},

		numberOfInvalids: function() {
			return this.objectLength(this.invalid);
		},

		objectLength: function( obj ) {
			var count = 0;
			for ( var i in obj )
				count++;
			return count;
		},

		hideErrors: function() {
			this.addWrapper( this.toHide ).hide();
		},

		valid: function() {
			return this.size() == 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if( this.settings.focusInvalid ) {
				try {
					$(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
					.filter(":visible")
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger("focusin");
				} catch(e) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep(this.errorList, function(n) {
				return n.element.name == lastActive.name;
			}).length == 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// select all valid inputs inside the form (no submit or reset buttons)
			// workaround $Query([]).add until http://dev.jquery.com/ticket/2114 is solved
			return $([]).add(this.currentForm.elements)
			.filter(":input")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.filter(function() {
				!this.name && validator.settings.debug && window.console && console.error( "%o has no name assigned", this);

				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) )
					return false;

				rulesCache[this.name] = true;
				return true;
			});
		},

		clean: function( selector ) {
			return $( selector )[0];
		},

		errors: function() {
			return $( this.settings.errorElement + "." + this.settings.errorClass, this.errorContext );
		},

		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $([]);
			this.toHide = $([]);
			this.currentElements = $([]);
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor(element);
		},

		check: function( element ) {
			element = this.clean( element );

			// if radio/checkbox, validate first element in group instead
			if (this.checkable(element)) {
				element = this.findByName( element.name )[0];
			}

			var rules = $(element).rules();
			var dependencyMismatch = false;
			for( method in rules ) {
				var rule = { method: method, parameters: rules[method] };
				try {
					var result = $.validator.methods[method].call( this, element.value.replace(/\r/g, ""), element, rule.parameters );

					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result == "dependency-mismatch" ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result == "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor(element) );
						return;
					}

					if( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch(e) {
					this.settings.debug && window.console && console.log("exception occured when checking element " + element.id
						 + ", check the '" + rule.method + "' method", e);
					throw e;
				}
			}
			if (dependencyMismatch)
				return;
			if ( this.objectLength(rules) )
				this.successList.push(element);
			return true;
		},

		// return the custom message for the given element and validation method
		// specified in the element's "messages" metadata
		customMetaMessage: function(element, method) {
			if (!$.metadata)
				return;

			var meta = this.settings.meta
				? $(element).metadata()[this.settings.meta]
				: $(element).metadata();

			return meta && meta.messages && meta.messages[method];
		},

		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[name];
			return m && (m.constructor == String
				? m
				: m[method]);
		},

		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for(var i = 0; i < arguments.length; i++) {
				if (arguments[i] !== undefined)
					return arguments[i];
			}
			return undefined;
		},

		defaultMessage: function( element, method) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customMetaMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[method],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message == "function" ) {
				message = message.call(this, rule.parameters, element);
			} else if (theregex.test(message)) {
				message = jQuery.format(message.replace(theregex, '{$1}'), rule.parameters);
			}
			this.errorList.push({
				message: message,
				element: element
			});

			this.errorMap[element.name] = message;
			this.submitted[element.name] = message;
		},

		addWrapper: function(toToggle) {
			if ( this.settings.wrapper )
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			return toToggle;
		},

		defaultShowErrors: function() {
			for ( var i = 0; this.errorList[i]; i++ ) {
				var error = this.errorList[i];
				this.settings.highlight && this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				this.showLabel( error.element, error.message );
			}
			if( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if (this.settings.success) {
				for ( var i = 0; this.successList[i]; i++ ) {
					this.showLabel( this.successList[i] );
				}
			}
			if (this.settings.unhighlight) {
				for ( var i = 0, elements = this.validElements(); elements[i]; i++ ) {
					this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not(this.invalidElements());
		},

		invalidElements: function() {
			return $(this.errorList).map(function() {
				return this.element;
			});
		},

		showLabel: function(element, message) {
			var label = this.errorsFor( element );
			if ( label.length ) {
				// refresh error/success class
				label.removeClass().addClass( this.settings.errorClass );

				// check if we have a generated label, replace the message then
				label.attr("generated") && label.html(message);
			} else {
				// create label
				label = $("<" + this.settings.errorElement + "/>")
					.attr({"for":  this.idOrName(element), generated: true})
					.addClass(this.settings.errorClass)
					.html(message || "");
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
				}
				if ( !this.labelContainer.append(label).length )
					this.settings.errorPlacement
						? this.settings.errorPlacement(label, $(element) )
						: label.insertAfter(element);
			}
			if ( !message && this.settings.success ) {
				label.text("");
				typeof this.settings.success == "string"
					? label.addClass( this.settings.success )
					: this.settings.success( label );
			}
			this.toShow = this.toShow.add(label);
		},

		errorsFor: function(element) {
			var name = this.idOrName(element);
    		return this.errors().filter(function() {
				return $(this).attr('for') == name;
			});
		},

		idOrName: function(element) {
			return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
		},

		checkable: function( element ) {
			return /radio|checkbox/i.test(element.type);
		},

		findByName: function( name ) {
			// select by name and filter by form for performance over form.find("[name=...]")
			var form = this.currentForm;
			return $(document.getElementsByName(name)).map(function(index, element) {
				return element.form == form && element.name == name && element  || null;
			});
		},

		getLength: function(value, element) {
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				return $("option:selected", element).length;
			case 'input':
				if( this.checkable( element) )
					return this.findByName(element.name).filter(':checked').length;
			}
			return value.length;
		},

		depend: function(param, element) {
			return this.dependTypes[typeof param]
				? this.dependTypes[typeof param](param, element)
				: true;
		},

		dependTypes: {
			"boolean": function(param, element) {
				return param;
			},
			"string": function(param, element) {
				return !!$(param, element.form).length;
			},
			"function": function(param, element) {
				return param(element);
			}
		},

		optional: function(element) {
			return !$.validator.methods.required.call(this, $.trim(element.value), element) && "dependency-mismatch";
		},

		startRequest: function(element) {
			if (!this.pending[element.name]) {
				this.pendingRequest++;
				this.pending[element.name] = true;
			}
		},

		stopRequest: function(element, valid) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if (this.pendingRequest < 0)
				this.pendingRequest = 0;
			delete this.pending[element.name];
			if ( valid && this.pendingRequest == 0 && this.formSubmitted && this.form() ) {
				$(this.currentForm).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest == 0 && this.formSubmitted) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
				this.formSubmitted = false;
			}
		},

		previousValue: function(element) {
			return $.data(element, "previousValue") || $.data(element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		}

	},

	classRuleSettings: {
		required: {required: true},
		email: {email: true},
		url: {url: true},
		date: {date: true},
		dateISO: {dateISO: true},
		dateDE: {dateDE: true},
		number: {number: true},
		numberDE: {numberDE: true},
		digits: {digits: true},
		creditcard: {creditcard: true}
	},

	addClassRules: function(className, rules) {
		className.constructor == String ?
			this.classRuleSettings[className] = rules :
			$.extend(this.classRuleSettings, className);
	},

	classRules: function(element) {
		var rules = {};
		var classes = $(element).attr('class');
		classes && $.each(classes.split(' '), function() {
			if (this in $.validator.classRuleSettings) {
				$.extend(rules, $.validator.classRuleSettings[this]);
			}
		});
		return rules;
	},

	attributeRules: function(element) {
		var rules = {};
		var $element = $(element);

		for (method in $.validator.methods) {
			var value = $element.attr(method);
			if (value) {
				rules[method] = value;
			}
		}

		// maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
		if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
			delete rules.maxlength;
		}

		return rules;
	},

	metadataRules: function(element) {
		if (!$.metadata) return {};

		var meta = $.data(element.form, 'validator').settings.meta;
		return meta ?
			$(element).metadata()[meta] :
			$(element).metadata();
	},

	staticRules: function(element) {
		var rules = {};
		var validator = $.data(element.form, 'validator');
		if (validator.settings.rules) {
			rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
		}
		return rules;
	},

	normalizeRules: function(rules, element) {
		// handle dependency check
		$.each(rules, function(prop, val) {
			// ignore rule when param is explicitly false, eg. required:false
			if (val === false) {
				delete rules[prop];
				return;
			}
			if (val.param || val.depends) {
				var keepRule = true;
				switch (typeof val.depends) {
					case "string":
						keepRule = !!$(val.depends, element.form).length;
						break;
					case "function":
						keepRule = val.depends.call(element, element);
						break;
				}
				if (keepRule) {
					rules[prop] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[prop];
				}
			}
		});

		// evaluate parameters
		$.each(rules, function(rule, parameter) {
			rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
		});

		// clean number parameters
		$.each(['minlength', 'maxlength', 'min', 'max'], function() {
			if (rules[this]) {
				rules[this] = Number(rules[this]);
			}
		});
		$.each(['rangelength', 'range'], function() {
			if (rules[this]) {
				rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
			}
		});

		if ($.validator.autoCreateRanges) {
			// auto-create ranges
			if (rules.min && rules.max) {
				rules.range = [rules.min, rules.max];
				delete rules.min;
				delete rules.max;
			}
			if (rules.minlength && rules.maxlength) {
				rules.rangelength = [rules.minlength, rules.maxlength];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		// To support custom messages in metadata ignore rule methods titled "messages"
		if (rules.messages) {
			delete rules.messages;
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function(data) {
		if( typeof data == "string" ) {
			var transformed = {};
			$.each(data.split(/\s/), function() {
				transformed[this] = true;
			});
			data = transformed;
		}
		return data;
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/addMethod
	addMethod: function(name, method, message) {
		$.validator.methods[name] = method;
		$.validator.messages[name] = message != undefined ? message : $.validator.messages[name];
		if (method.length < 3) {
			$.validator.addClassRules(name, $.validator.normalizeRule(name));
		}
	},

	methods: {

		// http://docs.jquery.com/Plugins/Validation/Methods/required
		required: function(value, element, param) {
			// check if dependency is met
			if ( !this.depend(param, element) )
				return "dependency-mismatch";
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				// could be an array for select-multiple or a string, both are fine this way
				var val = $(element).val();
				return val && val.length > 0;
			case 'input':
				if ( this.checkable(element) )
					return this.getLength(value, element) > 0;
			default:
				return $.trim(value).length > 0;
			}
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/remote
		remote: function(value, element, param) {
			if ( this.optional(element) )
				return "dependency-mismatch";

			var previous = this.previousValue(element);
			if (!this.settings.messages[element.name] )
				this.settings.messages[element.name] = {};
			previous.originalMessage = this.settings.messages[element.name].remote;
			this.settings.messages[element.name].remote = previous.message;

			param = typeof param == "string" && {url:param} || param;

			if ( previous.old !== value ) {
				previous.old = value;
				var validator = this;
				this.startRequest(element);
				var data = {};
				data[element.name] = value;
				$.ajax($.extend(true, {
					url: param,
					mode: "abort",
					port: "validate" + element.name,
					dataType: "json",
					data: data,
					success: function(response) {
						validator.settings.messages[element.name].remote = previous.originalMessage;
						var valid = response === true;
						if ( valid ) {
							var submitted = validator.formSubmitted;
							validator.prepareElement(element);
							validator.formSubmitted = submitted;
							validator.successList.push(element);
							validator.showErrors();
						} else {
							var errors = {};
							var message = (previous.message = response || validator.defaultMessage( element, "remote" ));
							errors[element.name] = $.isFunction(message) ? message(value) : message;
							validator.showErrors(errors);
						}
						previous.valid = valid;
						validator.stopRequest(element, valid);
					}
				}, param));
				return "pending";
			} else if( this.pending[element.name] ) {
				return "pending";
			}
			return previous.valid;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/minlength
		minlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/maxlength
		maxlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/rangelength
		rangelength: function(value, element, param) {
			var length = this.getLength($.trim(value), element);
			return this.optional(element) || ( length >= param[0] && length <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/min
		min: function( value, element, param ) {
			return this.optional(element) || value >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/max
		max: function( value, element, param ) {
			return this.optional(element) || value <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/range
		range: function( value, element, param ) {
			return this.optional(element) || ( value >= param[0] && value <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/email
		email: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/url
		url: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/date
		date: function(value, element) {
			return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/dateISO
		dateISO: function(value, element) {
			return this.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/number
		number: function(value, element) {
			return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/digits
		digits: function(value, element) {
			return this.optional(element) || /^\d+$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/creditcard
		// based on http://en.wikipedia.org/wiki/Luhn
		creditcard: function(value, element) {
			if ( this.optional(element) )
				return "dependency-mismatch";
			// accept only digits and dashes
			if (/[^0-9-]+/.test(value))
				return false;
			var nCheck = 0,
				nDigit = 0,
				bEven = false;

			value = value.replace(/\D/g, "");

			for (var n = value.length - 1; n >= 0; n--) {
				var cDigit = value.charAt(n);
				var nDigit = parseInt(cDigit, 10);
				if (bEven) {
					if ((nDigit *= 2) > 9)
						nDigit -= 9;
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return (nCheck % 10) == 0;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/accept
		accept: function(value, element, param) {
			param = typeof param == "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
			return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i"));
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/equalTo
		equalTo: function(value, element, param) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $(param).unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
				$(element).valid();
			});
			return value == target.val();
		}

	}

});

// deprecated, use $.validator.format instead
$.format = $.validator.format;

})(jQuery);

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
;(function($) {
  var pendingRequests = {};
  if ($.ajaxPrefilter) {
    $.ajaxPrefilter(function (settings, original, jqXHR) {
      var port = settings.port;
      if (settings.mode == "abort") {
        if ( pendingRequests[port] ) {
          pendingRequests[port].abort();
        }
        pendingRequests[port] = jqXHR;
      }
    });
  } else {
    var ajax = $.ajax;
    $.ajax = function(settings) {
      // create settings for compatibility with ajaxSetup
      settings = $.extend(settings, $.extend({}, $.ajaxSettings, settings));
      var port = settings.port;
      if (settings.mode == "abort") {
        if ( pendingRequests[port] ) {
          pendingRequests[port].abort();
        }
        return (pendingRequests[port] = ajax.apply(this, arguments));
      }
      return ajax.apply(this, arguments);
    };
  }
})(jQuery);

// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target
;(function($) {
	// only implement if not provided by jQuery core (since 1.4)
	// TODO verify if jQuery 1.4's implementation is compatible with older jQuery special-event APIs
	if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
		$.each({
			focus: 'focusin',
			blur: 'focusout'
		}, function( original, fix ){
			$.event.special[fix] = {
				setup:function() {
					this.addEventListener( original, handler, true );
				},
				teardown:function() {
					this.removeEventListener( original, handler, true );
				},
				handler: function(e) {
					arguments[0] = $.event.fix(e);
					arguments[0].type = fix;
					return $.event.handle.apply(this, arguments);
				}
			};
			function handler(e) {
				e = $.event.fix(e);
				e.type = fix;
				return $.event.handle.call(this, e);
			}
		});
	};
	$.extend($.fn, {
		validateDelegate: function(delegate, type, handler) {
			return this.bind(type, function(event) {
				var target = $(event.target);
				if (target.is(delegate)) {
					return handler.apply(target, arguments);
				}
			});
		}
	});
})(jQuery);
/*
 * jQuery Templating Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function( jQuery, undefined ){
	var oldManip = jQuery.fn.domManip, tmplItmAtt = "_tmplitem", htmlExpr = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,
		newTmplItems = {}, wrappedItems = {}, appendToTmplItems, topTmplItem = { key: 0, data: {} }, itemKey = 0, cloneIndex = 0, stack = [];

	function newTmplItem( options, parentItem, fn, data ) {
		// Returns a template item data structure for a new rendered instance of a template (a 'template item').
		// The content field is a hierarchical array of strings and nested items (to be
		// removed and replaced by nodes field of dom elements, once inserted in DOM).
		var newItem = {
      data: data || (parentItem ? parentItem.data : {}),
			_wrap: parentItem ? parentItem._wrap : null,
			tmpl: null,
			parent: parentItem || null,
			nodes: [],
			calls: tiCalls,
			nest: tiNest,
			wrap: tiWrap,
			html: tiHtml,
			update: tiUpdate
		};
		if ( options ) {
			jQuery.extend( newItem, options, { nodes: [], parent: parentItem } );
		}
		if ( fn ) {
			// Build the hierarchical content to be used during insertion into DOM
			newItem.tmpl = fn;
			newItem._ctnt = newItem._ctnt || newItem.tmpl( jQuery, newItem );
			newItem.key = ++itemKey;
			// Keep track of new template item, until it is stored as jQuery Data on DOM element
			(stack.length ? wrappedItems : newTmplItems)[itemKey] = newItem;
		}
		return newItem;
	}

	// Override appendTo etc., in order to provide support for targeting multiple elements. (This code would disappear if integrated in jquery core).
	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var ret = [], insert = jQuery( selector ), elems, i, l, tmplItems,
				parent = this.length === 1 && this[0].parentNode;

			appendToTmplItems = newTmplItems || {};
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
				insert[ original ]( this[0] );
				ret = this;
			} else {
				for ( i = 0, l = insert.length; i < l; i++ ) {
					cloneIndex = i;
					elems = (i > 0 ? this.clone(true) : this).get();
					jQuery.fn[ original ].apply( jQuery(insert[i]), elems );
					ret = ret.concat( elems );
				}
				cloneIndex = 0;
				ret = this.pushStack( ret, name, insert.selector );
			}
			tmplItems = appendToTmplItems;
			appendToTmplItems = null;
			jQuery.tmpl.complete( tmplItems );
			return ret;
		};
	});

	jQuery.fn.extend({
		// Use first wrapped element as template markup.
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( data, options, parentItem ) {
			return jQuery.tmpl( this[0], data, options, parentItem );
		},

		// Find which rendered template item the first wrapped DOM element belongs to
		tmplItem: function() {
			return jQuery.tmplItem( this[0] );
		},

		// Consider the first wrapped element as a template declaration, and get the compiled template or store it as a named template.
		template: function( name ) {
			return jQuery.template( name, this[0] );
		},

		domManip: function( args, table, callback, options ) {
			// This appears to be a bug in the appendTo, etc. implementation
			// it should be doing .call() instead of .apply(). See #6227
			if ( args[0] && args[0].nodeType ) {
				var dmArgs = jQuery.makeArray( arguments ), argsLength = args.length, i = 0, tmplItem;
				while ( i < argsLength && !(tmplItem = jQuery.data( args[i++], "tmplItem" ))) {}
				if ( argsLength > 1 ) {
					dmArgs[0] = [jQuery.makeArray( args )];
				}
				if ( tmplItem && cloneIndex ) {
					dmArgs[2] = function( fragClone ) {
						// Handler called by oldManip when rendered template has been inserted into DOM.
						jQuery.tmpl.afterManip( this, fragClone, callback );
					};
				}
				oldManip.apply( this, dmArgs );
			} else {
				oldManip.apply( this, arguments );
			}
			cloneIndex = 0;
			if ( !appendToTmplItems ) {
				jQuery.tmpl.complete( newTmplItems );
			}
			return this;
		}
	});

	jQuery.extend({
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( tmpl, data, options, parentItem ) {
			var ret, topLevel = !parentItem;
			if ( topLevel ) {
				// This is a top-level tmpl call (not from a nested template using {{tmpl}})
				parentItem = topTmplItem;
				tmpl = jQuery.template[tmpl] || jQuery.template( null, tmpl );
				wrappedItems = {}; // Any wrapped items will be rebuilt, since this is top level
			} else if ( !tmpl ) {
				// The template item is already associated with DOM - this is a refresh.
				// Re-evaluate rendered template for the parentItem
				tmpl = parentItem.tmpl;
				newTmplItems[parentItem.key] = parentItem;
				parentItem.nodes = [];
				if ( parentItem.wrapped ) {
					updateWrapped( parentItem, parentItem.wrapped );
				}
				// Rebuild, without creating a new template item
				return jQuery( build( parentItem, null, parentItem.tmpl( jQuery, parentItem ) ));
			}
			if ( !tmpl ) {
				return []; // Could throw...
			}
			if ( typeof data === "function" ) {
				data = data.call( parentItem || {} );
			}
			if ( options && options.wrapped ) {
				updateWrapped( options, options.wrapped );
			}
			ret = jQuery.isArray( data ) ? 
				jQuery.map( data, function( dataItem ) {
					return dataItem ? newTmplItem( options, parentItem, tmpl, dataItem ) : null;
				}) :
				[ newTmplItem( options, parentItem, tmpl, data ) ];
			return topLevel ? jQuery( build( parentItem, null, ret ) ) : ret;
		},

		// Return rendered template item for an element.
		tmplItem: function( elem ) {
			var tmplItem;
			if ( elem instanceof jQuery ) {
				elem = elem[0];
			}
			while ( elem && elem.nodeType === 1 && !(tmplItem = jQuery.data( elem, "tmplItem" )) && (elem = elem.parentNode) ) {}
			return tmplItem || topTmplItem;
		},

		// Set:
		// Use $.template( name, tmpl ) to cache a named template,
		// where tmpl is a template string, a script element or a jQuery instance wrapping a script element, etc.
		// Use $( "selector" ).template( name ) to provide access by name to a script block template declaration.

		// Get:
		// Use $.template( name ) to access a cached template.
		// Also $( selectorToScriptBlock ).template(), or $.template( null, templateString )
		// will return the compiled template, without adding a name reference.
		// If templateString includes at least one HTML tag, $.template( templateString ) is equivalent
		// to $.template( null, templateString )
		template: function( name, tmpl ) {
			if (tmpl) {
				// Compile template and associate with name
				if ( typeof tmpl === "string" ) {
					// This is an HTML string being passed directly in.
					tmpl = buildTmplFn( tmpl );
				} else if ( tmpl instanceof jQuery ) {
					tmpl = tmpl[0] || {};
				}
				if ( tmpl.nodeType ) {
					// If this is a template block, use cached copy, or generate tmpl function and cache.
					tmpl = jQuery.data( tmpl, "tmpl" ) || jQuery.data( tmpl, "tmpl", buildTmplFn( tmpl.innerHTML ));
				}
				return typeof name === "string" ? (jQuery.template[name] = tmpl) : tmpl;
			}
			// Return named compiled template
			return name ? (typeof name !== "string" ? jQuery.template( null, name ): 
				(jQuery.template[name] || 
					// If not in map, treat as a selector. (If integrated with core, use quickExpr.exec) 
					jQuery.template( null, htmlExpr.test( name ) ? name : jQuery( name )))) : null; 
		},

		encode: function( text ) {
			// Do HTML encoding replacing < > & and ' and " by corresponding entities.
			return ("" + text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
		}
	});

	jQuery.extend( jQuery.tmpl, {
		tag: {
			"tmpl": {
				_default: { $2: "null" },
				open: "if($notnull_1){_=_.concat($item.nest($1,$2));}"
				// tmpl target parameter can be of type function, so use $1, not $1a (so not auto detection of functions)
				// This means that {{tmpl foo}} treats foo as a template (which IS a function). 
				// Explicit parens can be used if foo is a function that returns a template: {{tmpl foo()}}.
			},
			"wrap": {
				_default: { $2: "null" },
				open: "$item.calls(_,$1,$2);_=[];",
				close: "call=$item.calls();_=call._.concat($item.wrap(call,_));"
			},
			"each": {
				_default: { $2: "$index, $value" },
				open: "if($notnull_1){$.each($1a,function($2){with(this){",
				close: "}});}"
			},
			"if": {
				open: "if(($notnull_1) && $1a){",
				close: "}"
			},
			"else": {
				_default: { $1: "true" },
				open: "}else if(($notnull_1) && $1a){"
			},
			"html": {
				// Unecoded expression evaluation. 
				open: "if($notnull_1){_.push($1a);}"
			},
			"=": {
				// Encoded expression evaluation. Abbreviated form is ${}.
				_default: { $1: "$data" },
				open: "if($notnull_1){_.push($.encode($1a));}"
			},
			"!": {
				// Comment tag. Skipped by parser
				open: ""
			}
		},

		// This stub can be overridden, e.g. in jquery.tmplPlus for providing rendered events
		complete: function( items ) {
			newTmplItems = {};
		},

		// Call this from code which overrides domManip, or equivalent
		// Manage cloning/storing template items etc.
		afterManip: function afterManip( elem, fragClone, callback ) {
			// Provides cloned fragment ready for fixup prior to and after insertion into DOM
			var content = fragClone.nodeType === 11 ?
				jQuery.makeArray(fragClone.childNodes) :
				fragClone.nodeType === 1 ? [fragClone] : [];

			// Return fragment to original caller (e.g. append) for DOM insertion
			callback.call( elem, fragClone );

			// Fragment has been inserted:- Add inserted nodes to tmplItem data structure. Replace inserted element annotations by jQuery.data.
			storeTmplItems( content );
			cloneIndex++;
		}
	});

	//========================== Private helper functions, used by code above ==========================

	function build( tmplItem, nested, content ) {
		// Convert hierarchical content into flat string array 
		// and finally return array of fragments ready for DOM insertion
		var frag, ret = content ? jQuery.map( content, function( item ) {
			return (typeof item === "string") ? 
				// Insert template item annotations, to be converted to jQuery.data( "tmplItem" ) when elems are inserted into DOM.
				(tmplItem.key ? item.replace( /(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + tmplItmAtt + "=\"" + tmplItem.key + "\" $2" ) : item) :
				// This is a child template item. Build nested template.
				build( item, tmplItem, item._ctnt );
		}) : 
		// If content is not defined, insert tmplItem directly. Not a template item. May be a string, or a string array, e.g. from {{html $item.html()}}. 
		tmplItem;
		if ( nested ) {
			return ret;
		}

		// top-level template
		ret = ret.join("");

		// Support templates which have initial or final text nodes, or consist only of text
		// Also support HTML entities within the HTML markup.
		ret.replace( /^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function( all, before, middle, after) {
			frag = jQuery( middle ).get();

			storeTmplItems( frag );
			if ( before ) {
				frag = unencode( before ).concat(frag);
			}
			if ( after ) {
				frag = frag.concat(unencode( after ));
			}
		});
		return frag ? frag : unencode( ret );
	}

	function unencode( text ) {
		// Use createElement, since createTextNode will not render HTML entities correctly
		var el = document.createElement( "div" );
		el.innerHTML = text;
		return jQuery.makeArray(el.childNodes);
	}

	// Generate a reusable function that will serve to render a template against data
	function buildTmplFn( markup ) {
		return new Function("jQuery","$item",
			"var $=jQuery,call,_=[],$data=$item.data;" +

			// Introduce the data as local variables using with(){}
			"with($data){_.push('" +

			// Convert the template into pure JavaScript
			jQuery.trim(markup)
				.replace( /([\\'])/g, "\\$1" )
				.replace( /[\r\t\n]/g, " " )
				.replace( /\$\{([^\}]*)\}/g, "{{= $1}}" )
				.replace( /\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,
				function( all, slash, type, fnargs, target, parens, args ) {
					var tag = jQuery.tmpl.tag[ type ], def, expr, exprAutoFnDetect;
					if ( !tag ) {
						throw "Template command not found: " + type;
					}
					def = tag._default || [];
					if ( parens && !/\w$/.test(target)) {
						target += parens;
						parens = "";
					}
					if ( target ) {
						target = unescape( target ); 
						args = args ? ("," + unescape( args ) + ")") : (parens ? ")" : "");
						// Support for target being things like a.toLowerCase();
						// In that case don't call with template item as 'this' pointer. Just evaluate...
						expr = parens ? (target.indexOf(".") > -1 ? target + parens : ("(" + target + ").call($item" + args)) : target;
						exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))";
					} else {
						exprAutoFnDetect = expr = def.$1 || "null";
					}
					fnargs = unescape( fnargs );
					return "');" + 
						tag[ slash ? "close" : "open" ]
							.split( "$notnull_1" ).join( target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true" )
							.split( "$1a" ).join( exprAutoFnDetect )
							.split( "$1" ).join( expr )
							.split( "$2" ).join( fnargs ?
								fnargs.replace( /\s*([^\(]+)\s*(\((.*?)\))?/g, function( all, name, parens, params ) {
									params = params ? ("," + params + ")") : (parens ? ")" : "");
									return params ? ("(" + name + ").call($item" + params) : all;
								})
								: (def.$2||"")
							) +
						"_.push('";
				}) +
			"');}return _;"
		);
	}
	function updateWrapped( options, wrapped ) {
		// Build the wrapped content. 
		options._wrap = build( options, true, 
			// Suport imperative scenario in which options.wrapped can be set to a selector or an HTML string.
			jQuery.isArray( wrapped ) ? wrapped : [htmlExpr.test( wrapped ) ? wrapped : jQuery( wrapped ).html()]
		).join("");
	}

	function unescape( args ) {
		return args ? args.replace( /\\'/g, "'").replace(/\\\\/g, "\\" ) : null;
	}
	function outerHtml( elem ) {
		var div = document.createElement("div");
		div.appendChild( elem.cloneNode(true) );
		return div.innerHTML;
	}

	// Store template items in jQuery.data(), ensuring a unique tmplItem data data structure for each rendered template instance.
	function storeTmplItems( content ) {
		var keySuffix = "_" + cloneIndex, elem, elems, newClonedItems = {}, i, l, m;
		for ( i = 0, l = content.length; i < l; i++ ) {
			if ( (elem = content[i]).nodeType !== 1 ) {
				continue;
			}
			elems = elem.getElementsByTagName("*");
			for ( m = elems.length - 1; m >= 0; m-- ) {
				processItemKey( elems[m] );
			}
			processItemKey( elem );
		}
		function processItemKey( el ) {
			var pntKey, pntNode = el, pntItem, tmplItem, key;
			// Ensure that each rendered template inserted into the DOM has its own template item,
			if ( (key = el.getAttribute( tmplItmAtt ))) {
				while ( pntNode.parentNode && (pntNode = pntNode.parentNode).nodeType === 1 && !(pntKey = pntNode.getAttribute( tmplItmAtt ))) { }
				if ( pntKey !== key ) {
					// The next ancestor with a _tmplitem expando is on a different key than this one.
					// So this is a top-level element within this template item
					// Set pntNode to the key of the parentNode, or to 0 if pntNode.parentNode is null, or pntNode is a fragment.
					pntNode = pntNode.parentNode ? (pntNode.nodeType === 11 ? 0 : (pntNode.getAttribute( tmplItmAtt ) || 0)) : 0;
					if ( !(tmplItem = newTmplItems[key]) ) {
						// The item is for wrapped content, and was copied from the temporary parent wrappedItem.
						tmplItem = wrappedItems[key];
						tmplItem = newTmplItem( tmplItem, newTmplItems[pntNode]||wrappedItems[pntNode], null, true );
						tmplItem.key = ++itemKey;
						newTmplItems[itemKey] = tmplItem;
					}
					if ( cloneIndex ) {
						cloneTmplItem( key );
					}
				}
				el.removeAttribute( tmplItmAtt );
			} else if ( cloneIndex && (tmplItem = jQuery.data( el, "tmplItem" )) ) {
				// This was a rendered element, cloned during append or appendTo etc.
				// TmplItem stored in jQuery data has already been cloned in cloneCopyEvent. We must replace it with a fresh cloned tmplItem.
				cloneTmplItem( tmplItem.key );
				newTmplItems[tmplItem.key] = tmplItem;
				pntNode = jQuery.data( el.parentNode, "tmplItem" );
				pntNode = pntNode ? pntNode.key : 0;
			}
			if ( tmplItem ) {
				pntItem = tmplItem;
				// Find the template item of the parent element. 
				// (Using !=, not !==, since pntItem.key is number, and pntNode may be a string)
				while ( pntItem && pntItem.key != pntNode ) { 
					// Add this element as a top-level node for this rendered template item, as well as for any
					// ancestor items between this item and the item of its parent element
					pntItem.nodes.push( el );
					pntItem = pntItem.parent;
				}
				// Delete content built during rendering - reduce API surface area and memory use, and avoid exposing of stale data after rendering...
				delete tmplItem._ctnt;
				delete tmplItem._wrap;
				// Store template item as jQuery data on the element
				jQuery.data( el, "tmplItem", tmplItem );
			}
			function cloneTmplItem( key ) {
				key = key + keySuffix;
				tmplItem = newClonedItems[key] = 
					(newClonedItems[key] || newTmplItem( tmplItem, newTmplItems[tmplItem.parent.key + keySuffix] || tmplItem.parent, null, true ));
			}
		}
	}

	//---- Helper functions for template item ----

	function tiCalls( content, tmpl, data, options ) {
		if ( !content ) {
			return stack.pop();
		}
		stack.push({ _: content, tmpl: tmpl, item:this, data: data, options: options });
	}

	function tiNest( tmpl, data, options ) {
		// nested template, using {{tmpl}} tag
		return jQuery.tmpl( jQuery.template( tmpl ), data, options, this );
	}

	function tiWrap( call, wrapped ) {
		// nested template, using {{wrap}} tag
		var options = call.options || {};
		options.wrapped = wrapped;
		// Apply the template, which may incorporate wrapped content, 
		return jQuery.tmpl( jQuery.template( call.tmpl ), call.data, options, call.item );
	}

	function tiHtml( filter, textOnly ) {
		var wrapped = this._wrap;
		return jQuery.map(
			jQuery( jQuery.isArray( wrapped ) ? wrapped.join("") : wrapped ).filter( filter || "*" ),
			function(e) {
				return textOnly ?
					e.innerText || e.textContent :
					e.outerHTML || outerHtml(e);
			});
	}

	function tiUpdate() {
		var coll = this.nodes;
		jQuery.tmpl( null, null, null, this).insertBefore( coll[0] );
		jQuery( coll ).remove();
	}
})( jQuery );

var KJS = KJS || {};

(function($){
  KJS.getText = function(key) {
      try {
          var tmpl = AJS.template.load(key);
          return tmpl.fillHtml({}).toString();
      } catch(e) {;}
      return key;
  };

  KJS.log = function(message) {
      if(console) {
          console.log(message);
      }
  };
  
  // helper method for parsing the spacekey from the url
  var spacekeyParser = /spaceKey=([^&]*)/;
  var getSpaceKeyFromUrl = function(){
    // parse spacekey from url
    var key = location.search.match(spacekeyParser) || [];
    key = key[1] || '';
    return key;
  };
  
  /**
   * Determines the spacekey. Tries AJS.params, the spaceKey parameter and the #confluence-space-key element in the dom (in this order).
   * @return the spacekey or undefined if not in space.
   */
  KJS.getSpaceKey = function(){
    // try getting the spacekey from AJS, URL or DOM
    var key =  AJS.params.spaceKey || getSpaceKeyFromUrl() || jQuery("#confluence-space-key").attr("content");
    return key;
  };



  // used to parse return value from .toString(). Return value has the following format: [object TYPE]
  // e.g. [object RegExp], [object Array]
  var typeParser = /\[object ([^\]]*)\]/;
  /**
   * Returns the type of the passed in value.
   * Behaves like typeof for objects, strings, numbers, functions, boolean and undefined,
   * but also returns the correct type for arrays (where typeof [] === 'object'), null (typeof null === 'undefined'), date and global objects (DOM).
   * The returned value is lowercase.
   * @param val the value to check
   * @return one of: object, number, string, function, array, boolean, undefined, null, date, global.
   * (notice: there are some more edge cases, like .getType(window.JSON) === 'json')
   */
  KJS.getType = function(val){
    if( val === undefined ){
     return 'undefined';
    }
    if( val === null ){
     return 'null';
    }
    // shortcut for host objects (dom elements)
    if( val.nodeType ){
      return 'global';
    }
    var type = Object.prototype.toString.call( val );
    type = typeParser.exec(type);
    if( type && type[1] ){
      type = type[1].toLowerCase();
    }else{ // fall back to typeof if no typename found
      type = typeof val;
    }
    return type;
  };


  /**
   * Similiar to jQuery.bind, but adds the new event handler at the beginning of the internal eventhandler-array, causing it to execute before other already bound handlers.
   * The function can be unbound normally through jQuery.unbind
   * @param elem {object} object to bind the handler to
   * @param type {string} A string containing one or more JavaScript event types, such as "click" or "submit," or custom event names.
   * @param fun {function} A function to execute each time the event is triggered
   */
  KJS.bindFirst = function(elem, type, fun){
    // get type without namespace (e.g. just "click" instead of "click.preset.load")
    var unnamespacedType = type.split('.')[0];
    elem = $(elem);
    // bind handler normally
    elem.bind(type, fun);

    // get event handlers that are bound to the element through jQuery
    var handlers = elem.data('events');
    if( handlers ){
      var typeHandlers = handlers[ unnamespacedType ];
      if( typeHandlers && typeHandlers.length ){
        // take out handler that was just added and move it to the beginning of the array
        var newHandler = typeHandlers.pop();
        typeHandlers.unshift(newHandler);
      }
    }
  };


})(jQuery);

var KJS = KJS || {};

/**
 * Create a new dialog.
 *
 * @param $
 * @param options
 */
KJS.Dialog = function($, options) {

    var that = this || {};

    var messageContainer = null;

    that.options = $.extend({
        id: "k15t-dialog"
        ,width: 640
        ,height: 480
        ,footerHtml: ""
        ,dialogClass: null
        ,postInit: function() {}
    }, options);


    /**
     *  Initialize the dialog.
     */
    that.init = function() {

        // remove, if there is already an open (or closed) dialog in the DOM
        AJS.$("#" + that.options.id).remove();

        that.popup = new AJS.Dialog({
            width: that.options.width
            ,height: that.options.height
            ,id: that.options.id
        });

        $("#" + that.options.id).addClass("k15t-dialog");
        if(that.options.dialogClass) {
            $("#" + that.options.id).addClass(that.options.dialogClass);
        }

        $.each(that.options.pages || {}, function(name, page) {
            that.popup.addPage();
            that.popup.addHeader(KJS.getText(page.title));

            $.each(page.panels||{}, function(name, panel) {
                that.popup.addPanel(name, panel.id);

                // disable autoaction
                $(that.popup.getCurrentPanel().body).find("form").submit(function(e) {
                    e.preventDefault();
                    $("#" + that.options.id).find("button:last").click();
                });
            });

            $.each(page.actions||{}, function(name, action) {
                if(action.type && (that.popup.addLink) && (action.type === "link")) {
                    that.popup.addLink(KJS.getText(action.name), action.action);
                } else {
                    that.popup.addButton(KJS.getText(action.name), action.action);
                }
            });
        });

        // adding footer text
        $("#" + that.options.id + " .dialog-button-panel").prepend("<span style=\"float: left; margin-left: 14px; font-size: 13px;\" class='k15t-footertext'></span>");
        AJS.$(that.options.footerHtml).appendTo(AJS.$("#" + that.options.id + " .k15t-footertext"));

        that.popup.gotoPage(1);
        that.popup.show();
        that.options.postInit(this);

        if(that.options.feedbackLink) {
          // add feedback button
          AJS.$(".k15t-dialog h2.dialog-title").append('<a href="' + that.options.feedbackLink + '" target="_new" class="k15t-feedback">GOT FEEDBACK?</a>').find(".k15t-feedback");
        }
        
        
        // fixes bug with the dialog panels being unclickable in Chrome 12.
        // works with anything(?) that manipulates the style (the value does not have to change to trigger this).
        // the error occured when the templates include a <progress> element
        //that.popup.popup.element.css('opacity', 1);       
        
        // graphical fine-tuning
        $("#" + that.options.id).find("button").not(":last").css("margin-right", "0.85em");
    };


    that.renderAndShowPage = function(pageId, template, context) {
        that.popup.gotoPage(pageId);
        AJS.$(that.popup.getCurrentPanel().body).empty();
        AJS.$.tmpl(template, context).appendTo(that.popup.getCurrentPanel().body);
        AJS.tabs.setup();
    };


    that.addPanel = function(pageId, title, template, context) {
        that.popup.gotoPage(pageId);
        that.popup.addPanel(KJS.getText(title), AJS.$.tmpl(template, context), "panel-body");

        AJS.tabs.setup();
    };


    that.close = function() {
        that.popup.remove();
    };


    that.displayUserMessage = function(severity, title, message, stackTrace) {
        if( !messageContainer || messageContainer.size() === 0 ) {
            messageContainer = AJS.$("<div class=\"messages\"/>");
        }
        AJS.$(that.popup.getCurrentPanel().body).prepend(messageContainer);

        var selector = "#" + that.options.id + " .messages";

        var userMessage = {
            title: title
            ,body : message
        };
        if( !severity ){
          severity = '';
        }
        if( severity.toLowerCase() == "success") {
            AJS.messages.success(selector, userMessage);
        } else if(severity.toLowerCase() == "error") {
                AJS.messages.error(selector, userMessage);
        } else if(severity.toLowerCase() == "warning") {
            AJS.messages.warning(selector, userMessage);
        } else if(severity.toLowerCase() == "info") {
            AJS.messages.info(selector, userMessage);
        } else {
            AJS.messages.generic(selector, userMessage);
        }
        // get the just created message
        var lastMessage = messageContainer.children('.aui-message').last();
        if(stackTrace) {
            lastMessage.append("<p style='font-size: 11px; float: right;'><a href='#' class='open-support-form'>Get Support (new window) &raquo;</a></p><form class='support-form'><input type='hidden' name='message' value='" + stackTrace + "'/></form>");
        }
        // add marker class
        lastMessage.addClass('k15t-js-message');
    };


    that.resetUserMessage = function() {
        if( messageContainer ){
            // clear message container
            messageContainer.children('.k15t-js-message').remove();
        }
    };


    // call init
    that.init();
    return that;
};

/**
 * Displays a message to the user.
 * @method displayMessage
 * @param title {object} the message
*/
KJS.Dialog.prototype.displayMessage = function (severity, title, message, stackTrace) {
    this.displayUserMessage(severity, title, message, stackTrace);
};

/**
 * Shows another dialog on top of this dialog.
 * Creates a new KJS.Dialog, positions it on top of this dialog, moves the blanket (dialog shadow) on top of the parent dialog and back on close.
 * Arguments are the same as on the KJS.Dialog constructor.
 * @param $ {object} jQuery
 * @param options {object}
 * @return {object} the KJS.Dialog object
 */
KJS.Dialog.prototype.newDialog = function($, options){
  var newDialog = new KJS.Dialog($, options);

  var parentDom = $(this.popup.popup.element);
  var childDom = $(newDialog.popup.popup.element);

  // move blanket in front of parent dialog
  var blanket = AJS.$('.aui-blanket');
  var blanketZindex = blanket.css('z-index');
  blanket.css('z-index', (childDom.css('z-index')-1).toString()  );

  // Events on dialog.close are only available on AUI 3.5 -> overwrite close method
  var closeBackup = newDialog.close;
  newDialog.close = function(){
    // put blanket back behind parent dialog
    blanket.css( 'z-index', blanketZindex );
    $(document).unbind('keydown.dialog.close.'+options.id);
    // close dialog
    closeBackup.call(newDialog);
  };

  // on ESC close the new dialog, not the parent.
  // Added to the beginning of the handler list via KJS.bindFirst to prevent other handlers from catching the keydown event first.
  KJS.bindFirst( document, 'keydown.dialog.close.'+options.id, function(e){
    if( e.keyCode === 27 && childDom.is(':visible') ){ // 27 = ESC key
      // don't execute other handlers bound to this element
      e.stopImmediatePropagation();
      newDialog.close();
    }
  });

  return newDialog;
};

var SCROLL = SCROLL || {};

SCROLL.ExportDialog = function($, options) {

    var that = this || {};
    var KJS_LOCAL = KJS;

    that.init = function($, options) {

        // init the AJS stuff
        that.pageId = AJS.params.pageId;
        that.spaceKey = AJS.params.spaceKey;
        that.user = AJS.$("meta[name='ajs-remote-user']").attr("content") || AJS.$("meta[name='loggedInUsername']").attr("content");

        that.options = AJS.$.extend({
            title : "Scroll Wiki PDF Exporter"
            ,exporterId : "com.k15t.scroll.scroll-pdf:pdf-exporter"
            ,restBaseUrl : AJS.params.contextPath + "/rest/scroll-pdf/1.0/"
            ,exportTemplateUrl : contextPath + "/plugins/servlet/com.k15t.scroll.pdf/dialogs?spaceKey=" + that.spaceKey + "&pageId=" + that.pageId + "&dialogType=export&exporterId=asdf"
            ,feedbackLink : null
            ,helpUrl : null
            ,dialogClass : null
        }, options);

        that.dialogId = "scroll-export-dialog";
        that.dialog = {};
        that.templates = {};
        that.resources = {
            createExport : that.options.restBaseUrl + "export"
            ,retrieveExport : that.options.restBaseUrl + "export/{0}"
            ,asyncTask : that.options.restBaseUrl + "async-tasks/{0}"
            ,presetList : that.options.restBaseUrl + "presets/{0}?exporterId={1}"
            ,preset : that.options.restBaseUrl + "presets/{0}/{1}"
            ,savePreset : that.options.restBaseUrl + "presets/{0}?exporterId={1}"
            ,deletePreset : that.options.restBaseUrl + "presets/{0}/{1}"
        };
        that.exportSettings = {};
        that.currentPresetDescriptor;
        that.statusPoller;
        that.exportTaskStatus;
        that.taskId;

        // will be loaded from template file 
        that.i18n = {};
    };

    /**
     * Closes the scroll dialog
     */
    that.close = function() {
        that.dialog.close();
    };


    /**
     * Load the existing presets.
     */
    that.loadPresets = function() {
        // disable buttons
        var buttons = AJS.$("#" + that.dialog.popup.id + " div.dialog-button-panel button");
        buttons.attr("disabled", "disabled");

        // load presets, onSuccess: re-enable buttons
        // Load and init presets
        AJS.$.ajax({
            url : AJS.format(that.resources.presetList, that.spaceKey, that.options.exporterId)
            ,dataType : "json"
            ,contentType : "application/json"
            ,complete : function(request, status) {
                if(status == "success" && request.status == 200) {
                    var presetDescriptors = JSON.parse(request.responseText);

                    // render sidebar template
                    AJS.$(".scroll-sidebar").empty();
                    AJS.$.tmpl(that.templates.exportSettingsSidebar, presetDescriptors).appendTo(".scroll-sidebar");

                    // select last auto-preset, of -if not available- the default preset
                    if(presetDescriptors.autoPresets && presetDescriptors.autoPresets.length > 0) {
                        that.loadPreset(presetDescriptors.autoPresets[0].id);
                    } else {
                        that.loadPreset(presetDescriptors.defaultPreset.id);
                    }

                    // reenable buttons after presets are successfully initialized
                    buttons.removeAttr("disabled");
                } else {
                    that.displayError(request, status);
                }
            }
        });
    };

    /**
     * Delete preset with given id.
     */
    that.deletePreset = function(presetId, presetElement) {
        AJS.$.ajax({
            url: AJS.format(that.resources.deletePreset, that.spaceKey, presetId)
            ,type : "DELETE"
            ,dataType: "json"
            ,contentType : "application/json"
            ,complete : function(request, status) {
                if(status == "success" && request.status == 200) {
                    if(presetElement) {
                        // slide up preset and remove from dom
                        presetElement.slideUp(function() {
                          // Update number of presets in the list headings.
                          if (AJS.$(this).hasClass("auto-preset-item")) {
                            AJS.$("#number-of-auto-presets").text( Math.max( 0, AJS.$(".auto-preset-item").size()-1 ) );
                          } else if (AJS.$(this).hasClass("saved-preset-item")) {
                            AJS.$("#number-of-saved-presets").text( Math.max( 0, AJS.$(".saved-preset-item").size()-1 ) );
                          }
                          AJS.$(this).remove();
                        });

                        // no more presets? - we need to show the message and reload all presets
                        if(AJS.$(presetElement).siblings().length == 0)
                            that.loadPresets();
                    } else {
                        that.loadPresets();
                    }

                } else {
                    that.displayError(request, status);
                }
            }
        });

    };


    /**
     * Load and init preset with given id.
     */
    that.loadPreset = function(presetId) {
        AJS.$.ajax({
            url: AJS.format(that.resources.preset, that.spaceKey, presetId)
            ,dataType: "json"
            ,contentType : "application/json"
            ,complete : function(request, status) {
                if(status == "success" && request.status == 200) {
                    var preset = JSON.parse(request.responseText);
                    AJS.$("body").paramsToForm(preset);
                    that.currentPresetDescriptor = preset.presetDescriptor;
                } else {
                    that.displayError(request, status);
                }
            }
        });
    };


    /**
     * Kick off the export.
     */
    that.startExport = function() {
        // validate Form
        var validator = AJS.$("div.scroll-content form").validate({
            onkeyup : false
            ,focusInvalid : false
            ,onclick : false
            ,onfocusout : false
            ,errorClass : "qet-whatever-rqwer"
            ,rules : {
                "k15t-val-required": {
                    required: true
                }
            }
            ,unhighlight: function(element, errorClass) {
                AJS.$(element).next("div.error").hide();
                that.addTabErrors;
            }
            ,errorPlacement: function(error, element) {
                element.next("div.error").text(error.text()).show();
                var tabId = element.parents("div.tabs-pane").attr("id");
                AJS.$("a[href='#" + tabId + "'] strong").addClass("error");
            }
        });

        if(validator.form()) {
//            AJS.$("#com-k15t-confluence-scroll-publisher-dialog div.dialog-blanket").addClass("dialog-blanket-loading");       // needed for compatibility?
            that.dialog.resetUserMessage();
            that.exportSettings.pageId = that.pageId;
            that.exportSettings.preset = AJS.$("#publisher-settings").formParams(false);
            that.exportSettings.preset.exporter.exporterId = that.options.exporterId;
            that.exportSettings.preset.presetDescriptor = that.currentPresetDescriptor;

            AJS.$.ajax({
                url : AJS.format(that.resources.createExport)
                ,contentType : "application/json"
                ,type : "PUT"
                ,dataType : "json"
                ,data : JSON.stringify(that.exportSettings)
                ,complete : function(request, status) {
                    if(status == "success" && request.status == 202) {
                        task = JSON.parse(request.responseText);
                        that.pollTaskStatus(task.id, 500);
                        that.taskId = task.id;
                    } else {
                        that.displayError(request, status);
                    }
                }
            });
        }
    };


    /**
     * Poll the status of a task.
     *
     * @param id
     * @param delay
     */
    that.pollTaskStatus = function(id, delay) {
        var delay = delay || 500;
        AJS.$.ajax({
            url : AJS.format(that.resources.asyncTask, id)
            ,contentType : "application/json"
            ,type : "GET"
            ,dataType : "JSON"
            ,complete : function(request, status) {
                if(status == "success" && request.status == 200) {
                    exportTaskStatus = JSON.parse(request.responseText);
                    that.dialog.renderAndShowPage(2, that.templates.exportProgress, exportTaskStatus);

                    if(exportTaskStatus.finished == false) {
                        statusPoller = setTimeout(function() {
                            that.pollTaskStatus(exportTaskStatus.id, delay);
                        }, delay);
                    } else {
                        statusPoller = -1;
                        setTimeout(function() {
                            that.displayExportResult(exportTaskStatus.id);
                        }, 500);
                        if(exportTaskStatus.status == 0) {
                            that.saveCurrentSettings('Auto');
                        }
                    }
                } else {
                    that.displayError(request, status);
                }
            }
        });
    };


    /**
     * Cancel the export process
     */
    that.cancel = function() {
        AJS.$.ajax({
            type : "DELETE"
            ,url : AJS.format(that.resources.asyncTask, that.taskId)
            ,complete: function(request, status) {
                if(status == "success" && request.status == 200) {
                    // clear status poller, if active
                    if(statusPoller) {
                        clearTimeout(statusPoller);
                        that.initSettings();
                        that.dialog.displayMessage('success', that.i18n['export'].canceled, that.i18n['export'].canceledMessage);
                    }
                } else {
                    that.displayError(request, status);
                }
            }
        });
    };


    /**
     * Saves the currently used settings
     */
    that.saveCurrentSettings = function(type, presetName) {
        if(that.user) {
            that.exportSettings.preset.presetDescriptor.id = null;
            that.exportSettings.preset.presetDescriptor.name = presetName || AJS.params.pageTitle;
            that.exportSettings.preset.presetDescriptor.timestamp = (new Date()).valueOf();
            that.exportSettings.preset.presetDescriptor.type = type;

            AJS.$.ajax({
                url : AJS.format(that.resources.savePreset, that.spaceKey, that.options.exporterId)
                ,contentType : 'application/json'
                ,type : 'POST'
                ,dataType: 'JSON'
                ,data : JSON.stringify(that.exportSettings.preset)
                ,complete : function(request, status) {
                    if(status == 'success' && request.status == 200 && (type != 'Auto')) {
                        var successMessage = AJS.format(that.i18n.settings.savedName, presetName);
                        that.dialog.displayMessage('success', that.i18n.settings.saved, successMessage);
                        AJS.$(".k15t-dialog .com-k15t-scroll-results .results-savesettings")
                            .find(".description").show()
                            .next(".save-preset-form").hide().find("input[type='text']").val( that.i18n.settings.enterLabel /*"Enter label..."*/);  
                    } else if (type != 'Auto') {
                        that.displayError(request, status);
                    }
                }
            });
        }
    };


    that.displayExportResult = function(id) {
        // show result (error/success)
        exportTaskStatus.link = AJS.format(that.resources.retrieveExport, id);
        that.dialog.renderAndShowPage(3, that.templates.exportResult, exportTaskStatus);

        AJS.$(".result-message").html(exportTaskStatus.message);

        if(exportTaskStatus.status == 0) {
            // initiate download only if we are not on MSIE (which displays a "block" message)
            if(!AJS.$.browser.msie)
                that.download(AJS.format(that.resources.retrieveExport, id), 500);
        }
    };


    /**
     * Displays an error message.
     */
    that.displayError = function(request, status) {
        if(request.status == 401) {
            var redirUrl =  window.location.href.substring(AJS.params.domainName.length);

            var error = AJS.format(that.i18n.error.notAllowed, AJS.params.contextPath);

            that.dialog.displayMessage("Error",
                    request.statusText + " (" + request.status + ")",
                    error);    
            return;
        }

        var exceptionType = request.getResponseHeader("X-ScrollExceptionType");
        var responseMessage = {
            severity : that.i18n.common.error //"Error"
            ,message : that.i18n.error.unexpected //"Unexpected Error. Please check with your Confluence system administrator."  
        };

        if(exceptionType != null) {
            try {
                var responseMessage = JSON.parse(request.responseText);
            } catch(e) {}
            that.dialog.displayMessage(responseMessage.severity,
                    request.statusText + " (" + request.status + ")", responseMessage.message,
                    responseMessage.stackTrace);
        } else {
            that.dialog.displayMessage(responseMessage.severity,
                    request.statusText + " (" + request.status + ")", responseMessage.message);
        }
    };


    var supportWin;
    that.openSupportUi = function() {
        // first we close if is already open
        if(supportWin)
            supportWin.close();
        supportWin = window.open("/", "_support");
        AJS.$(".k15t-dialog .support-form")
            .attr("action", AJS.params.contextPath + "/plugins/com.k15t.scroll.pdf/support.action")
            .attr("method", "POST")
            .attr("target", "_support").submit();
    };


    /**
     * Initiates the download.
     */
    that.download = function(downloadUrl, timout) {
        window.setTimeout(function() {
            window.location.href = downloadUrl;
        }, (timout || 500));
    };


    /**
     * (Re-)init settings page.
     */
    that.initSettings = function() {
      // empty container for messages if present.
        that.dialog.resetUserMessage();
        that.dialog.renderAndShowPage(1, that.templates.exportSettings, that.options);
        that.loadPresets();
    };


    that.open = function() {

        AJS.$("body").append("<div id=\"k15t-temp\"/>");

        // First we load the templates to k15t-temp and init in callback
        AJS.$("#k15t-temp").load(that.options.exportTemplateUrl + "&spaceKey=" + AJS.params.spaceKey + "&pageId=" + AJS.params.pageId, function() {
            that.templates.exportSettings = AJS.$("#com-k15t-scroll-settings").template();
            that.templates.exportSettingsSidebar = AJS.$("#com-k15t-scroll-settings-sidebar").template();
            that.templates.exportProgress = AJS.$("#com-k15t-scroll-progress").template();
            that.templates.exportResult = AJS.$("#com-k15t-scroll-result").template();
            that.templates.footerText = AJS.$("#com-k15t-scroll-footertext").template();
            that.templates.permaLinkContent = AJS.$("#com-k15t-scroll-permalink-window").template();
            // load i18n json for runtime messages
            that.i18n = JSON.parse( AJS.$('#com-k15t-scroll-export-i18n').html() );

            // Required by 18n in humane.js
            SCROLL.i18n = that.i18n;

//                TODO can we remove this  ?
//                AJS.$("<div id=\"#k15t-temp\"/>").remove();

            // ================================================================================
            // error message handling =========================================================
            // Init support Ui
            AJS.$(".k15t-dialog .open-support-form").die("click");
            AJS.$(".k15t-dialog .open-support-form").live("click", function(evt) {
                evt.preventDefault();
                that.openSupportUi();
            });


            // ================================================================================
            // settings dialog ================================================================

            // Toggle visibility of page selection configs
            var togglePageSelectionConfigs = function() {
                AJS.$(".k15t-dialog .additionalConfigPSS").slideUp();
                AJS.$(this).parent().next().slideDown();
            };
            AJS.$('body').undelegate(".k15t-dialog .pageSelectionStrategy-radio", "change");
            AJS.$('body').delegate(".k15t-dialog .pageSelectionStrategy-radio", "change", togglePageSelectionConfigs);


            // ================================================================================
            // preset-sidebar =================================================================

            // Toggle visibility of presets
            var togglePresets = function() {
                if(AJS.$(this).parent().hasClass("presets-auto")) {
                    AJS.$(".presets-sidebar .toggle-target").hide().prev().removeClass("active");
                    AJS.$(".presets-sidebar .presets-auto .toggle-target").show().prev().addClass("active");
                } else if(AJS.$(this).parent().hasClass("presets-saved")) {
                    AJS.$(".presets-sidebar .toggle-target").hide().prev().removeClass("active");
                    AJS.$(".presets-sidebar .presets-saved .toggle-target").show().prev().addClass("active");
                }
            };
            AJS.$(".k15t-dialog .presets-sidebar .presets-auto .toggle-trigger").die("click");
            AJS.$(".k15t-dialog .presets-sidebar .presets-auto .toggle-trigger").live("click", togglePresets);
            AJS.$(".k15t-dialog .presets-sidebar .presets-saved .toggle-trigger").die("click");
            AJS.$(".k15t-dialog .presets-sidebar .presets-saved .toggle-trigger").live("click", togglePresets);

            AJS.$(".k15t-dialog .presets-sidebar .preset-item").die("click");
            AJS.$(".k15t-dialog .presets-sidebar .preset-item").live("click", function(event) {
                if(AJS.$(event.target).is(".preset-item-delete")) {
                    return true;   // disables bubbling, see comments on http://api.jquery.com/event.stopPropagation/
                }
                event.preventDefault();
                that.loadPreset(AJS.$(this).attr("presetid"));
            });
            AJS.$(".k15t-dialog .presets-sidebar .preset-item-delete").die("click");
            AJS.$(".k15t-dialog .presets-sidebar .preset-item-delete").live("click", function(event) {
                event.preventDefault();
                var presetElement = AJS.$(this).parents(".preset-item");
                var presetId = presetElement.attr("presetid");
                that.deletePreset(presetId, presetElement);
            });

            // Handlers for the REST URL Dialog.
            AJS.$(".k15t-dialog .presets-sidebar .preset-item-permalink").die('click');
            AJS.$(".k15t-dialog .presets-sidebar .preset-item-permalink").live('click', function(e){
              e.preventDefault();
              that.showRestUrlDialog(AJS.$(this).closest('.preset-item').attr('presetid'));
              return false;
            });

            // ================================================================================
            // results screen =================================================================

            // download link
            AJS.$(".k15t-dialog .com-k15t-scroll-results .results-download").die("click");
            AJS.$(".k15t-dialog .com-k15t-scroll-results .results-download").live("click", function() {
                window.location.href = AJS.$(this).find("a").attr("href");
            });
            // display save settings input field/form
            AJS.$(".k15t-dialog .com-k15t-scroll-results .results-savesettings").die("click");
            AJS.$(".k15t-dialog .com-k15t-scroll-results .results-savesettings").live("click", function(event) {
                AJS.$(".k15t-dialog .com-k15t-scroll-results .results-savesettings")
                        .find(".description").hide()
                        .next(".save-preset-form").show().find("input.text").select();
            } );
            // save settings
            AJS.$("body").undelegate(".k15t-dialog .com-k15t-scroll-results .results-savesettings .save-preset-form", "submit");
            AJS.$("body").delegate(".k15t-dialog .com-k15t-scroll-results .results-savesettings .save-preset-form", "submit", function(event) {
                event.preventDefault();
                var presetName = AJS.$(this).find(".savePresetName").val();
                that.saveCurrentSettings('Saved', presetName);
            });
            AJS.$(".k15t-dialog .com-k15t-scroll-results .results-erroranalysis").die("click");
            AJS.$(".k15t-dialog .com-k15t-scroll-results .results-erroranalysis").live("click", function() {
                window.location.href = AJS.$(this).find("a").attr("href");
            });


            // ================================================================================
            // dialog =========================================================================
            that.dialog = new KJS_LOCAL.Dialog(AJS.$, {
                id: that.dialogId
                ,dialogClass: that.options.dialogClass
                ,width: 860
                ,height: 560
                ,footerHtml: AJS.$.tmpl(that.templates.footerText, that.options)
                ,pages : {
                    "settings" : {
                        title: that.i18n["export"].title
                        ,panels: {
                            "first" : {
                                template: that.templates.exportSettings
                            }
                        }
                        ,actions: {
                            close: {
                                name: that.i18n.common.cancel
                                ,type: "link"
                                ,action: that.close
                            }
                            ,start: {
                                name: that.i18n['export'].start //"Start Export"
                                ,type: "button"
                                ,action: that.startExport
                            }
                        }
                    }
                    ,"progress" : {
                        title: that.i18n["export"].title
                        ,panels : {
                            "first" : {
                                template: that.templates.exportProgress
                            }
                        }
                        ,actions: {
                            cancel: {
                                name: that.i18n.common.cancel
                                ,type: "link"
                              ,action: that.cancel
                            }
                        }
                    }
                    ,"result" : {
                        title: that.i18n["export"].title
                        ,panels : {
                            "first" : {
                                template: that.templates.exportResult
                            }
                        }
                        ,actions: {
                            close: {
                                name: that.i18n.common.close //"Close"
                                ,type: "link"
                                ,action: that.close
                            }
                            ,changeSettings: {
                                name: that.i18n.settings.change //"Change Settings"
                                ,type: "button"
                                ,action: that.initSettings
                            }
                        }
                    }
                }
                ,feedbackLink: that.options.feedbackLink
                ,titleIcon: that.options.titleIcon
                ,postInit: function() {
                }
            });

            that.initSettings();
            AJS.$("#" + that.options.id).find("input[type=text]:first").focus();
        });

    };
    
    that.showRestUrlDialog = function(presetId) {
        var dialogData = {
            restBaseUrl : that.options.restBaseUrl,
            presetId : presetId,
            pageId : that.pageId
        };

        // this (permalink) dialog
        var permalinkDialog;

        var closePermaDialog = function() {
            if (permalinkDialog) {
                permalinkDialog.close();
            }
        };

        permalinkDialog = that.dialog.newDialog(jQuery, {
            id : 'scroll-pdf-template-permalink',
            width : 500,
            height : 250,
            pages : {
                perma : {
                    title : that.i18n.preset.permalinkDialog,
                    actions : {
                        close : {
                            name : that.i18n.common.close,
                            action : closePermaDialog
                        }
                    }
                }
            }
        });

        permalinkDialog.addPanel(1, '', that.templates.permaLinkContent, dialogData);
        permalinkDialog.popup.gotoPanel(0);
    };

    return that;
};





