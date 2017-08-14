[![npm](https://img.shields.io/npm/v/nativescript-paypal.svg)](https://www.npmjs.com/package/nativescript-paypal)
[![npm](https://img.shields.io/npm/dt/nativescript-paypal.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-paypal)

# NativeScript PayPal

[NativeScript](https://www.nativescript.org/) module for implementing simple PayPal checkouts using official  [SDK](https://developer.paypal.com/docs/integration/mobile/mobile-sdk-overview/).

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=R3YXF4NEV9AAL)

## License

[MIT license](https://raw.githubusercontent.com/mkloubert/nativescript-paypal/master/LICENSE)

## Platforms

* Android

## Roadmap

* [add support for iOS](https://github.com/mkloubert/nativescript-paypal/issues/1)

## Installation

Run

```bash
tns plugin add nativescript-paypal
```

inside your app project to install the module.

### Android

#### AndroidManifest.xml

Keep sure to define the following permissions, activities and other data in your manifest file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />    
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <action android:name="android.intent.action.MAIN" />
 
    <category android:name="android.intent.category.LAUNCHER" />

    <uses-feature android:name="android.hardware.camera"
                  android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus"
                  android:required="false" />

    <application>
        <activity android:name="com.paypal.android.sdk.payments.PaymentActivity" />
        <activity android:name="com.paypal.android.sdk.payments.LoginActivity" />
        <activity android:name="com.paypal.android.sdk.payments.PaymentMethodActivity" />
        <activity android:name="com.paypal.android.sdk.payments.PaymentConfirmActivity" />
        <activity android:name="com.paypal.android.sdk.payments.PayPalFuturePaymentActivity" />
        <activity android:name="com.paypal.android.sdk.payments.FuturePaymentConsentActivity" />
        <activity android:name="com.paypal.android.sdk.payments.FuturePaymentInfoActivity" />
        <activity android:name="io.card.payment.DataEntryActivity" />
		
	    <service android:name="com.paypal.android.sdk.payments.PayPalService"
                 android:exported="false" />
    </application>
    
</manifest>
```

### app.gradle

Keep sure to have a reference to the PayPal SDK in your `app/App_Resources/Android/app.gradle` file of your project.

```gradle
dependencies {
    // PayPal
    compile 'com.paypal.sdk:paypal-android-sdk:2.14.2'
}
```

## Demo

For quick start have a look at the [demo/app/main-view-model.js](https://github.com/mkloubert/nativescript-paypal/blob/master/demo/app/main-view-model.js) file of the [demo app](https://github.com/mkloubert/nativescript-paypal/tree/master/demo) to learn how it works.

Otherwise ...

## Usage

### Include

Include the module in your code-behind:

```javascript
var PayPal = require("nativescript-paypal");
```

### Initialize

Initialize the environment:

```javascript
function onPageLoaded(args) {
    PayPal.init({
        clientId: '<YOUR-CLIENT-ID>'
    });
}
exports.onPageLoaded = onPageLoaded;
```

The (optional) object that is submitted to the `PayPal.init` function has the following structure:

#### Properties

| Name  | Description  |
| ----- | ----------- |
| acceptCreditCards  | [OPTIONAL] Accept credit cards or not. Default: `(true)`  |
| account | [OPTIONAL] Defines information about the account. |
| clientId  | The PayPal ID for your app that was generated in the [PayPal Developer Portal](https://www.paypal-apps.com/user/my-account/applications).  |
| defaults | [OPTIONAL] Defines default data. |
| environment  | [OPTIONAL] The environment to use. Possible values are: `0` = `ENVIRONMENT_SANDBOX`, `1` = `ENVIRONMENT_PRODUCTION`, `2` = `ENVIRONMENT_NO_NETWORK`.  |
| onActivityResult  | [OPTIONAL] Logic for [Activity.onActivityResult](http://developer.android.com/reference/android/app/Activity.html#onActivityResult%28int,%20int,%20android.content.Intent%29) method of the underlying Android activity that is used to invoke logic for other modules, e.g. |
| rememberUser  | [OPTIONAL] Remember the last user for the next payment or not. Default: `(true)`  |
| requestCode  | [OPTIONAL] The custom request code to use (e.g. for [Activity.onActivityResult](http://developer.android.com/reference/android/app/Activity.html#onActivityResult%28int,%20int,%20android.content.Intent%29) Android method). Default: `230958624`  |

##### account

The `account` object has the following structure:

###### Properties

| Name  | Description  |
| ----- | ----------- |
| name | [OPTIONAL] The name of the merchant. |
| privacyPolicy | [OPTIONAL] The URI to the privacy policy of the merchant. |
| userAgreement | [OPTIONAL] The URI to the user agreement of the merchant. |

##### defaults

The `defaults` object has the following structure:

###### Properties

| Name  | Description  |
| ----- | ----------- |
| userEmail | [OPTIONAL] The default user email. |
| userPhone | [OPTIONAL] The default user phone. |
| userPhoneCountryCode | [OPTIONAL] The default user phone country code. |

### Start a payment

```javascript
function buyProduct(args) {
    // configure
    var payment = PayPal.newPayment()
        .setDescription('My product')
        .setAmount(59.79);

    // start checkout / payment
    payment.start(function(cbResult) {
        switch (cbResult.code) {
            case 0:
                // SUCCESS
                // pay key is stored in 'cbResult.key'
                break;
                
            case 1:
                // operation was CANCELLED
                break;
                
            case -1:
                // checkout FAILED
                break;
                
            case -2:
                // "unhandled exception"
                break;
        }
    });
}
exports.buyProduct = buyProduct;
```

The `payment` object that is created by `PayPal.newPayment` function has the following structure.

#### Methods

| Name  | Description  |
| ----- | ----------- |
| getAmount | Gets the price. Example: `var a = payment.getAmount();` |
| getBnCode | Gets the BN code. Example: `var bc = payment.getBnCode();` |
| getCurrency | Gets the custom currency to use. Example: `var c = payment.getCurrency();` |
| getCustom | Gets the custom value for the payment. Example: `var c = payment.getCustom();` |
| getDescription | Gets the (short) description. Example: `var d = payment.getDescription();` |
| getDetails | Gets an object with the payment details. Example: `var d = payment.getDetails();` |
| getInvoiceNumber | Gets the custom invoice number. Example: `var i = payment.getInvoiceNumber();` |
| setAmount | Sets the price. Example: `payment.setAmount(1.25);` |
| setBnCode | Sets a BN code. Example: `payment.setBnCode('Your BN Code');` |
| setCurrency | Sets the custom currency to use. Example: `payment.setCurrency('EUR');` |
| setCustom | Sets the custom value for the payment. Example: `payment.setCustom('MY-PRODUCT-ID');` |
| setDetails | Sets details (shipping, subtotal & tax). Example: `payment.setDetails(4.95, 199.99, 1.19);` |
| setDescription | Sets the (short) description. Example: `payment.setDescription('This is really awesom!');` |
| setInvoiceNumber | Sets the custom invoice number. Example: `payment.setInvoiceNumber('MY_INVOICE-666');` |
| start | Starts the payment / checkout process. |

###### start

The callback that is submitted to the `payment.start` method receives an object with the following properties:

| Name  | Description  |
| ----- | ----------- |
| code | The result code. `0` = success, `-3` = JSON parse error, `-2` = unhandled exception, `-1` = checkout failed, `1` = cancelled, `2` = no confirm data, `3` = no JSON data |
| key | The key of the payment (if `code` = `0`)

## Enhancements

### Logging

If you want to get the logging output of the module, you can use `PayPal.addLogger` function to add a callback that receives a message from the module:

```javascript
PayPal.addLogger(function(msg) {
    console.log('[nativescript-paypal]: ' + msg);
});
```
