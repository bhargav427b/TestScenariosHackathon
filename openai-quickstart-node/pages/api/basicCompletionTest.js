

let testcaseDescription = "";
let userName = "ashok.kumar@broadcom.com";//Get the username from front End
let password = "AprWings2022";//Get the password from front End;
let apiEndpoint = "";
let zsessionid = "_AUMlbwE4RF6wlFFx50VnXsYV8aU1xEbqdtouimIpzg";
let workProductNumber = "\"S241169\"";
let arrayOfEntryObjects = [];
const axios = require('axios');
require("dotenv").config();
const { response } = require('express');

/*Obtain ZSessionID of the user
 axios.get("https://rally1.rallydev.com/slm/webservice/v2.0/security/authorize", {
    auth: {
        username: userName,
        password: password
    }
}
).then(data => { 
    zsessionid = data.data.OperationResult.SecurityToken
console.log("zsession id is: " + zsessionid);*/
//Obtain Object ID of Story or Feature
//if (workProductNumber.charAt(0) === "S") {
    apiEndpoint = "https://rally1.rallydev.com/slm/webservice/v2.x/hierarchicalrequirement?query=(FormattedID = "+ workProductNumber+")&fetch=ObjectID";
//} else {
//    apiEndpoint = "https://rally1.rallydev.com/slm/webservice/v2.x/portfolioitem/feature/?query=(FormattedID = "+workProductNumber+")&fetch=ObjectID"
//}
console.log("apiEndPoint is:" + apiEndpoint);
 
axios.get(apiEndpoint,
     {
    headers: {
        "Content-Type": "application/json",
        "zsessionid": zsessionid
    }
}).then((data) => { //console.log(data.data.QueryResult.Results[0].ObjectID);;
    //workProductID = "700384077603";
    //console.log("WorkproductID inside get method: "+data.data.QueryResult.Results[0].ObjectID);
    //console.log("Type of ObjectID is: "+typeof data.data.QueryResult.Results[0].ObjectID);
    var workProductID = data.data.QueryResult.Results[0].ObjectID; 
    console.log("WorkProduct id inside GET method is: " + workProductID);

    generateText(workProductID);



}); //Do we need to add headers here as well ?*/
//console.log("Value of workProductID outside"+ workProductID);


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
var acceptanceCriteria = `Write top 10 end to end test cases for following acceptance criteria:
Acceptance Criteria:
1. Create one admin global right that can provide a user with right to perform CRUD operations to group and re-order the tiles of CITs, CMO's and Teams like  Tile administrator 
`



async function generateText(workProductID) {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: acceptanceCriteria,
            temperature: 0.7,
            max_tokens: 2048,
        });
        const testCases = response.data.choices[0].text.split('\n').filter(point => point.trim() !== '');
        const testCaseDesc = testCases.slice(testCases.indexOf('Test Cases:') + 1).map((testCase) => testCase.substr(testCase.indexOf(' ') + 1));
        console.log('response::', testCaseDesc);

        let requestPayload = {
            "Batch": arrayOfEntryObjects
        };

        //testCaseDesc.forEach(element => {
            for (let element of testCaseDesc){
                console.log("element is: "+element);
                var tempEntryObject = {
                    "Entry": {
                        "Path": "/testcase/create",
                        "Method": "POST",
                        "Body": {
                            "TestCase": {
                                "Name": element,
                                "WorkProduct": "/HierarchicalRequirement/"+workProductID
                            }
                        }
                    }
                }
                arrayOfEntryObjects.push(tempEntryObject);
            }
            //requestPayload.TestCase.Name = element;
            console.log("request payload is"+JSON.stringify(requestPayload));
            
            try {
                axios.post("https://rally1.rallydev.com/slm/webservice/v2.x/testcase/create", requestPayload, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "ZSESSIONID": zsessionid
                    }
                    //params:{
                    //     "compact": true,
                    // "includePermissions": true,
                    // //"key": "TSfQhDSiSWaYPx1WbiJcaPphOoizBkvck5IYME5lTFQ",
                    // "rankTo": "BOTTOM",
                    // "project": "%2Fproject%2F60404193387",
                    // "projectScopeUp": false,
                    // "projectScopeDown": true
                    // }
                    //body: JSON.stringify(requestPayload),
                })//.then(data => { console.log(data.data); })

                //const data = await response1.json();
                //console.log(requestPayload);
                //axios.post("https://rally1.rallydev.com/slm/webservice/v2.x/testcase/create&key=elb59khwRoCPVWfC6sWIPwslhPD3pEaPjMC42PAsDNg", requestPayload, {
                params: {
                    //"compact": true,
                    //"includePermissions": true,
                    //"key": 'elb59khwRoCPVWfC6sWIPwslhPD3pEaPjMC42PAsDNg'
                    //"rankTo": "BOTTOM",
                    //"project": "%2Fproject%2F60404193387",
                    //"projectScopeUp": false,
                    //"projectScopeDown": true
                }
                //}).then(data => { console.log(data) })
            } catch (error) { console.log(error) };
        
        //)
        return testCaseDesc;
        

    } catch (error) {
        
        console.error(error);
        throw error;
    }
}

//const chatGPTResponse = generateText();


