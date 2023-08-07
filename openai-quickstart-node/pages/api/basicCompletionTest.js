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

//EndPoint Get Story or feature Object ID
apiEndpoint = "https://rally1.rallydev.com/slm/webservice/v2.x/hierarchicalrequirement?query=(FormattedID = " + workProductNumber + ")&fetch=ObjectID";
//Making the API call to get Object ID
axios.get(apiEndpoint,
    {
        headers: {
            "Content-Type": "application/json",
            "zsessionid": zsessionid
        }
    }).then((data) => {
        var workProductID = data.data.QueryResult.Results[0].ObjectID;
        generateText(workProductID);
    });

//Making connection with ChatGPT
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
//Creating openai object
const openai = new OpenAIApi(configuration);
var acceptanceCriteria = `Write top 10 end to end test cases for following acceptance criteria:
Acceptance Criteria:
1. Create one admin global right that can provide a user with right to perform CRUD operations to group and re-order the tiles of CITs, CMO's and Teams like  Tile administrator 
`

//Making API call to ChatGPT
async function generateText(workProductID) {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: acceptanceCriteria,
            temperature: 0.7,
            max_tokens: 2048,
        });
        //Formatting API response so that it can be entered in Rally
        const testCases = response.data.choices[0].text.split('\n').filter(point => point.trim() !== '');
        const testCaseDesc = testCases.slice(testCases.indexOf('Test Cases:') + 1).map((testCase) => testCase.substr(testCase.indexOf(' ') + 1));
        console.log('response::', testCaseDesc);
        //Request batch payload for Rally
        let requestPayload = {
            "Batch": arrayOfEntryObjects
        };

        //Constructing batch payload
        for (let element of testCaseDesc) {
            console.log("element is: " + element);
            var tempEntryObject = {
                "Entry": {
                    "Path": "/testcase/create",
                    "Method": "POST",
                    "Body": {
                        "TestCase": {
                            "Name": element,
                            "WorkProduct": "/HierarchicalRequirement/" + workProductID
                        }
                    }
                }
            }
            arrayOfEntryObjects.push(tempEntryObject);
        }
        try {
            axios.post("https://rally1.rallydev.com/slm/webservice/v2.0/batch?project=/project/60404193387&shared=true", requestPayload, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ZSESSIONID": zsessionid
                }
            })
            params: { }
        } catch (error) { console.log(error) };
        return testCaseDesc;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


