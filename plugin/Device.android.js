// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

var Application = require("application");
var TypeUtils = require('utils/types');


var androidApp = Application.android;
var androidAppCtx = androidApp.context;
var activity;
var cbCheckout;
var language;
var loggers = [];
var payPal;
var rcCheckout;


function createNewPayment() {
    var newPayment = {};

    // amount
    var amount = 0;
    newPayment.getAmount = function() {
        return amount;
    };
    newPayment.setAmount = function(newAmount) {
        amount = newAmount;
        return this;
    };

    // BN code
    var bnCode;
    newPayment.getBnCode = function() {
        return bnCode;
    };
    newPayment.setBnCode = function(newBnCode) {
        bnCode = newBnCode;
        return this;
    };

    // currency
    var currency = 'USD';
    newPayment.getCurrency = function() {
        return currency;
    };
    newPayment.setCurrency = function(newCurrency) {
        currency = newCurrency;
        return this;
    };

    // custom
    var custom;
    newPayment.getCustom = function() {
        return custom;
    };
    newPayment.setCustom = function(newCustom) {
        custom = newCustom;
        return this;
    };

    // description
    var description = null;
    newPayment.getDescription = function() {
        return description;
    };
    newPayment.setDescription = function(newDescription) {
        description = newDescription;
        return this;
    };

    // details
    var details;
    newPayment.getDetails = function() {
        if (!details) {
            return null;
        }
        
        return {
            shipping: details.getShipping(),
            subtotal: details.getSubtotal(),
            tax: details.getTax()
        };
    };
    newPayment.setDetails = function(shipping, subtotal, tax) {
        details = new com.paypal.android.sdk.payments.PayPalPaymentDetails(shipping, subtotal, tax);
        return this;
    };

    // invoice number
    var invoiceNumber;
    newPayment.getInvoiceNumber = function() {
        return invoiceNumber;
    };
    newPayment.setInvoiceNumber = function(newInvoiceNumber) {
        invoiceNumber = newInvoiceNumber;
        return this;
    };

    // start()
    newPayment.start = function(cb) {
        try {
            cbCheckout = cb;
            
            var intentName = com.paypal.android.sdk.payments.PayPalPayment.PAYMENT_INTENT_SALE;

            var payment = new com.paypal.android.sdk.payments.PayPalPayment(new java.math.BigDecimal(amount),
                                                                            currency,
                                                                            description,
                                                                            intentName);
                                                                            
            if (details) {
                payment.paymentDetails(details);
            }
                                                                            
            if (custom) {
                payment.custom(custom);
            }
            
            if (invoiceNumber) {
                payment.invoiceNumber(invoiceNumber);
            }
            
            if (bnCode) {
                payment.bnCode(bnCode);
            }

            var intent = new android.content.Intent(activity,
                                                    com.paypal.android.sdk.payments.PaymentActivity.class);
            
            intent.putExtra(com.paypal.android.sdk.payments.PayPalService.EXTRA_PAYPAL_CONFIGURATION, paypal);
            intent.putExtra(com.paypal.android.sdk.payments.PaymentActivity.EXTRA_PAYMENT, payment);
            
            activity.startActivityForResult(intent, rcCheckout);

            return true;
        }
        catch (e) {
            return false;
        }
    };

    return newPayment;
};
exports.createNewPayment = createNewPayment;

