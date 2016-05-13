// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


var app = require("application");
var androidApp = app.android;
var androidAppCtx = androidApp.context;

var activity;
var cbCheckout;
var language;
var loggers = [];
var payPal;
var rcCheckout;

// addLogger
function addLogger(l) {
    loggers.push(l);
};
exports.addLogger = addLogger;

// logMsg()
function logMsg(msg) {
    for (var i = 0; i < loggers.length; i++) {
        try {
            var l = loggers[i];
            if (l) {
                l(msg);
            }
        }
        catch (e) {
            // ignore
        }
    }
};

// init()
function init(cfg) {
    activity = androidApp.foregroundActivity || androidApp.startActivity;
    if (!activity) {
        return;
    }
    
    if (!cfg) {
        cfg = {};
    }
    
    var customEnv;
    switch (cfg.environment) {
        case 0:
            customEnv = com.paypal.android.sdk.payments.PayPalConfiguration.ENVIRONMENT_SANDBOX;
            break;
            
        case 1:
            customEnv = com.paypal.android.sdk.payments.PayPalConfiguration.ENVIRONMENT_PRODUCTION;
            break;
            
        case 2:
            customEnv = com.paypal.android.sdk.payments.PayPalConfiguration.ENVIRONMENT_NO_NETWORK;
            break;
    }
    
    var env;
    var clientId;
    if (cfg.clientId) {
        clientId = cfg.clientId;
        
        env = com.paypal.android.sdk.payments.PayPalConfiguration.ENVIRONMENT_PRODUCTION;
    }
    else {
        clientId = 'APP-80W284485P519543T';
        
        env = com.paypal.android.sdk.payments.PayPalConfiguration.ENVIRONMENT_SANDBOX;
    }
    
    if (customEnv) {
        env = customEnv;
    }

    language = 'en_US';
    if (cfg.lang) {
        language = cfg.lang;
    }

    rcCheckout = 230958624;
    if (cfg.requestCode) {
        rcCheckout = cfg.requestCode;
    }

    logMsg('init >> requestCode: ' + rcCheckout);
    
    var pp = new com.paypal.android.sdk.payments.PayPalConfiguration();
    
    pp.clientId(clientId);
    
    logMsg('init >> env: ' + env);
    pp.environment(env);

    logMsg('init >> language: ' + language);    
    pp.languageOrLocale(language);

    if (cfg.account) {
        if (cfg.account.name) {
            logMsg('init >> account >> name: ' + cfg.account.name);
            pp.merchantName(cfg.account.name);
        }
    }

    activity.onActivityResult = function(requestCode, resultCode, intent) {
        var resultCtx = {};
        var cb = cbCheckout;

        try {
            logMsg('onActivityResult >> requestCode: ' + requestCode);

            if (requestCode == rcCheckout) {
                logMsg('onActivityResult >> resultCode: ' + resultCode);
                
                if (resultCode == android.app.Activity.RESULT_OK) {
                    var confirm = intent.getParcelableExtra(com.paypal.android.sdk.payments.PaymentActivity.EXTRA_RESULT_CONFIRMATION);
                    if (confirm != null) {
                        try {
                            var json = confirm.toJSONObject();
                            if (json != null) {
                                logMsg('onActivityResult >> json: ' + json.toString(4));
                                
                                resultCtx.code = 0;
                                
                                if (json.has('response')) {
                                    var payResp = json.getJSONObject('response');
                                    if (payResp) {
                                        if (payResp.has('id')) {
                                            resultCtx.key = payResp.getString('id');
                                        }
                                    }
                                }
                            }
                            else {
                                // no JSON
                                logMsg('onActivityResult >> no JSON');
                                
                                resultCtx.code = 3;
                            }
                        }
                        catch (e) {
                            // JSON parse error
                            logMsg('onActivityResult >> JSON parse error');
                            
                            resultCtx.code = -3;
                            resultCtx.message = e;
                        }
                    }
                    else {
                        // no confirm data
                        logMsg('onActivityResult >> no confirm data');
                        
                        resultCtx.code = 2;
                    }

                    var cb = cbCheckout;
                    if (!cb) {
                        logMsg('onActivityResult >> no callback defined!');
                    }
                }
                else if (resultCode == android.app.Activity.RESULT_CANCELED) {
                    logMsg('onActivityResult >> canceled');
                    
                    resultCtx.code = 1;
                }
                else if (resultCode == com.paypal.android.sdk.payments.PaymentActivity.RESULT_EXTRAS_INVALID) {
                    logMsg('onActivityResult >> failure');
                    
                    resultCtx.code = -1;
                }
            }
            else {
                if (cfg.onActivityResult) {
                    cfg.onActivityResult(requestCode, resultCode, intent);
                }
                
                cb = null;
            }
        }
        catch (e) {
            resultCtx.code = -2;
            resultCtx.message = e;
            
            logMsg('onActivityResult >> Unhandled exception: ' + e);
        }
        
        if (cb) {
            cb(resultCtx);
        }
    };
    
    logMsg('init >> Starting PayPal service...');
    
    var serviceIntent = new android.content.Intent(activity,
                                                   com.paypal.android.sdk.payments.PayPalService.class);
    serviceIntent.putExtra(com.paypal.android.sdk.payments.PayPalService.EXTRA_PAYPAL_CONFIGURATION,
                           pp);
    
    activity.startService(serviceIntent);
    
    logMsg('init >> service started');
    
    paypal = pp;
    
    logMsg('init >> initialized');
}
exports.init = init;

