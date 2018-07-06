const request = require('request');


// Example code from AM node video 30 about looking at the response data

request({
  url:  ,
  json: true 
}, (error, response, body) => {
  console.log(`Lat: ${body.results[0].geometry.location.lat}`);
});