/*

CAUTION! UGLY HACKS AHEAD 

Canvas drawing. Supports mouse, touch and pen.
Also supports pressure sensitivity on browsers with Point Events (eg using the Surface/Wacom pen in Microsoft Edge)
*/

var strokemultiplier = 5;
var bgcolour = "#FFF";

var canvas = document.getElementById("canvas");
var exportButton = document.getElementById("export-button");
var sigContainer = document.getElementById("sig-container");
var ctx = canvas.getContext("2d");
var { width, height } = sigContainer.getBoundingClientRect();

var offsetW = 6; // tweak canvas size
var offsetH = 6;
var offsetX = 13; // tweak cursor position for plot
var offsetY = 53;

canvas.width = width - offsetW;
canvas.height = height - offsetH;

var ctxprops = {};
var cursor = {};
var currentpoint;

ctx.lineCap = "round";

if ("PointerEvent" in window) {
	canvas.addEventListener("pointerdown", onDown);
} else if ("TouchEvent" in window) {
	canvas.addEventListener("touchstart", onDown);
}
canvas.addEventListener("mousedown", onDown);

exportButton.addEventListener("mousedown", exportImage);

function onDown(e) {

	e.stopPropagation();
	e.preventDefault();

	if (currentpoint) return;

	currentpoint = 1;

	if (e.type == "pointerdown") {

		currentpoint = e.pointerId;

		if (e.button === 5) {

			//eraser

			ctxprops.globalCompositeOperation = ctx.globalCompositeOperation;
			ctxprops.strokeStyle = ctx.strokeStyle;

			ctx.globalCompositeOperation = "destination-out";
			ctx.strokeStyle = "rgba(0,0,0,1)";

		}

		document.addEventListener("pointermove", onMove);
		document.addEventListener("pointerup", onUp);
	}	else if (e.type == "touchstart") {
		document.addEventListener("touchmove", onMove);
		document.addEventListener("touchend", onUp);
	} else {
		document.addEventListener("mousemove", onMove);
		document.addEventListener("mouseup", onUp);
	}

	if (e.type == "touchstart") {
		cursor.x = cursor.lx = e.touches[0].clientX;
		cursor.y = cursor.ly = e.touches[0].clientY;
	} else {
		cursor.x = cursor.lx = e.clientX;
		cursor.y = cursor.ly = e.clientY;
	}

	render();
}

function onMove(e) {

	e.stopPropagation();
	e.preventDefault();

	if (e.type == "pointermove") {
		if (currentpoint !== e.pointerId) return; 
		ctx.lineWidth = e.pressure * strokemultiplier;
	} else {
		ctx.lineWidth = strokemultiplier;
	}

	if (e.type == "touchmove") {
		cursor.x = e.touches[0].clientX;
		cursor.y = e.touches[0].clientY;
	} else {
		cursor.x = e.clientX;
		cursor.y = e.clientY;
	}

	render();

	cursor.lx = cursor.x;
	cursor.ly = cursor.y;

}

function onUp(e) {

	if (e.type == "pointerup") {

		if (e.pointerId !== currentpoint) return;

		if (e.button === 5) {
			//eraser
			ctx.globalCompositeOperation = ctxprops.globalCompositeOperation;
			ctx.strokeStyle = ctxprops.strokeStyle;
		}
		document.removeEventListener("pointermove", onMove);
		document.removeEventListener("pointerup", onUp);
	} else if (e.type == "touchend") {
		document.removeEventListener("touchmove", onMove);
		document.removeEventListener("touchend", onUp);
	} else {
		document.removeEventListener("mousemove", onMove);
		document.removeEventListener("mouseup", onUp);
	}
	currentpoint = null;
}

function render() {
		ctx.save();
		ctx.translate(width / 2, height / 2);
		ctx.beginPath();  
		ctx.moveTo(cursor.lx - width / 2 - offsetX, cursor.ly - height / 2 - offsetY);
		ctx.lineTo(cursor.x - width / 2 - offsetX, cursor.y - height / 2 - offsetY);
		ctx.stroke();
		ctx.restore();
}

function exportImage() {
    var MIME_TYPE = "image/png";
    var fileName = "signature";
    var imgURL = canvas.toDataURL(MIME_TYPE);
    var dlLink = document.createElement('a');
    dlLink.download = fileName;
    dlLink.href = imgURL;
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
}
