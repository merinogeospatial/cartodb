const Backbone = require('backbone');
const CoreView = require('backbone/core-view');
const loadingTemplate = require('builder/components/loading/loading.tpl');
const createGroupTemplate = require('./create-group.tpl');
const randomQuote = require('builder/components/loading/random-quote');
const checkAndBuildOpts = require('builder/helpers/required-opts');

const REQUIRED_OPTS = [
  'group',
  'onCreated',
  'flashMessageModel'
];

/**
 * View to create a new group for an organization.
 */
module.exports = CoreView.extend({

  tagName: 'form',

  events: {
    'click .js-create': '_onClickCreate',
    'submit form': '_onClickCreate',
    'keyup .js-name': '_onChangeName'
  },

  initialize: function (options) {
    checkAndBuildOpts(options, REQUIRED_OPTS, this);

    this.model = new Backbone.Model();
    this._initBinds();
  },

  render: function () {
    if (this.model.get('isLoading')) {
      this.$el.html(
        loadingTemplate({
          title: 'Creating group',
          descHTML: randomQuote()
        })
      );
    } else {
      this.$el.html(createGroupTemplate());
    }
    return this;
  },

  _initBinds: function () {
    this.listenTo(this.model, 'change:isLoading', this.render);
  },

  _onClickCreate: function (ev) {
    this.killEvent(ev);

    const name = this._name();

    if (name) {
      this.model.set('isLoading', true);

      this._group.save(
        { display_name: name },
        {
          wait: true,
          success: this._onCreated,
          error: this._showErrors.bind(this)
        }
      );
    }
  },

  _showErrors: function (message, response, request) {
    this.model.set('isLoading', false);

    const jsonData = response && response.responseJSON;
    let flashMessage = 'Could not create group for some unknown reason, please try again';

    if (jsonData.errors) {
      flashMessage = jsonData.errors.join('. ');
    }

    this._flashMessageModel.show(flashMessage);
  },

  _onChangeName: function () {
    this._flashMessageModel.hide();
    this.$('.js-create').toggleClass('is-disabled', this._name().length === 0);
  },

  _name: function () {
    return this.$('.js-name').val();
  }

});