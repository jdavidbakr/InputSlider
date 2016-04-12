InputSlider
===========

![Screenshot](https://s3.amazonaws.com/catalyst-public/MooTools-Screenshots/InputSlider.jpg)

This class will replace an input element with a visual slider. The actual value of the input will display
and can be colored based on its range if desired. The default colorization is red for 0
and blue for 100 and can be overridden for your own function.

How to use
----------

Pass the input element to the class and it will take care of the rest.

You must add a json string to the "rel" tag with the following keys:

* currency: **Optional** - If this exists, the text will display as currency
* percent: **Optional** - If this exists, the text will display as a percent
* range: **Required** - This should contain an array for the range (minimum/maximum)
* default_value: **Optional** - What the default value should be for the input element if there is no value tag already
* value_class: **Required** - The class to apply to the value element
* colorize100: **Optional** - If this exists, the value element will have a color applied based on its value
* snap: **Optional** - What value to snap to

Options
-------

* slider_class: The class to apply to the Slider
* slider_knob_class: The class to apply to the knob of the slider
* slider_snap_class: The class to apply to the "snap" indicator
* slider_snap_width: The width of the slider snap item (defaults to 1)
* slider_snap_threshold: The threshold for the snap to activate
* currency_format_options: If the input element is currency, this is the format for the numeric value
* percent_format_options: If the input element is a percent, this is the format for the numeric value

