Freetile
========

Freetile is a plugin for [jQuery](http://jquery.com) that enables the organization of webpage content in an efficient, dynamic and responsive layout. It can be applied to a container element and it will attempt to arrange its children in a layout that makes optimal use of screen space, by "packing" them in a tight arrangement. Freetile has been the layout engine behind [Assemblage](http://yconst.com/web/assemblage) and [Assemblage Plus](http://yconst.com/web/assemblage-plus) for almost two years, and now it becomes available as an independent Open Source project. 

Features
========

Freetile is inspired by similar, existing efforts such as [Masonry](http://masonry.desandro.com/), [vGrid](https://github.com/xlune/jQuery-vGrid-Plugin) and [Wookmark](http://www.wookmark.com/jquery-plugin). 
However, it differs from these solutions in some aspects:

- It allows for any size of elements to be packed without using a fixed-size column grid, so you don't have to worry about specifying a column width appropriate to the size of your elements.

- The algorithm that evaluates each possible insertion position is easily customizable, allowing for different preferences to be expressed, e.g. a preference to left- or right-alignment of elements, or proximity between certain elements.


Additionally, Freetile has the following key features:

- A smart animation routine allows distinguishing between elements that is meaningful to be animated and ones that are not (e.g. elements that have been just added to the arrangement, or those that are not visible). Special classes allow for explicitly limiting animation to select elements.

- It has been battle-tested through it's use in the many hundreds sites that make use of the [Assemblage](http://yconst.com/web/assemblage) and [Assemblage Plus](http://yconst.com/web/assemblage-plus) templates.


Usage
========


Default usage:

<pre>
$('#container').freetile();
</pre>


Enable animation, with a per-element delay of 30ms:

<pre>
$('#container').freetile({
	animate: true,
	elementDelay: 30
});
</pre>


Specify a custom element selector:

<pre>
$('#container').freetile({
	selector: 'customSelector'
});
</pre>

Specify a scoring function with a preference for left side placement:

<pre>
$('#container').freetile({
	scoreFunction: function(o) {
		return -(o.TestedTop) * 8 - (o.TestedLeft);
	}
});
</pre>

Append some elements to an existing container:

<pre>
$('#container').freetile({
	contentToAppend: 'someSelector';
});
</pre>

Options
====
Various options may be passed along to Freetile when it is called:
<pre>
$('#container').freetile({
	// options
	option1: 'value',
	option2: 'value',
	option3: 'value'
	// etc...
});
</pre>

Following is a short list of options and their description.

<pre>
	selector
</pre>
Elements matching the selector will be tiled, others will be ignored.


<pre>
	animate
</pre>
Should elements be animated? Animation will occur for elements that have been already placed and are visible, i.e. elements that are about to appear or are invisible will not be animated (but will still be tiled). Furthermore, elements with both their starting and ending position outside the window area will not be animated. 
Default: false


<pre>
	elementDelay
</pre>
A delay may be inserted between each element's animation start, resulting in more appealing animations. Units in ms.
Default: 0


<pre>
	containerResize
</pre>
Should the content be re-tiled on window resize?
Default: true


<pre>
	containerAnimate
</pre>
Should the container of the elements be animated, as its size changes? Useful if the placement of surrounding content depends on the container size.
Default: false


<pre>
	customEvents
</pre>
One or more custom events to trigger re-tiling.

<pre>
	loadCheckSelector
</pre>
Freetile will make sure that images of elements matching this selector are loaded (using ImagesLoaded).
Useful to exclude elements if inline dimension styles are being applied to e.g. images.
Default: :not(.ignore-load-check)

<pre>
	callback
</pre>
A callback function to be called when tiling is done. Please note that this includes the animation delay.


<pre>
	persistentCallback
</pre>
Should the callback function be persistent or reset after next tiling (one-shot)? Useful for triggering common tasks at the end of the animation process.
Default: false

CSS3 GPU animations
-------------------

Using CSS3 `translate3d` significantly improves animation performance, especially on mobile devices. You can force CSS3 translations with this new option.  

<pre>
	csstransforms3d
</pre>
If set to true, it means that css3 3D transforms (on the GPU) are available and should be used for all animations over the slower `jquery.animate`. 
Default: false

Should be set to the value of a feature detect (e.g. using Modernizr)

<pre>
$('#container').freetile({
	...
	selector: '.grid-item',
	csstransforms3d: $('html').is('.csstransforms3d')
});
</pre>

*Gotcha: CSS transforms do not effect document flow so your tile container height will no longer reflect the true height of your grid* 

Make sure you are also using CSS3 transitions on each element in your grid to get it to animate: 

<pre>

.grid-item{
	webkit-transition: all .25s ease-out;
	-moz-transition: all .25s ease-out;
	-o-transition: all .25s ease-out;
	-ms-transition: all .25s ease-out;
	transition: all .25s ease-out;
}

</pre>




Demo
====

[Demo](http://yconst.com/freetile-demo/) at [yconst.com](http://yconst.com)

License
========

Freetile is licensed under the [BSD License](http://www.opensource.org/licenses/bsd-license.php).
