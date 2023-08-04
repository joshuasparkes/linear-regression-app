import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styling/problem.css";
import ProgressBar from "react-bootstrap/ProgressBar";
import "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // import your Firestore instance
import Spinner from "react-bootstrap/Spinner";

function Problem() {
  const sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    const newSessionId = new Date().getTime(); // or any other method you prefer to generate a unique ID
    sessionStorage.setItem("sessionId", newSessionId.toString());
  }

  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [aiResponse, setAIResponse] = useState("");
  const [showProblemStatement, setShowProblemStatement] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // New state to keep track of the selected item
  const [progress, setProgress] = useState(0); // New state for the progress
  const [isLoading, setIsLoading] = useState(false);
  const [oldAIResponse, setOldAIResponse] = useState([]); // New state to store old responses

  const saveToFirestore = async () => {
    try {
      const docRef = await addDoc(collection(db, "features"), {
        finalProblemStatement: problemStatement,
        sessionId: sessionStorage.getItem("sessionId"),
      });
      // Save the document ID to the session storage
      sessionStorage.setItem("documentId", docRef.id);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleSubmit = () => {
    setIsLoading(true); // start loading
    fetch("https://ml-linear-regression.onrender.com/openai-predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputText: inputText,
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      setIsLoading(false); // stop loading
      if (data.error) {
        setAIResponse({ error: data.error });
      } else {
        // When a new response comes, prepend it to the old responses and update the state
        const newResponses = data.predicted_items;
        setAIResponse([...newResponses, ...oldAIResponse]);
        setOldAIResponse([...newResponses, ...oldAIResponse]);
      }
      setShowProblemStatement(true);
    })
    .catch((error) => {
      setIsLoading(false); // stop loading
      console.error('Error fetching data:', error);
      setAIResponse({ error: 'Failed to get AI response.' });
      setShowProblemStatement(true);
    });
};

  const handleResponseItemClick = (item) => {
    setSelectedItem(item); // Update the selected item state with the clicked item's text
    setProblemStatement(item); // Automatically fill the Final Problem Statement box with the clicked item's text

    // Calculate progress as a percentage of the maximum allowed length
    // You can adjust maxChars depending on your requirements
    const maxChars = 100;
    const progress = (item.length / maxChars) * 100;
    setProgress(progress);
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleNext = async () => {
    await saveToFirestore(); // Save the 'finalProblemStatement' to Firestore
    navigate("/acceptanceCriteria"); // Navigate to the next page (replace '/next-page' with the desired route)
  };

  const handleReset = () => {
    window.location.reload(); // Refresh the page
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(); // Trigger the handleSubmit function when Enter key is pressed
    }
  };

  const handleProblemStatementChange = (e) => {
    const value = e.target.value;
    setProblemStatement(value);

    // Calculate progress as a percentage of the maximum allowed length
    // You can adjust maxChars depending on your requirements
    const maxChars = 100;
    const progress = (value.length / maxChars) * 100;
    setProgress(progress);
  };

  return (
    <div className="container">
      <h1>What Problem are you trying to solve?</h1>
      {/* Problem Description field */}
      <div className="input-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your problem here"
        />
        <button onClick={handleSubmit}>
          {isLoading ? (
            <Spinner
              animation="border"
              role="status"
              style={{ width: "1rem", height: "1rem" }} // Add this line
            >
              <span className="sr-only"></span>
            </Spinner>
          ) : (
            "Generate"
          )}
        </button>
      </div>
      {/* End of Problem Description field */}
      {/* Final Problem Statement field */}
      <div
        className={`input-container2 ${
          showProblemStatement ? "show-problem-statement" : ""
        }`}
      >
        <div className="ai-response">
          <h2>Select an option below</h2>
          {Array.isArray(aiResponse) ? (
            // If aiResponse is a list, map through the items and render each as a separate <div> box
            aiResponse.map((item, index) => {
              // Extract only the text part of each item by removing the number and period
              const itemText = item.replace(/^\d+\.\s*-*\s*/, ""); // Removes numbering and dashes from the start of the item
              return (
                <div
                  key={index}
                  className={`response-item ${
                    selectedItem === item ? "selected" : ""
                  }`}
                  onClick={() => handleResponseItemClick(item)}
                >
                  <span className="plus-icon">+</span> {itemText}
                </div>
              );
            })
          ) : (
            // If aiResponse is not a list, render it as a single <p>
            <p>{aiResponse}</p>
          )}
        </div>
        <label
          className="finalProblemStatementLabel"
          htmlFor="finalProblemStatement"
        >
          Select a Problem Statement, or add your own:
        </label>
        <input
          type="text"
          id="finalProblemStatement"
          value={problemStatement.replace(/^\d+\.\s*/, "").replace(/-/g, "")} // Remove the number, period, and dashes from the start of the statement
          onChange={handleProblemStatementChange}
          placeholder="Enter final Problem Statement"
          className="problem-statement-input" // Add a class to the input field
        />
        {/* Add the progress bar here, below the input field */}
        <label className="finalProblemStatementLabel" htmlFor="progressBar">
          Problem Statement strength
        </label>
        <ProgressBar
          now={progress}
          id="progressBar"
          label={`${Math.round(progress)}%`} // Show progress percentage as label
          // Optional: adds striped animation
          variant="success" // Optional: adds color
        />
      </div>
      {/* End of Final Problem Statement field */}
      <div className="button-container">
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
        <button className="reset" onClick={handleReset}>
          Reset
        </button>
        <button className="next-button" onClick={handleNext}>
          {problemStatement.trim() === "" ? "Skip" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Problem;
