// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


var Observable = require("data/observable").Observable;
var PayPal = require('nativescript-paypal');

function createViewModel() {
    var vm = new Observable();
    
    vm.init = function() {
        PayPal.addLogger(function(msg) {
            console.log('[nativescript-paypal] ' + msg);
        });
        
        PayPal.init({
            // if you would like use the SandBox
            // add the client ID here
            // and change 'environment' to 0
            
            // clientId: '',
            environment: 2
        });    
    };

    vm.startPayPalCheckout = function() {
        var payment = PayPal.newPayment()
            .setDescription('Test product')
            .setAmount(1.23)
            .setCurrency('EUR');
            
        payment.start(function(result) {
            console.log('payment result code: ' + result.code);
        });
    };

    return vm;
}
exports.createViewModel = createViewModel;
