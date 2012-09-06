Freetile
========

Freetile is a plugin for [jQuery](http://jquery.com) that enables the organization of webpage content in an efficient, dynamic and responsive layout. It can be applied to a container element and it will attempt to arrange it's children in a layout that makes optimal use of screen space, by "packing" them in a tight arrangement. Freetile has been the layout engine behind [Assemblage](http://yconst.com/web/assemblage) and [Assemblage Plus](http://yconst.com/web/assemblage-plus) for almost two years, and now it becomes available as an independent Open Source project. 

Features
========

Freetile is inspired by similar, existing efforts such as [Masonry](http://masonry.desandro.com/), [vGrid](https://github.com/xlune/jQuery-vGrid-Plugin) and [Wookmark](http://www.wookmark.com/jquery-plugin). 
However, it differs from these solutions in some aspects:

- It allows for any size of elements to be packed without using a fixed-size column grid, so you don't have to worry about specifying a column width appropriate to the size of your elements.

- The algorithm that evaluates each possible insertion position is easily customizable, allowing for different preferences to be expressed, e.g. a preference to left- or right-alignment of elements, or proximity between certain elements.


Additionally, Freetile has the following key features:

- A smart animation routine allows distinguishing between elements that is meaningful to be animated and ones that are not (e.g. elements that have been just added to the arrangement, or those that are not visible). Special classes allow for explicitly limiting animation to select elements.

- It has been battle-tested through it's use in the many hundreds sites that make use of the [Assemblage](http://yconst.com/web/assemblage) and [Assemblage Plus](http://yconst.com/web/assemblage-plus) templates. Furthermore, it has been used for layout in projects such as [Properietary Polymers](http://pp.yconst.com) and [Reffffound](http://reffffound.yconst.com).


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

Demo
====

[Demo](http://yconst.com/web/freetile) at [yconst.com](http://yconst.com)

License
========

Freetile is licensed under the [BSD License](http://www.opensource.org/licenses/bsd-license.php).