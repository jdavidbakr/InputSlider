function init_page() {
    $$('.input_slider').each(function(item) {
        var input_slider = new InputSlider(item);
    });
}

window.addEvent('domready',init_page);
