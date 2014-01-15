/**
 * Label message as VIP if sender is in the vip list
 * To be executed on Google App Script
 * https://developers.google.com/apps-script/
 */

eval(UrlFetchApp.fetch("http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js").getContentText())

var vip_list = [
"foo@bar.com",
"bar@zaz.com",
];

var other_labels = [
  "@sanelater"
]

var vip_label        = GmailApp.getUserLabelByName("VIP");
var total_processed  = 0;

function main(){
  Logger.log("Starting...");
  processInbox();
  processOtherLabels(other_labels);
  Logger.log("Messages processed: " + total_processed);
}

function processInbox() {
  // get all threads in inbox
  var threads = GmailApp.getInboxThreads();
  processThreads(threads);
};

function processOtherLabels(){
  _.map(other_labels, function(label){
    var label = GmailApp.getUserLabelByName(label);
    var threads = label.getThreads();
    processThreads(threads);
  });
}

function processThreads(threads){
   for (var i = 0; i < threads.length; i++) {
     var labels = threads[i].getLabels();
     if (notLabeledAsVIP(labels) && threads[i].isUnread()) {
       var messages = threads[i].getMessages();
       for (var j = 0; j < messages.length; j++) {
         if (messages[j].isUnread()){ processMessage(threads[i], messages[j]) }
       }
     }
   }
}

function notLabeledAsVIP(labels){
  var response = true
  _.map(labels, function(label){
    if (label.getName() == "VIP") { response = false }
  });
  return response
}

function processVIP(thread, message, from){
  total_processed++;
  vip_label.addToThread(thread);
  thread.moveToInbox();
  Logger.log("Processed VIP message from" + from);
}

function processMessage(thread, message){
  var from = parseFrom(message.getFrom());
//  Logger.log("processing:" + from);
  if (vip_list.indexOf(from) !=  -1) {
    processVIP(thread, messages, from);
 }
}

function parseFrom(original){
  var  response =  original.split("<");
  if (response.length > 1) {
    response = response[1].slice(0, -1);
  }
  return response
}