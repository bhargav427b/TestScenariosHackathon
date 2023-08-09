import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import { insertTestScenarios } from "./api/basicCompletionTest";

export default function Home() {
  const [storyIdInput, setStoryIdInput] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [selectedOption, setSelectedOption] = useState("chatGPT");
  const [testScenarios, setTestScenarios] = useState([]);

  async function onSubmit(event) {
    event.preventDefault();
    if (selectedOption === "chatGPT") {
      // Call ChatGPT API
      // insertTestScenarios(storyIdInput);
    } else if (selectedOption === "bard") {
      // Call Bard API
      // insertBardScenarios(storyIdInput);
    }
    if (storyIdInput && apiKeyInput) {
      let fetchedTestScenarios = await insertTestScenarios(storyIdInput, apiKeyInput);
      if (fetchedTestScenarios) {
        fetchedTestScenarios = fetchedTestScenarios.filter(item => {
          let scenario = item.toLocaleLowerCase();
          return scenario.indexOf("cases") !== 0 && scenario !== "<ul>" && scenario !== "</ul>";
        });
        setTestScenarios(fetchedTestScenarios);
        console.log(fetchedTestScenarios);
      }
    }
  }

  return (
    <div>
      <Head>
        <title>Rally Test Scenarios Generator</title>
      </Head>

      <main className={styles.main}>
        <h3>Rally Test Scenarios Generator</h3>
        <form onSubmit={onSubmit}>
        <label className={styles.label}>Rally Story Id:</label>
            <input
              type="text"
              name="story_id"
              placeholder="Enter Story Id"
              value={storyIdInput}
              onChange={(e) => setStoryIdInput(e.target.value)}
              autoComplete="off"
            />
            <label className={styles.label}>Rally API Key:</label>
            <input
              type="text"
              name="api_key"
              placeholder="Enter API Key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              autoComplete="off"
            />
            <a href="https://knowledge.broadcom.com/external/article?articleId=10814" target="_blank" className={styles.link}>Don't know where to get API key ?</a>
          <div className={styles.choice}>
            <label>
                <input
                  type="radio"
                  name="apiOption"
                  value="chatGPT"
                  checked={selectedOption === "chatGPT"}
                  onChange={() => setSelectedOption("chatGPT")}
                />
                ChatGPT
            </label>
            <label>
              <input
                type="radio"
                name="apiOption"
                value="bard"
                checked={selectedOption === "bard"}
                onChange={() => setSelectedOption("bard")}
              />
              Bard
            </label>
          </div>
          <input
              type="submit"
              value="Generate Test Scenarios"
            />
        </form>

      {testScenarios.length > 0 ? (
        <fieldset className={styles.scenarios}>
          <legend><b>Test Scenarios inserted in Rally are: </b></legend>
          <ul>
            {testScenarios.map((testScenario, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: testScenario }} />
            ))}
          </ul>
        </fieldset>
      ) : (
        <p></p>
      )}
      </main>
    </div>
  );
}