import debug from 'debug/browser';
import BaseView from '../base';
import { template, on, ui } from '../../utils/decorators';
import OPERATING_VIEW_TEMPLATE from './operating.jade';
import { KituramiCommands } from 'kiturami';

import './operating.sass';

const
  log = debug('kitulkitul:View:OperatingView');


@template(OPERATING_VIEW_TEMPLATE, 'state')
@ui('indicator', '.temp-indicator')
@ui('indicatorValue', '.temp-value')
@ui('indicatorText', '.temp-text')
class OperatingView extends BaseView {
  constructor(...args) {
    super(...args);

    this.state = {
      name: 'UNKNOWN',
      props: {
        currentTemp: 10,
        targetTemp: 10
      }
    };

    this.dragging = false;
  }

  initialize(options) {
    super.initialize(options);

    this.api = options.api;
    this.receiver = options.receiver;

    this.receiver.on('message', this.onStateChange.bind(this));
    this.api.sendCommand(KituramiCommands.RequestState.forge());
  }

  static getOffset(e) {
    return e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
  }

  static calcMovement(base, target) {
    return base - target;
  }

  @on('mousedown .operating-body')
  @on('touchstart .operating-body')
  onDragStart(e) {
    const $el = this.$(e.target);

    if ($el.hasClass('btn-change-mode')) {
      return true;
    }

    this.dragging = true;
    this._baseOffset = OperatingView.getOffset(e);

    this.ui.indicator.addClass('active');
    this.setIndicatorTemp(this.state.props.targetTemp);
  }

  @on('mousemove')
  @on('touchmove')
  onDrag(e) {
    if (!this.dragging) {
      return true;
    }

    e.preventDefault();
    e.stopPropagation();

    const
      thresholdRatio = 0.2,
      delta = Math.floor(OperatingView.calcMovement(this._baseOffset, OperatingView.getOffset(e)) * thresholdRatio),
      targetTemp = this._targetTemp = this.state.props.targetTemp + delta;


    this.setIndicatorTemp(targetTemp);

    return false;
  }

  @on('mouseup')
  @on('touchend')
  onDragEnd() {
    if (!this.dragging) {
      return true;
    }

    const targetTemp = this._targetTemp;

    this.dragging = false;
    this.ui.indicator.removeClass('active');
    this._baseOffset = this._targetTemp = null;

    if (targetTemp) {
      this.api.sendCommand(KituramiCommands.OperatingState.forge().indoorTempBasedHeating())
        .then(() => this.api.sendCommand(KituramiCommands.IndoorTempBasedHeating.forge().setTargetTemp(targetTemp)))
        .then(() => this.api.sendCommand(KituramiCommands.RequestState.forge()))
        .catch((e) => {
          log('failed to send command!', e);
        });
    }
  }


  @on('click .btn-away')
  onToggleAway(e) {
    e.preventDefault();
    e.stopPropagation();

    this.api.sendCommand(KituramiCommands.OperatingState.forge().away())
      .then(() => this.api.sendCommand(KituramiCommands.RequestState.forge()))
      .catch((e) => {
        log('failed to send command!', e);
      });

    return false;
  }

  @on('click .btn-heating')
  onToggleHeating(e) {
    e.preventDefault();
    e.stopPropagation();

    this.api.sendCommand(KituramiCommands.OperatingState.forge().indoorTempBasedHeating())
      .then(() => this.api.sendCommand(KituramiCommands.RequestState.forge()))
      .catch((e) => {
        console.error(e);
      });

    return false;
  }


  setIndicatorTemp(temp) {
    let targetTemp = temp;

    if (targetTemp > 45) {
      targetTemp = 45;
    }

    if (targetTemp < 10) {
      targetTemp = 10;
    }

    const height = `${(targetTemp - 10)/ 35 * 100}%`;

    this.ui.indicatorValue.css('height', height);
    this.ui.indicatorText.text(targetTemp);
  }

  onStateChange(state) {
    log('state changed: ', state);

    Object.assign(this.state, state);
    this.render();
  }


  render() {
    this.$el
      .addClass('operating component')
      .html(this.template(this.state));

    if (this.state.props.targetTemp > this.state.props.currentTemp) {
      this.$el.addClass('heating');
    } else {
      this.$el.removeClass('heating');
    }

    return super.render();
  }
}


export default OperatingView;
