import React, {Component} from 'react';

export default class Lesson extends Component {

  render() {
    return (
      <div id='Lesson'>
      	<p>For testing only: Slide #{this.props.slideNumber}</p>
      	{this.props.lessonText}
      </div>
    )
  }
}

// Should I show the lesson name somewhere?