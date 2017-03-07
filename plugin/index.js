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
"use strict";
var Device = require('./Device');
/**
 * List of environments.
 */
(function (PayPalEnvironment) {
    /**
     * Sandbox
     */
    PayPalEnvironment[PayPalEnvironment["Sandbox"] = 0] = "Sandbox";
    /**
     * Production.
     */
    PayPalEnvironment[PayPalEnvironment["Production"] = 1] = "Production";
    /**
     * No network
     */
    PayPalEnvironment[PayPalEnvironment["NoNetwork"] = 2] = "NoNetwork";
})(exports.PayPalEnvironment || (exports.PayPalEnvironment = {}));
var PayPalEnvironment = exports.PayPalEnvironment;
/**
 * Adds a logger (callback).
 *
 * @param {LoggerCallback} l The callback to add.
 */
function addLogger(l) {
    Device.addLogger(l);
}
exports.addLogger = addLogger;
/**
 * Initializes the environment to use PayPal.
 *
 * @param {IPayPalConfig} [cfg] The configuration.
 */
function init(cfg) {
    Device.init(cfg);
}
exports.init = init;
/**
 * Starts a new payment.
 *
 * @return {IPayPalPayment} The new payment.
 */
function newPayment() {
    return Device.newPayment();
}
exports.newPayment = newPayment;
//# sourceMappingURL=index.js.map