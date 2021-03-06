import React, {Component} from 'react';
import Message from './Message.jsx';

class MessageList extends Component {
  render() {
    const message = this.props.messages.map((post) => {
      return <Message
        key={ post.id }
        user={ post.username }
        content={ post.content }
        type={ post.type }
        userChange={ post.userChange }
        colour={ post.colour }
        image={ post.image } />
    });

    return (
      <section>
        { message }
      </section>
    )
  }
}
export default MessageList;