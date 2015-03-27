/*
---
description: Utility for creating parts of a form that can be activated based on selections.

license: MIT-Style

name: InputSlider

authors:
 - Jon Baker

provides: InputSlider

requires: 
 - More/Slider
 - More/Color
 - More/Number.Format
 - Core/JSON
...
*/

/*
 Slider control with colorization options
 
 Expects the item passed to be an input element in the following format:
 
 <input type="text" name="name" value="value" class="slider" rel="{range:[1,100],default_value:90,colorize100:true}">
 
 Can also include a 'snap' value that will place a snap indicator, and will snap the slider if it's within the threshold.
 
 Options in rel:
 range: the range for the slider
 default_value: The default value
 colorize100: True to have the color adjust with the changes
 snap: Where to snap/draw the snap line
 currency: If true, display the value as currency on the screen
 percent: If true, show a % after the value
 value_class: The class for the dom element that contains the value
 
 Obviously adjust the rel tag accordingly
 */

var InputSlider = new Class({
    Implements: Options,
    item: null, // The input element that started the whole thing
    snap: null, // The snap value
    snap_object: null, // The actual snap object
    knob: null, // The slider handle
    slider: null, // The slider
    slider_element: null, // The slider element
    ignore_snap: false, // Set to true if we want to ignore the snap value
    currency: false, // Set to true if we are displaying a currency
    percent: false, // Set to true if we are displaying a percent

    options: {
        'slider_class': 'slider',
        'slider_knob_class': 'slider_knob',
        'slider_snap_class': 'slider_snap',
        'slider_snap_width': 1,
        'slider_snap_threshold': 3,
        'currency_format_options': {
            decimals: 2,
            prefix: '$'
        },
        'percent_format_options': {
            decimals: 0,
            suffix: '%'
        }
    },
    initialize: function (item, op) {
        this.setOptions(op);
        this.item = item;
        // Hide the item
        item.setStyle('display', 'none');
        // Add the slider
        this.slider_element = new Element('div', {
            'class': this.options.slider_class
        }).inject(item, 'after');
        var knob = new Element('div', {
            'class': this.options.slider_knob_class
        }).inject(this.slider_element);
        this.knob = knob;
        var data = JSON.decode(item.get('rel'));
        if (!data) {
            return;
        }

        // Currency?
        if (data.currency) {
            this.currency = true;
        } else {
            this.currency = false;
        }
        // Percent?
        if (data.percent) {
            this.percent = true;
        } else {
            this.percent = false;
        }

        var range = data.range;
        var value = item.get('value');
        if (!value) {
            value = data.default_value;
            item.set('value', value);
        }
        if (value < range[0]) {
            value = range[0];
        }
        if (value > range[1]) {
            value = range[1];
        }
        var value_text = new Element('div', {
            'html': this.get_value_text(value),
            'class': data.value_class
        }).inject(this.slider_element, 'before');
        if (data.colorize100) {
            var color = this.get_color(value);
            value_text.setStyle('color', color.rgbToHex());
        }

        var ready = false;
        if (range[0] > range[1]) {
            range[0] = range[1];
        }
        this.slider = new Slider(this.slider_element, knob, {
            'range': range,
            'initialStep': value.toInt(),
            onChange: function (value) {
                if (isNaN(value)) {
                    this.slider.set(this.slider.min);
                    return;
                }
                if (!this.ignore_snap && this.slider && data.snap) {
                    var diff = Math.abs(value - data.snap);
                    if (diff > 0 && diff < this.options.slider_snap_threshold) {
                        value = data.snap;
                        this.slider.set(value);
                    }
                }
                var value_display = this.get_value_text(value);
                value_text.set('html', value_display);
                if (data.colorize100) {
                    var color = this.get_color(value);
                    value_text.setStyle('color', color.rgbToHex());
                }
            }.bind(this),
            onComplete: function (v) {
                this.slider_active = false;
                var form = item.getParent('form');
                var old_value = item.get('value');
                if (old_value !== v) {
                    item.set('value', v);
                    item.fireEvent('change');
                    if (ready) {
                        if (form) {
                            form.fireEvent('change');
                        } else {
                            item.fireEvent('change');
                        }
                    }
                }
            }
        });
        item.store('Slider', this.slider);
        item.store('InputSlider', this);
        ready = true;

        // Snap indicator?
        if (data.snap) {
            this.snap = data.snap;
            this.set_snap();
        }

        item.addEvent('update', this.update_from_value.bind(this));
    },
    get_color: function (value) {
        /*
         * The function to generate the color.
         * Default is red for zero, blue for 100.
         * This will need to be overridden for values outside of 0 to 100.
         */
        var blue = Math.ceil(value * 255 / 100);
        if (blue < 0) {
            blue = 0;
        } else if (blue > 255) {
            blue = 255;
        }
        var red = Math.ceil((100 - value) * 255 / 100);
        if (red < 0) {
            red = 0;
        } else if (red > 255) {
            red = 255;
        }
        var color = [red, 0, blue];
        return color;
    },
    set_snap: function () {
        if (!this.snap_object) {
            this.snap_object = new Element('div', {
                'class': this.options.slider_snap_class
            }).inject(this.knob, 'before');
        }
        var width = this.slider_element.getSize().x - this.knob.getSize().x;
        var range = [this.slider.min, this.slider.max];
        var per_step = width / (range[1] - range[0]);
        var left;
        if (this.snap > range[1]) {
            left = per_step * (range[1] - range[0]);
        } else {
            left = per_step * (this.snap - range[0]);
        }
        left += this.knob.getSize().x / 2;
        this.snap_object.setStyle('left', left);
    },
    get_value_text: function (value) {
        if (this.percent) {
            value += '%';
        }
        if (this.currency) {
            value = parseInt(value).format(this.options.currency_format_options);
        }
        return value;
    },
    update_from_value: function () {
        this.ignore_snap = true;
        this.slider.set(this.item.get('value').toInt());
        this.ignore_snap = false;
    }
});
