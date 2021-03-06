import React, {Component} from 'react';
import ChatBar from './ChatBar.jsx';
import MessageList from './MessageList.jsx';
import Navbar from './Navbar.jsx';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentUser: {name: 'Anonymous'}, // optional. if currentUser is not defined, it means the user is Anonymous
      messages: [],
      users: 0
    },
    this.onNewPost = this.onNewPost.bind(this);
    this.handleNewUser = this.handleNewUser.bind(this);
  }

  componentDidMount() {
    this.socket = new WebSocket('ws://localhost:3001');

    // Checks the incoming message for an html image link.
    function imageCheck(message) {
      const splitMessage = message.content.split(' ');

      for(const eachWord in splitMessage) {
        if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(splitMessage[eachWord])) {
          message.image = splitMessage[eachWord];
          splitMessage.splice(eachWord, 1);
        }
      }
      message.content = splitMessage.join(' ');
      return message;
    }

    this.socket.onmessage = (message) => {
      const serverMessage = JSON.parse(message.data);

      switch(serverMessage.type) {
        case 'connected':
          break;
        case 'users':
          this.setState({users: serverMessage.connected});
          break;
        case 'incomingMessage':
          const receivedMessage = JSON.parse(message.data);
          const updateMessage = imageCheck(receivedMessage);
          this.setState({messages: this.state.messages.concat(updateMessage)});
          break;
        case 'incomingNotification':
          const receivedNotification = JSON.parse(message.data);
          this.setState({messages: this.state.messages.concat(receivedNotification)});
          break;
        default:
          // show an error in the console if the message type is unknown
          throw new Error('Unknown event type ' + message.data);
      }
    };
  }

  onNewPost(messageContent) {
    const user = this.state.currentUser.name;
    const newMessage = {
      id: '',
      type: 'postMessage',
      username: user,
      content: messageContent,
      image: '',
      colour: ''
    };
    const stringifiedNewMessage = JSON.stringify(newMessage);

    this.socket.send(stringifiedNewMessage);
  }

  handleNewUser(username) {
    const messageUser = this.state.currentUser.name;

    if(username !== messageUser) {
      this.setState({ currentUser: {name: username} });

      const NewNotification = {
        type: 'postNotification',
        userChange: `${messageUser} has changed their name to ${username}`
      }
      const stringifiedNewNotification = JSON.stringify(NewNotification);
      this.socket.send(stringifiedNewNotification);
    }
  }

  render() {
    return (
      <div>
        <Navbar userCounter={ this.state.users } />
        <ChatBar onNewPost={ this.onNewPost } handleNewUser={ this.handleNewUser }/>
        <MessageList messages={ this.state.messages } />
      </div>
    );
  }
}
export default App;
