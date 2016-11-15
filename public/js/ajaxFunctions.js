'use strict';
function ready (fn) {
   if (typeof fn !== 'function') {
      return;
   }

   if (document.readyState === 'complete') {
      return fn();
   }

   document.addEventListener('DOMContentLoaded', fn, false);
}

function ajaxGet (url, callback) {
   var xmlhttp = new XMLHttpRequest();

   xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
         callback(JSON.parse(xmlhttp.responseText));
      }
   };

   xmlhttp.open('GET', url, true);
   xmlhttp.send();
}
   
function ajaxPost(url, postData, callback) {
   var xmlhttp = new XMLHttpRequest();

   xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
         callback(JSON.parse(xmlhttp.responseText));
      }
   };
   
   xmlhttp.open('POST', url, true);
   xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
   xmlhttp.send(postData);
}

function ajaxPostFile(url, postData, callback) {
   var xmlhttp = new XMLHttpRequest();
   
   xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
         callback(JSON.parse(xmlhttp.responseText));
      }
   };
   
   xmlhttp.open('POST', url, true);
   xmlhttp.setRequestHeader('Content-type', 'application/form-data');
   xmlhttp.send(postData);
}






