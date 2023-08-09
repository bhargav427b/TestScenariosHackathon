import axios from "axios";
const { Configuration, OpenAIApi } = require("openai");

export async function insertTestScenarios(storyId, sessionId) {
    return configurationWithChatGPT(storyId, sessionId);
}

async function configurationWithChatGPT(storyId, sessionId) {
    const apiEndpoint = "https://rally1.rallydev.com/slm/webservice/v2.x/hierarchicalrequirement?query=(FormattedID = " + storyId + ")&fetch=ObjectID";

    try {
        const response = await axios.get(apiEndpoint, {
            headers: {
                "Content-Type": "application/json",
                "zsessionid": sessionId
            }
        });

        const workProductID = response.data.QueryResult.Results[0].ObjectID;
        return getDescriptionOfWorkItem(workProductID, sessionId);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getDescriptionOfWorkItem(workProductID, sessionId) {
    const workItemDescription = "https://rally1.rallydev.com/slm/webservice/v2.0/hierarchicalrequirement/" + workProductID + "?fetch=Description";

    try {
        const response = await axios.get(workItemDescription, {
            headers: {
                "Content-Type": "application/json",
                "zsessionid": sessionId
            }
        });

        const description = response.data.HierarchicalRequirement.Description;
        const acceptanceCriteria = "Can you please use the Acceptance Criteria from below text and create all possible end to end test cases without steps?" + description;
        return generateText(workProductID, acceptanceCriteria, sessionId);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function generateText(workProductID, acceptanceCriteria, sessionId) {
    const configuration = new Configuration({
        apiKey: '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',
    });
    const openai = new OpenAIApi(configuration);

    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: acceptanceCriteria,
            temperature: 0.7,
            max_tokens: 2048,
        });

        const testCases = response.data.choices[0].text.split('\n').filter(point => point.trim() !== '');
        const testCaseDesc = testCases.slice(testCases.indexOf('Test Cases:') + 1).map((testCase) => testCase.substr(testCase.indexOf(' ') + 1));

        const requestPayload = {
            "Batch": testCaseDesc.map(element => ({
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
            }))
        };

        await axios.post("https://rally1.rallydev.com/slm/webservice/v2.0/batch?project=/project/60404193387&shared=true", requestPayload, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ZSESSIONID": sessionId
            }
        });

        return testCaseDesc;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
