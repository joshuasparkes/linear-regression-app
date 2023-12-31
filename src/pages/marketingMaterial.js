import React, { useState, useEffect } from "react"; // Import useEffect
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styling/problem.css";
import {
  // collection,
  doc,
  // query,
  getDoc,
  // where,
  // getDocs,
  setDoc,
} from "@firebase/firestore";
import { db, auth } from "../firebase"; // import your Firestore instance
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinusCircle, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import ProgressBar from "react-bootstrap/ProgressBar";

function MarketingMaterial() {
  const navigate = useNavigate();
  const [aiResponse, setAIResponse] = useState("");
  const [showProblemStatement, setShowProblemStatement] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextButtonLabel, setNextButtonLabel] = useState("Skip"); // New state
  const [loadingButton, setLoadingButton] = useState(null);

  const getDataFromSession = async (field) => {
    const documentId = sessionStorage.getItem("documentId");
    const userId = auth.currentUser.uid; // Assuming you have auth imported and configured correctly
    const docRef = doc(db, "users", userId, "feature", documentId);

    try {
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data()[field];
        return data;
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  const postToApi = (inputText, endpoint, retry = true) => {
    return fetch(`https://ml-linear-regression.onrender.com/${endpoint}`, {
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
        if (data.error) {
          setAIResponse({ error: data.error });
        } else {
          setAIResponse(data.predicted_items);
        }
        setShowProblemStatement(true);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        if (retry) {
          console.log("Retrying...");
          return postToApi(inputText, false);
        } else {
          setAIResponse({ error: "Please generate responses again" });
          setShowProblemStatement(true);
        }
      });
  };

  const handleSubmit = (endpoint) => {
    setIsLoading(true);
    setLoadingButton(endpoint); // Set the loading button

    Promise.all([
      getDataFromSession("finalProblemStatement"),
      getDataFromSession("targetCustomer"),
      getDataFromSession("hypotheses"),
    ]).then(([finalProblemStatement, targetCustomer, hypotheses]) => {
      const inputText = `${finalProblemStatement}, ${targetCustomer}, ${hypotheses}`;
      console.log("Sending data:", inputText);

      postToApi(inputText, endpoint).finally(() => {
        setIsLoading(false);
        setLoadingButton(null); // Reset the loading button after request is complete
      });
    });
  };

  const handleResponseItemClick = (item) => {
    // If the item is already selected, remove it from the selected items
    if (selectedItems.includes(item)) {
      setSelectedItems(
        selectedItems.filter((selectedItem) => selectedItem !== item)
      );
    }
    // If the item is not selected, add it to the selected items
    else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  useEffect(() => {
    if (selectedItems.length > 0) {
      setNextButtonLabel("Next");
    } else {
      setNextButtonLabel("Skip");
    }
  }, [selectedItems]); // Add selectedItems to the dependency array

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleNext = async () => {
    const documentId = sessionStorage.getItem("documentId");
    const userId = auth.currentUser.uid; // Use auth to get current user's ID
    const docRef = doc(db, "users", userId, "feature", documentId);

    try {
      // Update the existing document with the marketingMaterial field
      await setDoc(
        docRef,
        {
          marketingMaterial: selectedItems,
        },
        { merge: true }
      );
      console.log("Successfully updated document:", documentId);
      navigate("/code");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <div className="container">
      <ProgressBar
        style={{
          position: "fixed",
          left: "50%",
          top: "30px",
          width: "80%",
          transform: "translateX(-50%)",
          zIndex: 1000,
        }}
        now={87.5}
        variant="info"
        label="7/9" // Adding the label here
      />
      <h1>Generate Marketing Material for this Feature</h1>
      <div className="input-container-marketing">
        <button onClick={() => handleSubmit("social-post")}>
          {isLoading && loadingButton === "social-post" ? (
            <Spinner
              animation="border"
              role="status"
              style={{ width: "1rem", height: "1rem" }}
            >
              <span className="sr-only"></span>
            </Spinner>
          ) : aiResponse && loadingButton === null ? (
            "Generate Post Again"
          ) : (
            "Social media post"
          )}
        </button>
        <button onClick={() => handleSubmit("blog-post")}>
          {isLoading && loadingButton === "blog-post" ? (
            <Spinner
              animation="border"
              role="status"
              style={{ width: "1rem", height: "1rem" }}
            >
              <span className="sr-only"></span>
            </Spinner>
          ) : aiResponse && loadingButton === null ? (
            "Generate Blog Again"
          ) : (
            "Blog post"
          )}
        </button>
        <button onClick={() => handleSubmit("email-post")}>
          {isLoading && loadingButton === "email-post" ? (
            <Spinner
              animation="border"
              role="status"
              style={{ width: "1rem", height: "1rem" }}
            >
              <span className="sr-only"></span>
            </Spinner>
          ) : aiResponse && loadingButton === null ? (
            "Generate Email Again"
          ) : (
            "Email campaign"
          )}
        </button>
      </div>
      <div
        className={`input-container2 ${
          showProblemStatement ? "show-problem-statement" : ""
        }`}
      >
        <div className="ai-response">
          {Array.isArray(aiResponse) ? (
            // If aiResponse is a list, map through the items and render each as a separate <div> box
            aiResponse.map((item, index) => {
              // Extract only the text part of each item by removing the number and period
              const itemText = item.replace(/^\d+\.\s*/, "").replace(/-/g, ""); // Removes numbering from the start of the item and all dashes
              return (
                <div
                  key={index}
                  className={`response-item ${
                    selectedItems.includes(item) ? "selected" : ""
                  }`}
                  onClick={() => handleResponseItemClick(item)}
                >
                  {itemText}
                  <FontAwesomeIcon icon={faPlusCircle} />
                </div>
              );
            })
          ) : (
            // If aiResponse is not a list, render it as a single <p>
            <p>{aiResponse.error}</p>
          )}
        </div>

        {/* New block for displaying selected items */}
        <div className="selected-items">
          <h2>Selected materials</h2>
          {selectedItems.map((item, index) => {
            const itemText = item.replace(/^\d+\.\s*/, "").replace(/-/g, ""); // Removes numbering from the start of the item and all dashes
            return (
              <div
                key={index}
                className="selected-item"
                onClick={() => handleResponseItemClick(item)} // Add onClick event here
              >
                {itemText}
                <FontAwesomeIcon icon={faMinusCircle} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="button-container">
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
        <button className="next-button" onClick={handleNext}>
          {nextButtonLabel}
        </button>{" "}
      </div>
    </div>
  );
}

export default MarketingMaterial;
