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

const Device = require('./Device');


/**
 * Configuration to setup the environment.
 */
export interface IPayPalConfig {
    /**
     * Account settings
     */
    account?: {
        /**
         * Your company name, as it should be displayed to the user when requesting consent for future payments.
         */
        name?: string;
        /**
         * URL of your company's privacy policy, which will be offered to the user when requesting consent for future payments.
         */
        privacyPolicy?: string;
        /**
         * URL of your company's user agreement, which will be offered to the user when requesting consent for future payments.
         */
        userAgreement?: string;
    };
    /**
     * The ID of the requesting client (app).
     */
    clientId?: string;
    /**
     * Defaults
     */
    defaults?: {
        /**
         * Optional string that pre-populates email login if no other information is available.
         */
        userEmail?: string;
        /**
         * Optional string that pre-populates phone number login if no other information is available.
         */
        userPhone?: string;
        /**
         * Optional string that indicates the country code of the specified userPhone.
         */
        userPhoneCountryCode?: string;
    },
    /**
     * The environment to use.
     */
    environment: PayPalEnvironment;
    /**
     * The language to use. Default: 'en_US'
     */
    lang?: string;
    /**
     * Remember user or not. Default: (true)
     */
    rememberUser?: boolean;
    /**
     * The request code (Android only). Default: 230958624
     */
    requestCode?: number;
}

/**
 * A payment.
 */
export interface IPayPalPayment {
}

/**
 * A logger callback.
 * 
 * @param {string} msg The message to log.
 */
export type LoggerCallback = (msg: string) => void;

/**
 * List of environments.
 */
export enum PayPalEnvironment {
    /**
     * Sandbox
     */
    Sandbox = 0,
    /**
     * Production.
     */
    Production = 1,
    /**
     * No network
     */
    NoNetwork = 2,
}


/**
 * Adds a logger (callback).
 * 
 * @param {LoggerCallback} l The callback to add.
 */
export function addLogger(l: LoggerCallback) {
    Device.addLogger(l);
}

/**
 * Initializes the environment to use PayPal.
 * 
 * @param {IPayPalConfig} [cfg] The configuration.
 */
export function init(cfg?: IPayPalConfig): void {
    Device.init(cfg);
}

/**
 * Starts a new payment.
 * 
 * @return {IPayPalPayment} The new payment.
 */
export function newPayment(): IPayPalPayment {
    return Device.newPayment();
}
