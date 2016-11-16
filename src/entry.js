/**
 * Module dependencies.
 */

import { KituramiHttpsAPI, KituramiReceiver } from 'kiturami';

import 'normalize.css';
import 'font-awesome/css/font-awesome.css';

import $ from 'jquery';
import debug from 'debug/browser';
import OperatingView from './views/operating/operating';

import './entry.sass';

debug.disable('sockjs-client:*');
debug.enable('random-gift:*');

$(() => {
  const app = new OperatingView({
    el: '#app',
    api: new KituramiHttpsAPI(process.env.KITURAMI_API_KEY, process.env.KITURAMI_NODE_ID),
    receiver: new KituramiReceiver(process.env.KITURAMI_NODE_ID)
  });

  app.render();
});
