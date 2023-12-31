import React, { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Spinner } from "react-bootstrap"; // Step 1: Import the Spinner
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

function WhatsNext({ userId, featureId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState({});
  const [showProblemStatement, setShowProblemStatement] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  // eslint-disable-next-line
  const [showGenerateTaskButton, setShowGenerateTaskButton] = useState(false);
  const [clickedItem, setClickedItem] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [isTaskLoading, setIsTaskLoading] = useState(false);

  const getDataFromFirestore = async (userId, documentId) => {
    const docRef = doc(db, "users", userId, "feature", documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("No such document!");
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);

    getDataFromFirestore(userId, featureId)
      .then((data) => {
        const inputText = `${data.acceptanceCriteria}, ${data.dataElements}, ${data.featureName}, ${data.finalProblemStatement}, ${data.hypotheses};, ${data.marketingMaterial}`;
        console.log("Sending data:", inputText);

        return fetch("https://ml-linear-regression.onrender.com/whats-next", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputText: inputText,
          }),
        });
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("Received data from backend:", data);
        // setShowGenerateTaskButton(true);
        setIsLoading(false);
        if (data && data.error) {
          setAIResponse({ error: data.error });
        } else {
          setAIResponse({ predicted_items: data.predicted_items });
          setShowProblemStatement(!showProblemStatement);
          setShowProblemStatement((prev) => !prev); // toggle it back immediately
        }
        setShowProblemStatement(true);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error fetching data:", error);
        setAIResponse({ error: "Please generate responses again" });
        setShowProblemStatement(true);
      });
  };

  const removeListNumbers = (str) => {
    return str.replace(/^[0-9]+\.?\s*/, "");
  };

  const handleResponseItemClick = (item) => {
    if (selectedItems === item) {
      setSelectedItems(null);
    } else {
      // Otherwise, select the clicked item
      setSelectedItems(item);
    }
    // Store the clicked item in the state
    setClickedItem(item);
  };

  const handleGenerateTaskList = () => {
    setIsTaskLoading(true);
    const inputText = clickedItem; // Use the clicked item as input, adjust if needed

    const fetchTaskList = (retryCount = 0) => {
      fetch("https://ml-linear-regression.onrender.com/task-list", {
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
          console.log("Received data from backend:", data);

          // Filter out empty strings and set the state
          const tasks = data.predicted_items.filter(
            (item) => item.trim() !== ""
          );
          setTaskList(tasks);
          setIsTaskLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching task list:", error);
          if (retryCount < 1) {
            // Here we set max retries to 1
            console.log("Retrying fetchTaskList...");
            fetchTaskList(retryCount + 1);
          } else {
            setIsTaskLoading(false);
          }
        });
    };

    fetchTaskList();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "10px",
        marginBottom: "20px",
        marginRight: "20px",
        marginLeft: '20px'
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "20px",
          width: "50%",
        }}
      >
        <button
          style={{ height: "50px", width: "100%" }}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <Spinner
              animation="border"
              role="status"
              style={{ width: "1rem", height: "1rem" }}
            />
          ) : null}
          {isLoading ? "" : "Generate Next Steps"}
        </button>

        {/* Show the Generate Task List button if showGenerateTaskButton is true */}
        {showGenerateTaskButton && (
          <button
            style={{
              backgroundColor: "red",
              height: "50px",
              width: "100%",
              marginBottom: "20px",
            }}
            onClick={handleGenerateTaskList}
          >
            Generate Task List
          </button>
        )}

{showProblemStatement && (
    <div
        style={{
            width: "100%",
            backgroundColor: "white",
            border: "1px darkgray solid",
            borderRadius: "12px",
            padding: "8px",
        }}
    >
        <h1>Next Steps</h1>
        {aiResponse.predicted_items &&
            aiResponse.predicted_items.map((item) => {
                const cleanedItem = removeListNumbers(item.trim());
                return (
                    <React.Fragment key={cleanedItem}>
                  {cleanedItem !== "" && (
                    <div
                      onClick={() => handleResponseItemClick(cleanedItem)}
                      style={{
                        background:
                          selectedItems === cleanedItem ? "lightblue" : "white",
                        color:
                          selectedItems === cleanedItem ? "black" : "black",

                        borderRadius: "4px",
                        border: "1px gray solid",
                        padding: "10px",
                        margin: "10px 0",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: 'center',
                        gap: '10px',
                        justifyContent: "space-between"
                      }}
                    >
                      {cleanedItem}
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        size={"m"}
                        className="custom-icon"
                      />
                    </div>
                  )}
                  {clickedItem === cleanedItem && (
                    <button
                      style={{
                        height: "50px",
                        width: "100%",
                        marginBottom: "20px",
                      }}
                      onClick={handleGenerateTaskList}
                    >
                      {isTaskLoading ? (
                        <Spinner
                          animation="border"
                          role="status"
                          style={{ width: "1rem", height: "1rem" }}
                        />
                      ) : null}
                      {isTaskLoading ? "" : "Generate Task List"}
                    </button>
                  )}
                </React.Fragment>
                );
            })}
    </div>
)}
      </div>

      {taskList.length > 0 && ( // <--- Use this conditional to control the visibility
        <div
          // Styles for the right part
          style={{
            width: "50%",
            backgroundColor: "white",
            border: "1px darkgray solid",
            borderRadius: "12px",
            padding: "8px",
          }}
        >
          <h1>Task List</h1>
          {/* Display tasks from the taskList */}
          {/* Display tasks from the taskList */}
          {taskList.map((task, index) => (
            <div
              key={index}
              style={{
                border: "1px solid darkgray",
                borderRadius: "4px",
                padding: "10px",
                marginBottom: "8px",
              }}
            >
              {task}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WhatsNext;
