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
var defaultCurrency;
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
    
    var env;
    var appId;
    if (cfg.appId) {
        appId = cfg.appId;
    }
    else {
        appId = 'APP-80W284485P519543T';
        env = com.paypal.android.MEP.PayPal.ENV_SANDBOX;
    }

    if (!env) {
        env = com.paypal.android.MEP.PayPal.ENV_LIVE;
        
        if (cfg.environment) {
            env = cfg.environment;
        }
    }
    
    defaultCurrency = 'USD';
    if (cfg.defaultCurrency) {
        defaultCurrency = cfg.defaultCurrency;
    }
    
    language = 'en_US';
    if (cfg.lang) {
        language = cfg.lang;
    }
    
    var isShippingEnabled;
    if (cfg.enabledShipping) {
        isShippingEnabled = cfg.enabledShipping;
    }
    
    var feesPayer = 0;
    if (cfg.feesPayer) {
        feesPayer = cfg.feesPayer;
    }
    
    rcCheckout = 230958624;
    if (cfg.requestCode) {
        rcCheckout = cfg.requestCode;
    }

    var pp = com.paypal.android.MEP.PayPal.initWithAppID(androidAppCtx, appId, env);
    pp.setShippingEnabled(isShippingEnabled ? true : false);                                               
    pp.setLanguage(language);
    pp.setFeesPayer(feesPayer);
    
    if (cfg.account) {
        if (cfg.account.phone) {
            pp.setAccountPhone(cfg.account.phone);
        }
        
        if (cfg.account.email) {
            pp.setAccountEmail(cfg.account.email);
        }
        
        if (cfg.account.name) {
            pp.setAccountName(cfg.account.name);
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
                    var payKey = intent.getStringExtra(com.paypal.android.MEP.PayPalActivity.EXTRA_PAY_KEY);
                    
                    resultCtx.code = 0;
                    resultCtx.key = payKey;
                    
                    var cb = cbCheckout;
                    if (!cb) {
                        logMsg('onActivityResult >> no callback defined!');
                    }
                }
                else if (resultCode == android.app.Activity.RESULT_CANCELED) {
                    resultCtx.code = 1;
                }
                else if (resultCode == com.paypal.android.MEP.PayPalActivity.RESULT_FAILURE) {
                    resultCtx.code = -1;
                    resultCtx.id = intent.getStringExtra(com.paypal.android.MEP.PayPalActivity.EXTRA_ERROR_ID);
                    resultCtx.message = intent.getStringExtra(com.paypal.android.MEP.PayPalActivity.EXTRA_ERROR_MESSAGE);
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
            logMsg('onActivityResult >> ERROR: ' + e);
        }
        
        if (cb) {
            cb(resultCtx);
        }
    };
    
    paypal = pp;
}
exports.init = init;

// newPayment()
function newPayment() {
    var newPayment = {};
    
    // type
    var type = 0;
    newPayment.getType = function() {
        return type;    
    };
    newPayment.setType = function(newType) {
        type = newType;
    };
    
    // subtotal
    var subTotal;
    newPayment.getSubtotal = function() {
        return subTotal;    
    };
    newPayment.setSubtotal = function(newSubTotal) {
        subTotal = newSubTotal;
    };
    
    // currency
    var currency = defaultCurrency;
    newPayment.getCurrency = function() {
        return currency;    
    };
    newPayment.setCurrency = function(newCurrency) {
        currency = newCurrency;
    };
    
    // recipient
    var recipient;
    newPayment.getRecipient = function() {
        return recipient;    
    };
    newPayment.setRecipient = function(newRecipient) {
        recipient = newRecipient;
    };
    
    // start()
    newPayment.start = function(cb) {
        try {
            cbCheckout = cb;
            
            logMsg('newPayment >> Starting payment...');
            
            var ppPayment = new com.paypal.android.MEP.PayPalPayment();
        
            logMsg('newPayment >> type: ' +  type);
            ppPayment.setPaymentType(type);
            
            logMsg('newPayment >> subtotal: ' +  subTotal);
            ppPayment.setSubtotal(new java.math.BigDecimal(subTotal));
            
            logMsg('newPayment >> currency: ' +  currency);
            ppPayment.setCurrencyType(currency);
            
            logMsg('newPayment >> recipient: ' +  recipient);
            ppPayment.setRecipient(recipient);
        
            logMsg('newPayment >> Starting checkout...');
            var ppPaymentIntent = paypal.checkout(ppPayment, androidAppCtx);
            activity.startActivityForResult(ppPaymentIntent, rcCheckout);
        
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
