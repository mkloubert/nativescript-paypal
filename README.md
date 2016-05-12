# NativeScript PayPal

[NativeScript](https://www.nativescript.org/) module for implementing simple PayPal checkouts using official  [MPL](https://developer.paypal.com/docs/classic/mobile/gs_MPL/).

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
    
    <application>
    
      <activity android:name="com.paypal.android.MEP.PayPalActivity"
                android:configChanges="keyboardHidden|orientation"
                android:theme="@android:style/Theme.Translucent.NoTitleBar" />
    
    </application>
    
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
    PayPal.init({
        appId: '<YOUR-APP-ID>'
    });
}
exports.onPageLoaded = onPageLoaded;
```

The (optional) object that is submitted to the `PayPal.init` function has the following structure:

#### Properties

| Name  | Description  |
| ----- | ----------- |
| account | [OPTIONAL] Defines information about the account. |
| appId  | The PayPal ID for your app that was generated in the [PayPal Developer Console](https://developer.paypal.com/developer/applications/). If not defined, the environment is set upped for the SandBox and uses `APP-80W284485P519543T` as value.  |
| defaultCurrency  | [OPTIONAL] The default currency to use. Default: `USD`  |
| environment  | [OPTIONAL] The environment to use. Possible values are: `0` = `ENV_SANDBOX`, `1` = `ENV_LIVE`, `2` = `ENV_NONE`. Default is `0` if `appId` is defined.  |
| feesPayer  | [OPTIONAL] The payer for the fees. Possible values are: `0` = `FEEPAYER_EACHRECEIVER`, `1` = `FEEPAYER_SENDER`, `2` = `FEEPAYER_PRIMARYRECEIVER`, `3` = `FEEPAYER_SECONDARYONLY`.  Default: `0`  |
| isShippingEnabled  | [OPTIONAL] Enable shipping or not. Default: `(false)`  |
| onActivityResult  | [OPTIONAL] Logic for [Activity.onActivityResult](http://developer.android.com/reference/android/app/Activity.html#onActivityResult%28int,%20int,%20android.content.Intent%29) method of the underlying Android activity that is used to invoke logic for other modules, e.g. |
| requestCode  | [OPTIONAL] The custom request code to use (e.g. for [Activity.onActivityResult](http://developer.android.com/reference/android/app/Activity.html#onActivityResult%28int,%20int,%20android.content.Intent%29) Android method). Default: `230958624`  |

##### account

The `account` object has the following structure:

###### Properties

| Name  | Description  |
| ----- | ----------- |
| countryDialingCode | [OPTIONAL] The country dialing code for the (contact) phone number of the account. |
| email | [OPTIONAL] The (contact) email of the account. |
| name | [OPTIONAL] The name of the account. |
| phone | [OPTIONAL] The (contact) phone number of the account. |

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
exports.buyProduct = buyProduct;
```

The `payment` object that is created by `PayPal.newPayment` function has the following structure.

#### Methods

| Name  | Description  |
| ----- | ----------- |
| getCurrency | Gets the custom currency to use. Example: `var c = payment.getCurrency();` |
| getCustomId | Gets the custom ID for the payment. Example: `var cId = payment.getCustomId();` |
| getMemo | Gets the memo. Example: `var m = payment.getMemo();` |
| getRecipient | Gets the recipient (email of the PayPal account, e.g.) of the payment. Example: `var r = payment.getRecipient();` |
| getSubtotal | Gets the prices without taxes. Example: `var st = payment.getSubtotal();` |
| getSubtype | Gets the payment sub type. `var st = payment.getSubtype();` |
| getTax | Gets the tax rate. Example: `var t = payment.getTax();` |
| getType | Gets the payment type. `var t = payment.getType();` |
| setCurrency | Sets the custom currency to use. Example: `payment.setCurrency('EUR');` |
| setCustomId | Sets the custom ID for the payment. Example: `payment.setCustomId('my-product-id');` |
| setMemo | Sets the memo. Example: `payment.setMemo('This is a memo about the payment.');` |
| setRecipient | Sets the recipient (email of the PayPal account, e.g.) of the payment. Example: `payment.setRecipient('paypal@example.com');` |
| setSubtotal | Sets the prices without taxes. Example: `payment.setSubtotal(1.25);` |
| setSubtype | Sets the payment sub type. Possible values are: `0` = `PAYMENT_SUBTYPE_AFFILIATE`, `1` = `PAYMENT_SUBTYPE_B2B`, `2` = `PAYMENT_SUBTYPE_PAYROLL`, `3` = `PAYMENT_SUBTYPE_REBATES`, `4` = `PAYMENT_SUBTYPE_REFUNDS`, `5` = `PAYMENT_SUBTYPE_REIMBUSEMENTS`, `5` = `PAYMENT_SUBTYPE_REIMBURSEMENTS`, `6` = `PAYMENT_SUBTYPE_DONATIONS` `7` = `PAYMENT_SUBTYPE_UTILITIES`, `8` = `PAYMENT_SUBTYPE_TUITION`, `9` = `PAYMENT_SUBTYPE_GOVERNMENT`, `10` = `PAYMENT_SUBTYPE_INSURANCE`, `11` = `PAYMENT_SUBTYPE_REMITTANCES`, `12` = `PAYMENT_SUBTYPE_RENT`, `13` = `PAYMENT_SUBTYPE_MORTGAGE`, `14` = `PAYMENT_SUBTYPE_MEDICAL`, `15` = `PAYMENT_SUBTYPE_CHILDCARE`, `16` = `PAYMENT_SUBTYPE_EVENTS`, `17` = `PAYMENT_SUBTYPE_CONTRACTORS`, `18` = `PAYMENT_SUBTYPE_ENTERTAINMENT`, `19` = `PAYMENT_SUBTYPE_TOURISM`, `20` = `PAYMENT_SUBTYPE_INVOICE`, `21` = `PAYMENT_SUBTYPE_TRANSFER`, `22` = `PAYMENT_SUBTYPE_NONE`  |
| setTax | Sets the tax rate. Example: `payment.setTax('2.20');` |
| setType | Sets the payment type. Possible values are: `0` = `PAYMENT_TYPE_GOODS`, `1` = `PAYMENT_TYPE_SERVICE`, `2` = `PAYMENT_TYPE_PERSONAL`, `3` = `PAYMENT_TYPE_NONE`  |
| start | Starts the payment by defining a callback that is invoked after operation has been done.  |

###### start

The callback that is submitted to the `payment.start` method receives an object with the following properties:

| Name  | Description  |
| ----- | ----------- |
| code | The result code. `0` = success, `1` = cancelled, `-1` = error |
| id | The error ID (if `code` = `-1`) |
| key | The pay key returned by PayPal after successful transaction (if `code` = `0`) |
| message | The error message (if `code` = `-1`) |

## Enhancements

### Logging

If you want to get the logging output of the module, you can use `PayPal.addLogger` function to add a callback that receives a message from the module:

```javascript
PayPal.addLogger(function(msg) {
    console.log('[nativescript-paypal]: ' + msg);
});
```

