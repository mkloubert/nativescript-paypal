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

Run `tns plugin add nativescript-paypal` inside your app project to install the module.

### Android

#### AndroidManifest.xml

Keep sure to define the following permissions and having a reference to the [PayPalActivity](https://www.paypalobjects.com/webstatic/en_US/developer/docs/pdf/pp_mpl_developer_guide_and_reference_android.pdf) in your manifest file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

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
| account | [OPTIONAL] Defines information about the account. |
| clientId  | The PayPal ID for your app that was generated in the [PayPal Developer Portal](https://www.paypal-apps.com/user/my-account/applications). If not defined, the environment is set upped for the SandBox and uses `APP-80W284485P519543T` as value.  |
| environment  | [OPTIONAL] The environment to use. Possible values are: `0` = `ENVIRONMENT_SANDBOX`, `1` = `ENVIRONMENT_PRODUCTION`, `2` = `ENVIRONMENT_NO_NETWORK`.  |
| onActivityResult  | [OPTIONAL] Logic for [Activity.onActivityResult](http://developer.android.com/reference/android/app/Activity.html#onActivityResult%28int,%20int,%20android.content.Intent%29) method of the underlying Android activity that is used to invoke logic for other modules, e.g. |
| requestCode  | [OPTIONAL] The custom request code to use (e.g. for [Activity.onActivityResult](http://developer.android.com/reference/android/app/Activity.html#onActivityResult%28int,%20int,%20android.content.Intent%29) Android method). Default: `230958624`  |

##### account

The `account` object has the following structure:

###### Properties

| Name  | Description  |
| ----- | ----------- |
| name | [OPTIONAL] The name of the merchant. |

### Start a payment

```javascript
function buyProduct(args) {
    var payment = PayPal.newPayment();
    
    // the price
    payment.setAmount(59.79);
    
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
| getAmount | Gets the prince. Example: `var a = payment.getAmount();` |
| getCurrency | Gets the custom currency to use. Example: `var c = payment.getCurrency();` |
| getDescription | Gets the (short) description. Example: `var d = payment.getDescription();` |
| setAmount | Sets the prince. Example: `payment.setAmount(1.25);` |
| setCurrency | Sets the custom currency to use. Example: `payment.setCurrency('EUR');` |
| setDescription | Sets the (short) description. Example: `payment.setDescription('This is really awesom!');` |
| start | Starts the payment / checkout process. |

###### start

The callback that is submitted to the `payment.start` method receives an object with the following properties:

| Name  | Description  |
| ----- | ----------- |
| code | The result code. `0` = success, `-3` = JSON parse error, `-2` = unhandled exception, `-1` = cacheckout failed, `1` = cancelled, `2` = no confirm data, `3` = no JSON data |

## Enhancements

### Logging

If you want to get the logging output of the module, you can use `PayPal.addLogger` function to add a callback that receives a message from the module:

```javascript
PayPal.addLogger(function(msg) {
    console.log('[nativescript-paypal]: ' + msg);
});
```
