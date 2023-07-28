import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styling/problem.css';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';  // import your Firestore instance
import Spinner from 'react-bootstrap/Spinner';

function AcceptanceCriteria() {
  const navigate = useNavigate();
  const [problemStatement, setProblemStatement] = useState('');
  const [aiResponse, setAIResponse] = useState('');
  const [showProblemStatement, setShowProblemStatement] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getProblemStatementFromSession = async () => {
    const q = query(collection(db, "features"), where("sessionId", "==", sessionStorage.getItem('sessionId')));
    const querySnapshot = await getDocs(q);
    let problemStatement = '';
    querySnapshot.forEach((doc) => {
      problemStatement = doc.data().finalProblemStatement;
    });
    return problemStatement;
  }

  useEffect(() => {
    getProblemStatementFromSession().then(problemStatement => setProblemStatement(problemStatement));
  }, []);

  const handleSubmit = () => {
    setIsLoading(true); // start loading

    fetch('https://ml-linear-regression.onrender.com/openai-solution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputText: problemStatement, // use problemStatement instead of inputText
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false); // stop loading

        if (data.error) {
          setAIResponse({ error: data.error });
        } else {
          setAIResponse(data.predicted_items);
        }
        setShowProblemStatement(true);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setAIResponse({ error: 'Failed to get AI response.' });
        setShowProblemStatement(true);
      });
  };

  const handleResponseItemClick = (item) => {
    // If the item is already selected, remove it from the selected items
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(selectedItem => selectedItem !== item));
    } 
    // If the item is not selected, add it to the selected items
    else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleNext = async () => {
    const documentId = sessionStorage.getItem('documentId');
    const docRef = doc(db, "features", documentId);
  
    // Update the existing document with the new acceptanceCriteria field
    console.log(selectedItems); // Debugging line
    await setDoc(docRef, {
      acceptanceCriteria: selectedItems
    }, { merge: true });
    navigate('/technicalRequirements');
  };


  return (
    <div className="container">
      <h1>Generate Acceptance Criteria</h1>
      {/* <p className='problem-statement'>{problemStatement}</p> */}
      {/* <h2>Here are some Acceptance Criteria for your Problem Statement</h2> */}
      {/* Problem Description field */}
      <div className="input-container">
      <button onClick={handleSubmit}>
    {isLoading ? (
      <Spinner 
      animation="border" 
      role="status" 
      style={{ width: '1rem', height: '1rem' }} // Add this line
    >
      <span className="sr-only"></span>
    </Spinner>
    ) : (
      'Generate'
    )}
  </button>
      </div>
      <div className={`input-container2 ${showProblemStatement ? 'show-problem-statement' : ''}`}>
        <div className="ai-response">
          <h2>Our AI suggestions</h2>
          {Array.isArray(aiResponse) ? (
            // If aiResponse is a list, map through the items and render each as a separate <div> box
            aiResponse.map((item, index) => {
              // Extract only the text part of each item by removing the number and period
              const itemText = item.replace(/^\d+\.\s*/, '').replace(/-/g, ''); // Removes numbering from the start of the item and all dashes
              return (
                <div
                  key={index}
                  className={`response-item ${selectedItems.includes(item) ? 'selected' : ''}`}
                  onClick={() => handleResponseItemClick(item)}
                >
                  <span className="plus-icon">+</span> {itemText}
                </div>
              );
            })
          ) : (
            // If aiResponse is not a list, render it as a single <p>
            <p>{aiResponse.error}</p>
            )}
        </div>
      </div>
      <div className="button-container">
        <button className="back-button" onClick={handleBack}>Back</button>
        <button className="next-button" onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}

export default AcceptanceCriteria;
