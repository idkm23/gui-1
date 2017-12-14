/**
 * Name: Christopher Munroe, christopher_munroe1@student.uml.edu
 * Student of COMP.4610 GUI Programming I
 * Created: 12/3/2017
 */

var IMG_DIMENSION = 293;
var myhttp;

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http) {
    myhttp = $http;
    var images = document.getElementById('images');
    $scope.add = function() {
        var file = document.querySelector('input[type=file]').files[0];
        var reader  = new FileReader();

        reader.onload = function(e) {
            var extension = file.name.substring(file.name.indexOf(".")+1);
            var save_obj = {
                ext : extension,
                blob : reader.result
            }
            $http.post('save_img.php', save_obj).then(function (data) {
                create_img("images/" + data.data + "." + extension, data.data, $http);
            });
        };

        reader.readAsDataURL(file);
    }
    angular.element(document).ready(function() {
        load_saved_imgs($http);
        document.getElementById("brightness-slider").oninput = adjust_brightness;
        document.getElementById("contrast-slider").oninput = adjust_contrast;
        document.getElementById("hue-slider").oninput = adjust_hue;
    });
});

function load_saved_imgs($http) {
    $http.get("get_images.php").then(function(response) {
        response.data.forEach(function(element) {
            create_img(element,
                element.substring(element.indexOf("/") + 1, element.indexOf(".")), $http);
        });
    });
}

function create_img(src, id, $http) {
    var img_and_buttons = document.createElement("div");
    img_and_buttons.id = id;
    img_and_buttons.className = "img_and_buttons";
    var new_imgpadding = document.createElement("a");
    new_imgpadding.href = src;
    new_imgpadding.className = "imgwrap";
    var toast = document.createElement("div");
    toast.className = "toast";
    img_and_buttons.appendChild(toast);

    var new_img = new Image();
    new_img.className = id;
    new_img.onload = function() {
        new_img.style.top = (IMG_DIMENSION/2 - new_img.height/2) + "px";
        new_img.style.left = (IMG_DIMENSION/2 - new_img.width/2) + "px";
        images.appendChild(img_and_buttons);
    };
    new_img.src = src + "?" + new Date().getTime();

    var img_buttons = document.createElement("div");
    img_buttons.className = "img_buttons";
    var close_btn = document.createElement("i");
    close_btn.className = "fa fa-times-circle fa-lg close_btn";
    img_buttons.appendChild(close_btn);
    var link_btn = document.createElement("i");
    link_btn.className = "fa fa-link fa-lg link_btn";
    img_buttons.appendChild(link_btn);
    var draw_btn = document.createElement("i");
    draw_btn.className = "fa fa-paint-brush fa-lg draw_btn";
    img_buttons.appendChild(draw_btn);

    close_btn.onclick = function() {
        var remove_obj = {
            "id" : id
        }
        $http.post('remove_img.php', remove_obj);
        document.getElementById("images").removeChild(img_and_buttons);
    }
    link_btn.onclick = function() {
        copyTextToClipboard("http://www.cs.uml.edu/~cmunroe/461f2017/final/" + src);
        toast.innerHTML = "URL copied to clipboard!";
        toast.style.display = "initial";
        toast.style.opacity = 0.8;
        setTimeout(function(){
            toast.style.opacity = 0;
        }, 2);
        setTimeout(function(){
            toast.style.display = "none";
        }, 1000);
    }
    draw_btn.onclick = function() {
        set_editor(new_img);   
        show_editor(true);
    }
    // show overlay
    img_and_buttons.onmouseover = function() {
        img_buttons.style.opacity = 1;
    }
    img_and_buttons.onmouseout = function() {
        img_buttons.style.opacity = 0;
    }

    new_imgpadding.appendChild(new_img);
    img_and_buttons.appendChild(new_imgpadding);
    img_and_buttons.appendChild(img_buttons);
}

var editor_img;
function set_editor(img) {
    var c = document.getElementById("editor-canvas");
    c.width = img.width;
    c.height = img.height;
    var ctx = c.getContext("2d");
    editor_img = img;
    ctx.drawImage(editor_img, 0, 0);
}

function show_editor(visible) {
    if (visible) {
        document.getElementById("editorwrap").style.display = "initial";
        document.getElementById("brightness-slider").value = 1;
        document.getElementById("contrast-slider").value = 1;
        document.getElementById("hue-slider").value = 1;
    } else {
        document.getElementById("editorwrap").style.display = "none";
    }

}

function save_editor_img() {
    var c = document.getElementById("editor-canvas");
    console.log(editor_img.className);
    var save_obj = {
        name : editor_img.className,
        ext : "png",
        blob : c.toDataURL()
    }
    myhttp.post('save_img.php', save_obj).then(function (data) {
        console.log("refreshin");
        var src = editor_img.src + "?";
        var raw = src.substring(0, src.indexOf("?"));
        editor_img.src = raw + "?" + new Date().getTime();
    });
    show_editor(false);
}

function adjust_brightness() {
    var num = this.value;
    var c = document.getElementById("editor-canvas");
    var ctx = c.getContext("2d");
    ctx.filter = "brightness(" + 100*num + "%)";
    ctx.drawImage(editor_img, 0, 0);
}

function adjust_contrast() {
    var num = this.value;
    var c = document.getElementById("editor-canvas");
    var ctx = c.getContext("2d");
    ctx.filter = "contrast(" + 100*num + "%)";
    ctx.drawImage(editor_img, 0, 0);
}

function adjust_hue() {
    var num = this.value;
    var c = document.getElementById("editor-canvas");
    var ctx = c.getContext("2d");
    ctx.filter = "hue-rotate(" + 180*(num-1) + "deg)";
    ctx.drawImage(editor_img, 0, 0);
}

function rotate() {
    console.log("hello");
    var c = document.getElementById("editor-canvas");
    var ctx = c.getContext("2d");

    var img_cache = new Image();
    img_cache.onload = function () {
        c.width = c.height;
        c.height = c.width;

        ctx.save();
        ctx.translate(c.width, c.height / c.width);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img_cache, 0, 0);               
        ctx.restore();
    }
    img_cache.src = c.toDataURL();
}

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}

