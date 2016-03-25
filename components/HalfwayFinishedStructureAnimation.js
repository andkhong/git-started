import React, {Component} from 'react';
import treeData from './../AnimationData/treeStructure';

// Tree and Link are two new components used by HalfwayFinishedStructureAnimation.
import Tree from './Tree';
import Link from './Link';

var d3 = require('d3');
var ReactDOM = require('react-dom');

// My goal in creating HalfwayFinishedStructureAnimation was to make React responsible for DOM structure (adding and removing elements) and to make D3 responsible for styling, as described in this blog post:
// https://medium.com/@sxywu/on-d3-react-and-a-little-bit-of-flux-88a226f328f3#.ztcxqykek

// We still need to handle window resizes. Here are some useful resources:
// http://eyeseast.github.io/visible-data/2013/08/28/responsive-charts-with-d3/
// http://bl.ocks.org/mbostock/3019563

export default class HalfwayFinishedStructureAnimation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      treeData: props.initialTreeData,
      margin: props.initialMargin,
      treeHeight: props.initialTreeHeight,
      treeWidth: props.initialTreeWidth
    }
  }

  // This function is called after all the Tree and Link componentDidMount functions have been called.
  componentDidMount() {
    ipcRenderer.on('direc-schema', (e,arg)=>{
      this.updateTreeData(arg);
    })

    // Reset the tree height and width if needed?
    // Would it be better to use a ref rather than an id?
  }

  updateTreeData(newSchema) {
    this.setState({
      treeData: newSchema
    });
  }

  render() {
    var duration = 450; // We may want to make this a prop.

    // Create a tree layout.
    var tree = d3.layout.tree()
    // Give it arbitrary size coordinates.
    // (If we don't specify a size for the tree, it collapses.)
      .size([this.state.treeHeight, this.state.treeWidth]);

    // Create a diagonal generator, a type of path data generator.
    var diagonal = d3.svg.diagonal()
    // Isaac: I don't completely understand the projection yet.
      .projection(function(d) { return [d.y, d.x]; });

    // We know that the first node in the array is the root of the tree. Let's designate its initial coordinates - where it should enter.
    var root = this.state.treeData[0];
    root.x0 = this.state.treeHeight / 2;
    root.y0 = 0;

    // The next line creates and returns an array of nodes associated with the specified root node. (The returned array is basically a flattened version of treeData.)
    // Each node has several properties.
    // D3 tree nodes always have parent, child, depth, x, and y properties.
    // It looks like x values range from 0 to 200 and y values range from 0 to 550.
    // For our use case, we've added level, name, and value properties. I'm not sure what level and value are or how we're using them.
    // We will pass one node from this array to each Tree as props.data.
    // ***Do we want to end the next line with reverse to put the root node at the end?
    var nodes = tree.nodes(root),
      // This line creates and returns an array of objects representing all parent-child links in the nodes array we just created.
      linkSelection = tree.links(nodes);

    nodes.forEach(function(d) {
      // Update the node's y-coordinate based on its depth.
      d.y = d.depth * 180;
      // If the node has a parent, set the node's initial coordinates to the parent's initial coordinates.
      // *** Does this make sense?
      if (d.parent) {
        d.x0 = d.parent.x0;
        d.y0 = d.parent.y0;
      }
    });

    // I think it makes sense to the use target.name as an id, because no two links should ever point to the same target.
    // If needed, though, we could use {link.source.name + '/'  link.target.name} instead.
    var links = linkSelection && linkSelection.map((link) => {
      return (<Link key={link.target.name} data={link} diagonal={diagonal} duration={duration} />)
    });

    var trees = nodes && nodes.map((node) => {
      return (<Tree key={node.name} data={node} duration={duration} />);
    });

    console.log('Rendering. Latest update: comparing nodes with treeData');

    var translationValue = `translate(${this.state.margin.left}, ${this.state.margin.top})`;

    // Do I need to set SVG height below? Is that even possible? Or will the SVG resize to fit the inner g's inside it? (It doesn't look like it's expanding to fit the tree layout.)
    // This StackOverflow response may help:
    // http://stackoverflow.com/questions/8919076/how-to-make-a-svg-element-expand-or-contract-to-its-parent-container
    return(
      <div id='Structure-Animation'>
        <svg width='100%' height='100%' viewBox='0 0 660 200' preserveAspectRatio='none'>
          <g transform={translationValue}>
            {links}
            {trees}
          </g>
        </svg>
      </div>
    )
  }
}

HalfwayFinishedStructureAnimation.defaultProps = {
  initialTreeData: treeData, // To start with an empty tree: [{}]
  initialMargin: {top: 0, right: 20, bottom: 0, left: 90},
  initialTreeHeight: 200,
  initialTreeWidth: 550
}
