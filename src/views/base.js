import { View } from 'backbone';

class BaseView extends View {
  render() {
    super.render();
    this.applyUiDecorator();
    return this;
  }

  applyUiDecorator() {
    this.ui = {};

    Object.keys(this._ui).forEach((k) => {
      this.ui[k] = this.$el.find(this._ui[k]);
    });
  }
}

export default BaseView;
