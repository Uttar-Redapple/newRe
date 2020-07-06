/* response generation library for api */
let generate = (status, message, data) => {

  let payloadData;

   if(Array.isArray(data)){
     payloadData = {payload:data};
   }else{
     payloadData = data;
   }

    let response = {
      status: status,
      message: message,     
      data: payloadData
    }
    return response
  }
  
  module.exports = {
    generate: generate
  }
  