function initPayPal(cfg) {
    activity = cfg.activity || androidApp.foregroundActivity || androidApp.startActivity;
    if (!activity) {
        return false;  // we need an Activity here
    }

    // custom envronment defined?
    var customEnv;
    switch (cfg.environment) {
        case 0:
            // SandBox
            customEnv = com.paypal.android.sdk.payments.PayPalConfiguration.ENVIRONMENT_SANDBOX;
            break;
            
        case 1:
            // production
            customEnv = com.paypal.android.sdk.payments.PayPalConfiguration.ENVIRONMENT_PRODUCTION;
            break;
            
        case 2:
            // no network
            customEnv = com.paypal.android.sdk.payments.PayPalConfiguration.ENVIRONMENT_NO_NETWORK;
            break;
    }

    var env;
    if (customEnv) {
        env = customEnv;
    }
    else {
        var clientId;
        if (cfg.clientId) {
            clientId = '' + cfg.clientId;
            
            env = com.paypal.android.sdk.payments.PayPalConfiguration.ENVIRONMENT_PRODUCTION;
        }
        else {
            env = com.paypal.android.sdk.payments.PayPalConfiguration.ENVIRONMENT_SANDBOX;
        }
    }

    language = 'en_US';
    if (cfg.lang) {
        language = ('' + cfg.lang).trim();
    }

    rcCheckout = 230958624;
    if (cfg.requestCode) {
        rcCheckout = parseInt(('' + cfg.requestCode).trim());
    }

    var acceptCreditCards = true;
    if (!TypeUtils.isNullOrUndefined(cfg.acceptCreditCards)) {
        acceptCreditCards = !!cfg.acceptCreditCards;
    }

    var rememberUser = true;
    if (!TypeUtils.isNullOrUndefined(cfg.rememberUser)) {
        rememberUser = !!cfg.rememberUser;
    }

    var pp = new com.paypal.android.sdk.payments.PayPalConfiguration();
    
    if (clientId) {
        pp.clientId(clientId);
    }
    
    pp.environment(env);

    if (language) {
        pp.languageOrLocale(language);
    }

    pp.rememberUser(rememberUser);
    pp.acceptCreditCards(acceptCreditCards);

    // (merchant) account settings
    if (!TypeUtils.isNullOrUndefined(cfg.account)) {
        // name
        if (!TypeUtils.isNullOrUndefined(cfg.account.name)) {
            pp.merchantName('' + cfg.account.name);
        }

        // privacy policy URL
        if (!TypeUtils.isNullOrUndefined(cfg.account.privacyPolicy)) {
            pp.merchantPrivacyPolicyUri(android.net.Uri.parse('' + cfg.account.privacyPolicy));
        }

        // user agreement URL
        if (!TypeUtils.isNullOrUndefined(cfg.account.userAgreement)) {
            pp.merchantUserAgreementUri(android.net.Uri.parse('' + cfg.account.userAgreement));
        }
    }

    // (user) defaults
    if (!TypeUtils.isNullOrUndefined(cfg.defaults)) {
        // email
        if (!TypeUtils.isNullOrUndefined(cfg.defaults.userEmail)) {
            pp.defaultUserEmail('' + cfg.defaults.userEmail);
        }

        // phone
        if (!TypeUtils.isNullOrUndefined(cfg.defaults.userPhone)) {
            pp.defaultUserPhone('' + cfg.defaults.userPhone);
        }

        // phone country code
        if (!TypeUtils.isNullOrUndefined(cfg.defaults.userPhoneCountryCode)) {
            pp.defaultUserPhoneCountryCode('' + cfg.defaults.userPhoneCountryCode);
        }
    }

    // overwrite 'onActivityResult'
    activity.onActivityResult = function(requestCode, resultCode, intent) {
        var resultCtx = {};
        var cb = cbCheckout;

        try {
            if (requestCode == rcCheckout) {
                if (resultCode == android.app.Activity.RESULT_OK) {
                    var confirm = intent.getParcelableExtra(com.paypal.android.sdk.payments.PaymentActivity.EXTRA_RESULT_CONFIRMATION);
                    if (confirm != null) {
                        try {
                            var json = confirm.toJSONObject();
                            if (json != null) {
                                // OK
                                resultCtx.code = 0;
                                
                                if (json.has('response')) {
                                    var payResp = json.getJSONObject('response');
                                    if (payResp) {
                                        if (payResp.has('id')) {
                                            resultCtx.key = payResp.getString('id');  // get payment ID / key
                                        }
                                    }
                                }
                            }
                            else {
                                // no JSON
                                resultCtx.code = 3;
                            }
                        }
                        catch (e) {
                            // JSON parse error
                            resultCtx.code = -3;
                            resultCtx.message = e;
                        }
                    }
                    else {
                        // no confirm data
                        resultCtx.code = 2;
                    }
                }
                else if (resultCode == android.app.Activity.RESULT_CANCELED) {
                    resultCtx.code = 1;  // cancelled
                }
                else if (resultCode == com.paypal.android.sdk.payments.PaymentActivity.RESULT_EXTRAS_INVALID) {
                    resultCtx.code = -1;  // invalid result data
                }
            }
            else {
                if (cfg.onActivityResult) {
                    // use "fallback" activity
                    cfg.onActivityResult(requestCode, resultCode, intent);
                }
                
                cb = null;
            }
        }
        catch (e) {
            // fatal error
            resultCtx.code = -2;
            resultCtx.message = e;
        }
        finally {
            if (cb) {
                cb(resultCtx);  // invoke callback
            }
        }
    };

    var serviceIntent = new android.content.Intent(activity,
                                                   com.paypal.android.sdk.payments.PayPalService.class);
    serviceIntent.putExtra(com.paypal.android.sdk.payments.PayPalService.EXTRA_PAYPAL_CONFIGURATION,
                           pp);
    
    activity.startService(serviceIntent);

    paypal = pp;
};
exports.initPayPal = initPayPal;
