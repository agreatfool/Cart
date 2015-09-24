import CartBase from './base/cart-base.js';

class CartMessageService extends CartBase {
  constructor(...args) {
    super(...args);
    this.logInit('CartMessageService');

    if (this.conf.platform === 'desktop') {
      this.$mdToast = this.$injector.get('$mdToast');
    } else {
      this.$ionicLoading = this.$injector.get('$ionicLoading');
    }
  }

  static factory(...args) {
    return new CartMessageService(...args);
  }

  verbose(...args) {
    this.outputConsole('verbose', ...args);
  }

  debug(...args) {
    this.outputConsole('debug', ...args);
  }

  info(...args) {
    this.outputToast('info', ...args);
    this.outputConsole('info', ...args);
  }

  notice(...args) {
    this.outputToast('notice', ...args);
    this.outputConsole('notice', ...args);
  }

  warning(...args) {
    this.outputToast('warning', ...args);
    this.outputConsole('warning', ...args);
  }

  error(...args) {
    this.outputToast('error', ...args);
    this.outputConsole('error', ...args);
  }

  outputToast(level, ...args) {
    let message = [...args];
    let hideDelay = 3000;
    let locals = {
      message: (arguments.length > 2) ? message : message.shift(),
      confirm: false, // whether need confirm button
      color: 'inherit' // font color, default 'inherit'
    };
    switch (level) {
      case 'notice':
        locals['color'] = 'yellow';
        break;
      case 'warning':
        locals['confirm'] = true;
        locals['color'] = 'orange';
        hideDelay = false;
        break;
      case 'error':
        locals['confirm'] = true;
        locals['color'] = 'red';
        hideDelay = false;
        break;
    }
    let options = {
      controller: 'CartModalToastCtrl as ctrl',
      templateUrl: 'toast.html',
      position: 'bottom left',
      hideDelay: hideDelay,
      locals: locals,
      bindToController: true
    };

    if (this.conf.platform === 'desktop') {
      this.$mdToast.show(options);
    } else {
      this.$ionicLoading.show({
        template: JSON.stringify(locals.message),
        noBackdrop: true,
        duration: 3000
      });
    }
  }

  outputConsole(...args) {
    if (!console) {
      return;
    }
    console.log(...args);
  }
}

CartMessageService.factory.$inject = [...CartBase.$inject];

export default CartMessageService;
