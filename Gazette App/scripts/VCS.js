  
 // Test card Nos: 4242424242424242, 5454545454545454, 5221001010000024, 5221001010000032, 5221001010000040
  
function requestAuthorisationForm(cardHolderName, cardNo, expMonth, expYear, cvcNo,amount,description) {
    
    // Generate a unique reference 
    var referenceNo = Date.now() + randomString(7);
    
    // Build the xml string
    var xmlAuthRequestDoc = "<?xml version='1.0'?>" +
    "<AuthorisationRequest>" +
    "    <UserId>9730</UserId>" + 
    "    <Reference>"+ referenceNo +"</Reference>" +
    "    <Description>"+description+"</Description>" +
    "    <Amount>" + amount +"</Amount>" +
    "    <CardholderName>"+ cardHolderName +"</CardholderName>" +
    "    <CardNumber>"+ cardNo +"</CardNumber>" +
    "    <ExpiryMonth>"+ expMonth +"</ExpiryMonth>" +
    "    <ExpiryYear>"+ expYear +"</ExpiryYear>" +
    "    <CardValidationCode>"+ cvcNo +"</CardValidationCode>" +
    "    <BudgetPeriod>00</BudgetPeriod>" +
    "    <Currency></Currency>" +
    "    <OccurFrequency></OccurFrequency>" + 
    "    <OccurCount></OccurCount>" +
    "    <OccurEmail></OccurEmail>" +
    "    <OccurAmount></OccurAmount>" +
    "    <NextOccurDate></NextOccurDate>" + 
    "    <CellNumber></CellNumber>" +
    "    <CellMessage></CellMessage>" +
    "    <CardPresent></CardPresent>" +
    "    <Track2></Track2>" +
    "    <SettleOnly></SettleOnly>" +
    "    <ManualAuthCode></ManualAuthCode>" +
    "    <DelaySettlement></DelaySettlement>" +
    "    <Eci></Eci>" +
    "    <Cavv></Cavv>" + 
    "    <Xid></Xid>" +
    "    <CardHolderEmail>bonnmos@gmail.com</CardHolderEmail>" +
    "    <m_1></m_1>" +
    "    <m_2></m_2>" +
    "    <m_3></m_3>" +
    "    <m_4></m_4>" +
    "    <m_5></m_5>" +
    "    <m_6></m_6>" +
    "    <m_7></m_7>" +
    "    <m_8></m_8>" +
    "    <m_9></m_9>" +
    "    <m_10></m_10>" +  
    "</AuthorisationRequest>";  
        
    // Send the xml string for authorisation.
    requestAuthorisation(xmlAuthRequestDoc);
}

/**
 * Returns random and unique string of specified length.
 */
function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

/**
 * Send an ajax authorisation request to cvs.
 */
function requestAuthorisation(xmlAuthRequestDoc) {
    
    $.ajax({
        url: "https://www.vcs.co.za/vvonline/ccxmlauth.asp?xmlMessage=" + encodeURIComponent(xmlAuthRequestDoc),
        type: "POST",
        dataType: "xml",
        crossDomain: true,
        success: function(data) {
            // Convert response xml to a JSON object
            var jsonObj = $.xml2json(data);
            
            var responseStr = jsonObj.Response+"";
            
            console.log(responseStr);
            if (responseStr.toString().indexOf("APPROVED") !== -1) {
                var user = localStorage.getItem("user_email");
    var dt = localStorage.getItem("CardExpiry");
    var type= localStorage.getItem("subscription-type");
    var start= localStorage.getItem("subscription-start");
    var end = localStorage.getItem("subscription-end");
    var amount = localStorage.getItem("subscription-value");
                // TO DO: Redirect appropriate view
                var data = el.data('Subscription');
            data.create({ 'AccountEmail':user, 'SubscriptionType':type,'SubscriptionEndDate':end,'TransactionDate':start,'AmountPaid':amount },
            function(data){
               syncSubscriptions();
            $.when(updateStorage()).then(function(){
              
                getSubscriptions();
                
                 app.pane.loader.hide();
                app.navigate('#GazetteHome');
            });
    
    },
    function(error){
             app.pane.loader.hide();
        alert(JSON.stringify(error));
    });
                
                console.log("IT'S APPROVED!!!");
            } else {
                
                // TO DO: Redirect appropriate view
                app.navigate("#CardError","slide:right");
                console.log("NOT APPROVED - " + responseStr);
            }
        },
        error: function(error) {
            alert("An error occured:\n" + error);
        }
    });
}