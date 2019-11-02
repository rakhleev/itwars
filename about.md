---
layout: page
title: About
permalink: /about/
---

This is Smart Material theme.

Github repository: [https://github.com/ssokurenko/jekyll-smart-material](https://github.com/ssokurenko/jekyll-smart-material)

<style>
#fullscreen-toggle {
    position: absolute;
    top: 2rem;
    right: 7rem;
}
.beep-button {
    position: relative;
    display: inline-block;
    border-radius: 4rem;
    width: 4rem;
    height: 4rem;
    opacity: 0.2;
    cursor: pointer;
}</style>

<p><input type="button" class="beep-button" onclick="toggleFullscreen()" ><img class="beep-button" id="fullscreen-toggle" ></p>
<script>/**
 * Toggle fullscreen function who work with webkit and firefox.
 * @function toggleFullscreen
 * @param {Object} event
 */
function toggleFullscreen(event) {
  var element = document.body;

	if (event instanceof HTMLElement) {
		element = event;
	}

	var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;

	element.requestFullScreen = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || function () { return false; };
	document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || function () { return false; };

	isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();
}</script>