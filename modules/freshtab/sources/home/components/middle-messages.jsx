import React from 'react';
import PropTypes from 'prop-types';
import cliqz from '../cliqz';
import { messageShowSignal, messageClickSignal, messageCloseSignal } from '../services/telemetry/middle-messages';

export default class MiddleMessages extends React.Component {
  componentDidMount() {
    messageShowSignal();
  }

  handleCTAClick(message) {
    messageClickSignal();
    cliqz.freshtab.countMessageClick(message);
    this.props.handleLinkClick(message);
  }

  handleCloseClick(message) {
    messageCloseSignal();
    const messageId = message.id;
    const handler = message.handler;
    cliqz.freshtab.dismissMessage(messageId, handler);
    cliqz.storage.setState((prevState) => {
      const prev = prevState;
      const messages = {
        ...prev.messages,
      };
      delete messages[messageId];
      return {
        messages,
      };
    });
  }

  render() {
    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <div>
        {
          this.props.messages.map(message =>
            <div
              key={message.id}
              className={`middle-notification-box ${message.type}`}
            >
              <div
                className="close"
                onClick={() => this.handleCloseClick(message)}
              />
              <div
                className="icon"
                style={{
                  backgroundImage: `url(${message.icon})`,
                  backgroundSize: message.icon_dimensions ? message.icon_dimensions.width : null,
                  width: message.icon_dimensions ? message.icon_dimensions.width : null,
                  height: message.icon_dimensions ? message.icon_dimensions.height : null
                }}
              />
              <div
                className="content"
                style={{ width: `calc(100% - ${message.icon_dimensions ? message.icon_dimensions.width : null}px)` }}
              >
                <h1>{message.title}</h1>
                <p>{message.description}</p>
                <button
                  className="cta-btn"
                  onClick={() => this.handleCTAClick(message)}
                >
                  {message.cta_text}
                </button>

                {message.buttons && message.buttons.length > 0 &&
                  <div className="buttons">
                    {message.buttons.map(button =>
                      <a
                        key={button.id}
                        href={button.link[this.props.locale]}
                        target="_blank"
                      >
                        <img
                          alt={button.id}
                          className={button.class}
                          src={`./images/${button.src}`}
                        />
                      </a>
                    )}
                  </div>
                }
              </div>
            </div>
          )
        }
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

MiddleMessages.propTypes = {
  messages: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    map: PropTypes.func
  }),
  handleLinkClick: PropTypes.func
};
