export default class NotificationMessage {

  static timerId;
  static notification;

  constructor(message = 'hi', { duration = 1000, type = 'success' } = {}) {

    if (NotificationMessage.notification) {
      NotificationMessage.notification.remove();
    }
    if (NotificationMessage.timerId) {
      clearTimeout(NotificationMessage.timerId);
    }

    this.message = message;
    this.duration = duration;
    this.durationInSec = (duration / 100) + 's';
    this.type = type;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    NotificationMessage.notification = this.element;
  }

  getTemplate() {
    return `
      <div class="notification ${ this.type }" style="--value:${ this.durationInSec }">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${ this.type }</div>
          <div class="notification-body">${ this.message }</div>
        </div>
      </div>
    `;
  }

  show(targetElem = document.body) {
    targetElem.append(this.element);
    this.runTimer(this.duration);
  }


  runTimer(duration) {
    NotificationMessage.timerId = setTimeout(() => this.remove(), duration);
  }

  remove() {

    if (NotificationMessage.notification) {
      NotificationMessage.notification.remove();
    }

    if (NotificationMessage.timerId) {
      clearTimeout(NotificationMessage.timerId);
    }
  }

  destroy() {
    this.remove();
    NotificationMessage.notification = null;
    clearTimeout(NotificationMessage.timerId);
  }
}
