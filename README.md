# Nativescript PayPal

NativeScript module for using [MPL by PayPal](https://developer.paypal.com/docs/classic/mobile/gs_MPL/).

## Installation

Run `tns plugin add nativescript-paypal` inside your app project that install the module.

### Android

#### AndroidManifest.xml

Keep sure to define the following permissions in your manifest file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

</manifest>
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
    PayPal.init();
}
exports.onPageLoaded = onPageLoaded;
```

### Start a payment

```javascript
function buyProduct(args) {
    var payment = PayPal.newPayment();
    
    // the price (without taxes)
    payment.setSubtotal(59.79);
    // the email address of
    // the recipient's PayPal account
    payment.setRecipient('paypal@example.com');
    
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
                // use 'cbResult.id'
                // and 'cbResult.message'
                // to get more information
                break;
        }
    });
}
exports.onPageLoaded = onPageLoaded;
```
