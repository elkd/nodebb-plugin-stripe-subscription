"use strict";

var controllers = require('./lib/controllers'),
	stripe = require('./lib/stripe'),
	nconf = module.parent.require('nconf'),
	winston = module.parent.require('winston'),

	plugin = {};

plugin.init = function(params, callback) {
	var router = params.router,
		hostMiddleware = params.middleware,
		hostControllers = params.controllers;

	stripe.configure();

	router.get('/admin/plugins/stripe-subscription', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/stripe-subscription', controllers.renderAdminPage);

	router.get('/subscribe', hostMiddleware.buildHeader, stripe.subscribe);
	router.get('/api/subscribe', stripe.subscribe);

	router.post('/subscribe', stripe.onSubscribe);

	router.get('/stripe-subscription/success', stripe.onSuccess);

	router.post('/stripe-subscription/cancel-subscription', stripe.cancelSubscription);

	callback();
};

plugin.addAdminNavigation = function(header, callback) {
	header.plugins.push({
		route: '/plugins/stripe-subscription',
		icon: 'fa-stripe',
		name: 'Stripe Subscription'
	});

	callback(null, header);
};

plugin.addNavigation = function(items,callback){
    
    stripe.isSubscribed(items.uid, function(err, isSubscribed) {
        
            if(err)
            {
                winston.warn('[stripe] addNavigation Error: '+err);
                callback(err,items);
            }    
            else if (!isSubscribed) {
                items.push({
                    route    : "/subscribe",
                    title    : "Get Premium Access",
                    enabled  : true,
                    iconClass: "fa-usd",
                    textClass: "visible-xs-inline",
                    text     : "Upgrade"
                });
                callback(null,items);
            }
            
    });
    
    
};


plugin.addSubscriptionSettings = function(data, callback) {
	stripe.isSubscribed(data.uid, function(err, isSubscribed) {
		if (isSubscribed) {
			data.customSettings.push({
				title: 'Forum Subscription',
				content: '<button class="btn btn-danger" id="btn-cancel-subscription">Cancel Subscription</button><form id="cancel-subscription" method="POST" action="/stripe-subscription/cancel-subscription"></form>'
			});
		}
                else
                {
                    data.customSettings.push({
				title: 'Forum Subscription',
				content: '<a href="/subscribe" class="btn btn-success" id="btn-buy-subscription">Buy Subscription</a>'
			});
                }    

		callback(null, data);
	});
};

plugin.whitelistSubscriptionId = function (hookData, callback) {
    hookData.whitelist.push('stripe-subscription:sid');
    callback(null, hookData);
};

plugin.redirectToSubscribe = function(data, callback) {
	if (!data.req.uid || (!data.req.path.match('/topic') && !data.req.path.match('/category'))) {
		return callback(false, data);
	}

	var url = nconf.get('relative_path') + '/subscribe';
	if (data.res.locals.isAPI) {
		data.res.status(308).json(url);
	} else {
		data.res.redirect(url);
	}
};

module.exports = plugin;
