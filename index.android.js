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
        
        env = com.paypal.android.MEP.PayPal.ENV_LIVE;
        if (cfg.environment) {
            env = cfg.environment;
        }
    }
    else {
        appId = 'APP-80W284485P519543T';
        
        env = com.paypal.android.MEP.PayPal.ENV_SANDBOX;
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

    logMsg('init >> env: ' + env);
    logMsg('init >> requestCode: ' + rcCheckout);
    
    var pp = com.paypal.android.MEP.PayPal.initWithAppID(androidAppCtx, appId, env);
    
    logMsg('init >> isShippingEnabled: ' + isShippingEnabled);
    pp.setShippingEnabled(isShippingEnabled ? true : false);

    logMsg('init >> language: ' + language);    
    pp.setLanguage(language);
    
    logMsg('init >> feesPayer: ' + feesPayer);    
    pp.setFeesPayer(feesPayer);
    
    if (cfg.account) {
        if (cfg.account.phone) {
            logMsg('init >> account >> phone: ' + cfg.account.phone);
            pp.setAccountPhone(cfg.account.phone);
        }
        
        if (cfg.account.countryDialingCode) {
            logMsg('init >> account >> countryDialingCode: ' + cfg.account.countryDialingCode);
            pp.setAccountCountryDialingCode(cfg.account.countryDialingCode);
        }
        
        if (cfg.account.email) {
            logMsg('init >> account >> email: ' + cfg.account.email);
            pp.setAccountEmail(cfg.account.email);
        }
        
        if (cfg.account.name) {
            logMsg('init >> account >> name: ' + cfg.account.name);
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
            resultCtx.code = -2;
            resultCtx.message = e;
            
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
    
    // sub type
    var subType;
    newPayment.getSubtype = function() {
        return subType;    
    };
    newPayment.setSubtype = function(newSubType) {
        subType = newSubType;
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
    
    // custom ID
    var customId;
    newPayment.getCustomId = function() {
        return customId;
    };
    newPayment.setCustomId = function(newCustomId) {
        customId = newCustomId;
    };
    
    // memo
    var memo;
    newPayment.getMemo = function() {
        return memo;
    };
    newPayment.setMemo = function(newMemo) {
        memo = newMemo;
    };
    
    // tax
    var tax;
    newPayment.getTax = function() {
        return tax;
    };
    newPayment.setTax = function(newTax) {
        tax = newTax;
    };
    
    // shipping
    var shipping;
    newPayment.getShipping = function() {
        return shipping;
    };
    newPayment.setShipping = function(newShipping) {
        shipping = newShipping;    
    };
    
    // merchant name
    var merchantName;
    newPayment.getMerchantName = function() {
        return merchantName;
    };
    newPayment.setMerchantName = function(newMerchantName) {
        merchantName = newMerchantName;    
    };
    
    // IPN URL
    var ipnUrl;
    newPayment.getIpnUrl = function() {
        return ipnUrl;
    };
    newPayment.setIpnUrl = function(newIpnUrl) {
        ipnUrl = newIpnUrl;    
    };
    
    // start()
    newPayment.start = function(cb) {
        try {
            cbCheckout = cb;
            
            var invoice;
            var createInvoiceIfNeeded = function() {
                if (!invoice) {
                    invoice =  new com.paypal.android.MEP.PayPalInvoiceData();
                }
                
                return invoice;
            };
            
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
        
            if (customId) {
                logMsg('newPayment >> customId: ' +  customId);
                ppPayment.setCustomID(customId);
            }
            
            if (memo) {
                logMsg('newPayment >> memo: ' +  memo);
                ppPayment.setMemo(memo);
            }
            
            if (subType) {
                logMsg('newPayment >> subtype: ' +  subType);
                ppPayment.setPaymentSubtype(subType);
            }

            if (tax) {
                invoice = createInvoiceIfNeeded();
                
                logMsg('newPayment >> tax: ' +  tax);
                invoice.setTax(new java.math.BigDecimal(tax));
            }
            
            if (shipping) {
                invoice = createInvoiceIfNeeded();
                
                logMsg('newPayment >> shipping: ' +  shipping);
                invoice.setShipping(new java.math.BigDecimal(shipping));
            }

            if (merchantName) {
                logMsg('newPayment >> merchantname: ' +  merchantName);
                ppPayment.setMerchantName(merchantName);
            }
            
            if (ipnUrl) {
                logMsg('newPayment >> ipnurl: ' +  ipnUrl);
                ppPayment.setIpnUrl(ipnUrl);
            }
            
            if (invoice) {
                logMsg('newPayment >> setting invoice data...');
                ppPayment.setInvoiceData(invoice);
            }
        
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
