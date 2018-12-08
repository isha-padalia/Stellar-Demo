
function getKey() {

    var options = {
      
     
    };
  

$.when($.get('/getKeyData', options)).done(function (_res) {


     if(_res.type == 'success'){

            $('#secret').html(_res.secret);
            $('#public').html(_res.publicKey);
      }
      else{
    }
      
});

}


function getAccount() {

	var name = document.getElementById('data').value; 

    var options = {
       'name' : name,

    };
 
$.when($.post('/getAccountData', options)).done(function (_res) {

            console.log(_res.body)

            $('#gAcc').text(JSON.stringify(_res.body));
      
      
});

}


function getBalance(){

	var pKey = document.getElementById('pKey').value; 

    var options = {
       'pKey' : pKey,

    };
 
$.when($.post('/getBalanceData', options)).done(function (_res) {

            console.log("balance" + _res.balance);
            console.log("asset_type" + _res.asset_type);

            console.log(_res.success)

            // $('#type').text(_res.Type);

            // $('#pBal').text(_res.Balance);
      
 });

}

function Transfer(){

    var sKey = document.getElementById('sKey').value; 
    var dPkey = document.getElementById('dPkey').value; 
    var amount = document.getElementById('amount').value; 



    var options = {
       'sKey' : sKey,
       'dPkey':dPkey,
       'amount':amount
    };
 
$.when($.post('/TransferData', options)).done(function (_res) {
      

    console.log(_res.result)

});

}

