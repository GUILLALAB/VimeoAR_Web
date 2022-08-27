
dark_color_picker.on('change', (color) =>  {
    document.getElementById("butterfly").style.setProperty('--butterfly-color', color.toHEX());
    document.getElementById("butterfly").style.setProperty('--butterfly-opacity', color.a / 255);
    light_color_picker.color.fromHSVa(color.h, color.s, color.v, color.a);
});

light_color_picker.on('change', (color) => {
    document.getElementById("butterfly").style.setProperty('--butterfly-color', color.toHEX());
    document.getElementById("butterfly").style.setProperty('--butterfly-opacity', color.a / 255);
    dark_color_picker.color.fromHSVa(color.h, color.s, color.v, color.a);
});