// newPayment()
function newPayment() {
    var newPayment = {};
    
    // currency
    var currency = 'USD';
    newPayment.getCurrency = function() {
        return currency;
    };
    newPayment.setCurrency = function(newCurrency) {
        currency = newCurrency;
    };
    
    // amount
    var amount = 0;
    newPayment.getAmount = function() {
        return amount;
    };
    newPayment.setAmount = function(newAmount) {
        amount = newAmount;
    };
    
    // description
    var description = null;
    newPayment.getDescription = function() {
        return description;
    };
    newPayment.setDescription = function(newDescription) {
        description = newDescription;
    };
    
    // custom
    var custom;
    newPayment.getCustom = function() {
        return custom;
    };
    newPayment.setCustom = function(newCustom) {
        custom = newCustom;
    };
    
    // invoice number
    var invoiceNumber;
    newPayment.getInvoiceNumber = function() {
        return invoiceNumber;
    };
    newPayment.setInvoiceNumber = function(newInvoiceNumber) {
        invoiceNumber = newInvoiceNumber;
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
    };
    
    // BN code
    var bnCode;
    newPayment.getBnCode = function() {
        return bnCode;
    };
    newPayment.setBnCode = function(newBnCode) {
        bnCode = newBnCode;
    };
    
    // start()
    newPayment.start = function(cb) {
        try {
            cbCheckout = cb;
            
            var intentName = com.paypal.android.sdk.payments.PayPalPayment.PAYMENT_INTENT_SALE;
            
            logMsg('newPayment >> start >> amount: ' + amount);
            logMsg('newPayment >> start >> currency: ' + currency);
            logMsg('newPayment >> start >> description: ' + description);
            logMsg('newPayment >> start >> intentName: ' + intentName);
            
            var payment = new com.paypal.android.sdk.payments.PayPalPayment(new java.math.BigDecimal(amount),
                                                                            currency,
                                                                            description,
                                                                            intentName);
                                                                            
            if (details) {
                logMsg('newPayment >> start >> details >> shipping: ' + details.getShipping());
                logMsg('newPayment >> start >> details >> subtotal: ' + details.getSubtotal());
                logMsg('newPayment >> start >> details >> tax: ' + details.getTax());
                
                payment.paymentDetails(details);
            }
                                                                            
            if (custom) {
                logMsg('newPayment >> start >> custom: ' + custom);
                
                payment.custom(custom);
            }
            
            if (invoiceNumber) {
                logMsg('newPayment >> start >> invoicenumber: ' + invoiceNumber);
                
                payment.invoiceNumber(invoiceNumber);
            }
            
            if (bnCode) {
                logMsg('newPayment >> start >> bncode: ' + bnCode);
                
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
            logMsg('newPayment >> ERROR: ' + e);
            
            return false;
        }
    };
    
    return newPayment;
}
exports.newPayment = newPayment;
