'use strict';
/* globals $, app, socket */

define('admin/plugins/stripe-subscription', ['settings'], function(Settings) {

	var ACP = {};

	ACP.init = function() {
		Settings.load('stripe-subscription', $('.stripe-subscriptions-settings'));

		$('#save').on('click', function() {
			Settings.save('stripe-subscription', $('.stripe-subscriptions-settings'));
		});
	};

	return ACP;
});
