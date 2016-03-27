var d3 = require('d3'); // const?
import linkVisualization from './link-visualization';

var treeVisualization = {};

treeVisualization.duration = linkVisualization.duration;

treeVisualization.handleClick = (d) => {
  if (d.children) {
    // If the children are showing, hide them.
    if (!d.childrenHidden) {
      d.children.forEach(child => {
        var treeNode = d3.select(document.getElementById(child.name));
        treeNode.datum(child).call(treeVisualization.hide, treeVisualization.duration);
        var linkNode = d3.select(document.getElementById('linkTo' + child.name));
        linkNode.call(linkVisualization.exit, linkVisualization.diagonal, treeVisualization.duration);

      });
      d.childrenHidden = true;
    // If the children are hidden, show them.
    } else {
      d.children.forEach(child => {
        var treeNode = d3.select(document.getElementById(child.name));
        // Is showing children the same as updating them?
        treeNode.datum(child).call(treeVisualization.update, treeVisualization.duration);
        var linkNode = d3.select(document.getElementById('linkTo' + child.name));
        linkNode.call(linkVisualization.enter, linkVisualization.diagonal, treeVisualization.duration);
      });
      d.childrenHidden = false;
    }
  }
}

treeVisualization.hide = (selection, duration) => {
  var transition = selection.transition()
    .duration(duration)
    .attr("transform", function(d) { return "translate(" + d.parent.y + "," + d.parent.x + ")"; });

    transition.select("circle")
      .attr("r", 1e-6);

    transition.select("text")
      .style("fill-opacity", 1e-6);
  }

// Set the attributes for nodes that are new to the DOM, including placing them in their initial position (x0, y0).
treeVisualization.enter = (selection, duration) =>{
  // Translate this node d.y0 units right and d.x0 units down.
  selection.attr("transform", function(d) { return "translate(" + d.y0 + "," + d.x0 + ")"; })
  .on("click", treeVisualization.handleClick);

  selection.select("circle")
    .attr("r", 1e-6)
    // Right now,the d._children property is undefined (because we haven't added it). Do we need the next line?
    .style("fill", function(d) { return d._children ? "lightsteelblue" : d.level; });

  selection.select("text")
    .attr("x", function(d) { return d.children || d._children ? -20 : 20; }) // had 13 rather than 20
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
    .text(function(d) { return d.name; })
    .style("fill-opacity", 1e-6);

  treeVisualization.update(selection, duration);
}

// Transition new and updated nodes to their new position
treeVisualization.update = (selection, duration) => {
  var transition = selection.transition()
    .duration(duration)
    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  transition.select("circle")
    .attr("r", function(d) { return d.value ? d.value : 5; })
    .style("fill", function(d) { return d._children ? "lightsteelblue" : d.level; });

  transition.select("text")
    .style("fill-opacity", 1);
}

export default treeVisualization;
