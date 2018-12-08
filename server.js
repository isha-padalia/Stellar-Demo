/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
'use strict';
const express = require('express'); // app server
const bodyParser = require('body-parser'); // parser for post requests
const serverEE = express();
var request = require('request');
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Bootstrap application settings
serverEE.use(express.static('./public')); // load UI from public folder
serverEE.use(bodyParser.json());
serverEE.use(bodyParser.urlencoded({
  extended: true
}));


const port = process.env.PORT || 8000;
//function
serverEE.listen(port, function() {

  var adr = 'http://localhost:'+port+'/nav.html';
  console.log('Server running on:');
  console.log(adr);

});

var secret;
var publickey;

serverEE.get('/getKeyData', function (req, res) {
        
 var pair = StellarSdk.Keypair.random();

  secret =  pair.secret();
// SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
publickey = pair.publicKey();


 console.log(pair);
 console.log(secret);
 
      res.send({
          'type':'success',
          'secret':secret,
          'publicKey':publickey


       });
})


serverEE.post('/getAccountData', function (req, res) {
        
  console.log("req.body.name" , req.body.name)
    request.get({
      url: 'https://friendbot.stellar.org',
      qs: { addr: req.body.name },
      json: true
    }, function(error, response, body) {
      if (error || response.statusCode !== 200) {
        console.error('ERROR!', error || body);
      }
      else {
        console.log('SUCCESS! You have a new account :)\n', body);
        res.send({
          'body':body,
      });
      }
  });
})


var Type ;
var Balance ;

serverEE.post('/getBalanceData', function (req, res) {
  
  server.loadAccount(req.body.pKey).then(function(account) {

    account.balances.forEach(function(balance) {
    
     Type = balance.asset_type;
     Balance = balance

      console.log(balance.balance);

      console.log(balance.asset_type); 
      res.send({
        'success':'success',
        'balance:': "" + balance.balance, 
        'asset_type:': balance.asset_type
       });
    });
   
  });

})


serverEE.post('/TransferData', function (req, res) {

  var sKey = req.body.sKey;
  var dPkey = req.body.dPkey;
  var amount1 = req.body.amount;


  StellarSdk.Network.useTestNetwork();
  var sourceKeys = StellarSdk.Keypair
    .fromSecret(sKey);
  var destinationId = dPkey;
  // Transaction will hold a built transaction we can resubmit if the result is unknown.
  var transaction;
  
  // First, check to make sure that the destination account exists.
  // You could skip this, but if the account does not exist, you will be charged
  // the transaction fee when the transaction fails.
  server.loadAccount(destinationId)
    // If the account is not found, surface a nicer error message for logging.
    .catch(StellarSdk.NotFoundError, function (error) {
      throw new Error('The destination account does not exist!');
    })
    // If there was no error, load up-to-date information on your account.
    .then(function() {
      return server.loadAccount(sourceKeys.publicKey());
    })
    .then(function(sourceAccount) {
      // Start building the transaction.
      transaction = new StellarSdk.TransactionBuilder(sourceAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationId,
          // Because Stellar allows transaction in many currencies, you must
          // specify the asset type. The special "native" asset represents Lumens.
          asset: StellarSdk.Asset.native(),
          amount: amount1
        }))
        // A memo allows you to add your own metadata to a transaction. It's
        // optional and does not affect how Stellar treats the transaction.
        .addMemo(StellarSdk.Memo.text('Test Transaction'))
        .build();
      // Sign the transaction to prove you are actually the person sending it.
      transaction.sign(sourceKeys);
      // And finally, send it off to Stellar!
      return server.submitTransaction(transaction);
    })
    .then(function(result) {
      console.log('Success! Results:', result);
    })
    .catch(function(error) {
      console.error('Something went wrong!', error);
      // If the result is unknown (no response body, timeout etc.) we simply resubmit
      // already built transaction:
      // server.submitTransaction(transaction);
    });
})

