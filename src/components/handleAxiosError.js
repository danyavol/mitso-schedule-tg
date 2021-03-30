module.exports = function(error) {
    // Request made and server responded
    if (error.response) {
        return `Server responded error. Status: ${error.response.status}. Data: ${error.response.data}. Headers: ${error.response.headers}`;
      } 
      // The request was made but no response was received
      else if (error.request) {
        return `No response was received. Request: ${error.request}`;
      } 
      // Something happened in setting up the request that triggered an Error
      else {
        return `Request triggered an Error. Error: ${error.message}`;
      }
}