import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/App.css";
import PMAILogo from "./images/PMAILogo.png";
import Screenshot1 from "./images/Screenshot1.png";
// import Screenshot2 from "./images/Screenshot2.png";
import { auth } from "../src/firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import PriorityModal from "./components/priorityModal";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false); // Add state for the modal
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        setLoggedIn(true);
        sessionStorage.setItem("uid", user.uid);
        console.log("User is logged in:", user.uid);
      } else {
        setLoggedIn(false);
        sessionStorage.removeItem("uid");
        console.log("User is logged out or anonymous");
      }
    });
    // const timer = setTimeout(() => {
    //   setShowPriorityModal(true);
    // }, 100000);
    // return () => clearTimeout(timer);
  }, []);

  const handlePrioritySelect = async (priority) => {
    console.log("Selected priority:", priority);
  };

  const handleAnonSignIn = async () => {
    try {
      await signInAnonymously(auth);
      console.log("User signed in Anonymously");
      navigate("/problem");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>
        <img src={PMAILogo} alt="PMAI Logo" className="spinning-logo" />
        <div className="login-btn-container">
          {loggedIn ? (
            <Link to="/listOfFeatures" className="dashboard-btn">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="create-account-btn">
                Log In
              </Link>
              <Link to="/signUp" className="sign-up-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="container1">
        <h1 className="title">Product Manager AI</h1>
        <h2 className="subtitle">
          Explain in your own words what problem you’re looking to solve, and
          for who… and we’ll take care of the rest.
        </h2>
        <div className="btn-container">
          <button onClick={handleAnonSignIn} className="btn">
            Create a Feature - it's free
          </button>
        </div>
        {/* <ul
          style={{
            border: "1px darkgray solid",
            borderRadius: "12px",
            paddingRight: "15px",
            paddingTop: "10px",
            paddingBottom: "10px",
            fontSize: "14px",
          }}
        >
          <li>Well articulated the problem statement</li>
          <li>Clear and concise acceptance criteria</li>
          <li>
            Structured break down of the tasks ready for the delivery team
          </li>
          <li>Defined target customer and ideal marketing material</li>
          <li>
            Defined key metrics and solution hypothesis to track whether the
            feature has failed/succeeded
          </li>
        </ul> */}
        {/* <h2 className="subtitle">
          In 2 minutes you’ll have a feature ready to share with stakeholders
          and get the delivery work started!
        </h2> */}

        {/* <FontAwesomeIcon
          className="arrow"
          icon={faAngleDown}
          size="1x"
          color="black"
        /> */}
      </div>
      <div className="container1b">
        <video
          src="/ScreenRecording1.mp4"
          autoPlay
          className="lpVid"
          loop
          muted
          playsInline
          style={{
            width: "75%",
            height: "auto",
            borderWidth: "1px",
            borderColor: "gray",
            borderStyle: "solid",
            borderRadius: "10px",
          }}
          type="video/mp4"
          onError={(e) => {
            console.error("Video error:", e);
          }}
        />
      </div>
      <div className="container2">
        <div className="problem-section">
          <div className="h3AndP">
            {/* <h2 className="header">Made for Product Managers</h2> */}
            <h2 className="section-header">PM Captain</h2>
            <h3>
              Let AI feature builder generate your features, only takes 2
              minutes!
            </h3>
            <ul>
              <li>
                <strong>Dev ready</strong>
                <div className="bubble-body">
                  The only text you have to type is the problem statement, AI
                  then generates the rest; acceptance criteria and breaks down
                  tasks so you don’t have to!
                </div>
              </li>
              <li>
                <strong>Market ready</strong>
                <div className="bubble-body">
                  PM Captain helps define your target market, list competitors,
                  and generates marketing material ready for feature release.
                </div>
              </li>
              <li>
                <strong>Release ready</strong>
                <div className="bubble-body">
                  PM Captain suggests metrics to track and defines a solution
                  hypothesis for each feature, giving you the ammo to unbiasedly
                  make the decision to pivot or persevere.
                </div>
              </li>
            </ul>
            <button onClick={handleAnonSignIn} className="section-btn">
              Create a Feature
            </button>
          </div>
          <img
            width={"auto"}
            height={"250px"}
            className={"lpimage"}
            style={{
              borderWidth: "1px",
              borderColor: "gray",
              borderStyle: "solid",
              borderRadius: "10px",
            }}
            src="https://www.softkraft.co/static/cee02d36ebf9d0d4af095be15317b27b/c74de/steps-process.webp"
            alt="Softkraft process"
          />
        </div>

        <div className="problem-section2">
          <div className="h3AndP">
            <h2 className="section-header">PM Assistant</h2>
            <p className="coming-soon">(Coming soon)</p>
            <h3>
              So many decisions, stakeholders, tasks… let AI suggest your next
              best actions throughout the feature lifecycle.
            </h3>
            <ul>
              <li>
                <strong>Dev ready</strong>
                <div className="bubble-body">
                  Share tasks with dev team, share acceptance criteria with
                  UX/UI designer… PM Assistant helps you navigate through your
                  tasks as a PM, so you don’t have to.
                </div>
              </li>
              <li>
                <strong>Market ready</strong>
                <div className="bubble-body">
                  Run a competitor analysis, generate a LinkedIn post about your
                  next feature release… PM Assistant helps you navigate through
                  your tasks as a PM, so you don’t have to.
                </div>
              </li>
              <li>
                <strong>Release ready</strong>
                <div className="bubble-body">
                  Add metrics to track your feature, send metrics request to
                  data team, enable metrics in reporting tool… PM Assistant
                  helps you navigate through your tasks as a PM, so you don’t
                  have to.
                </div>
              </li>
            </ul>
            <button onClick={handleAnonSignIn} className="section-btn">
              Create a Feature
            </button>
          </div>
          <img
            width={"auto"}
            height={"250px"}
            className={"lpimage"}
            style={{
              borderWidth: "1px",
              borderColor: "gray",
              borderStyle: "solid",
              borderRadius: "10px",
            }}
            src="https://www.explorium.ai/wp-content/uploads/2019/12/Decision-Trees-2.png"
            alt="Softkraft process"
          />
        </div>

        <div className="problem-section3">
          <div className="h3AndP">
            <h2 className="section-header">PM Co-Pilot</h2>
            <p className="coming-soon">(Coming soon)</p>
            <h3>Focus on building outcome driven features</h3>
            <ul>
              <li>
                <strong>Dev ready</strong>
                <div className="bubble-body">
                  Start with feature outcomes in mind, ensuring you have metrics
                  and hypotheses in order to align with stakeholders.
                </div>
              </li>
              <li>
                <strong>Market ready</strong>
                <div className="bubble-body">
                  Plan your marketing material based on outcomes.
                </div>
              </li>
              <li>
                <strong>Release ready</strong>
                <div className="bubble-body">
                  Keep your metrics handy ready to track whether to pivot or
                  persevere with each feature.
                </div>
              </li>
            </ul>
            <button onClick={handleAnonSignIn} className="section-btn">
              Create a Feature
            </button>
          </div>
          <img
            width={"auto"}
            height={"250px"}
            className={"lpimage"}
            style={{
              borderWidth: "1px",
              borderColor: "gray",
              borderStyle: "solid",
              borderRadius: "10px",
            }}
            src={Screenshot1}
            alt="PMAI Logo"
          />
        </div>

        {/* <div className="problem-section4">
          <div className="h3AndP">
            <h3>Efficient Hypothesis Tracking</h3>
            <p>
              As product managers, we sometimes struggle in defining our
              hypothesis for a feature/product launch, and with that, forget to
              really define the metrics to track in order to validate the
              success / failure of a feature/product. There’s no shame in this,
              we’re coming into the age of product efficiencies, master your
              pivot / persevere techniques as a product manager. We help you
              define your hypothesis and set metrics that you’ll want to track…
              and even better yet, connect our tool with your reporting tools so
              we automatically import the key metrics into each feature. Oh and
              don’t worry, if you’re not tracking that metrics, we automatically
              add a task in the feature to enable the tracking of that metric…
              doesn’t get better than that!
            </p>
            <button onClick={handleAnonSignIn} className="section-btn">
              Create a Feature
            </button>
          </div>
          <img
            src={Screenshot2}
            alt="PMAI Logo"
            width={"auto"}
            className={"lpimage"}
            height={"250px"}
            style={{
              borderWidth: "1px",
              borderColor: "gray",
              borderStyle: "solid",
              borderRadius: "10px",
            }}
          />
        </div> */}
      </div>

      {/* <div className="container2">
        <h2 className="header">Key features</h2>
        <div className="problem-section">
          <div>
            <h3>Feature 1</h3>
            <p>
              Lorum ipsum text filler Lorum ipsum text filler Lorum ipsum text
              filler Lorum ipsum text filler Lorum ipsum text filler Lorum ipsum
              text filler Lorum ipsum text filler{" "}
            </p>
          </div>
          <img src={PMAILogo} alt="PMAI Logo" className="problem-image" />
        </div>

        <div className="problem-section">
          <img src={PMAILogo} alt="PMAI Logo" className="problem-image" />
          <div>
            <h3>Feature 1</h3>
            <p>
              Lorum ipsum text filler Lorum ipsum text filler Lorum ipsum text
              filler Lorum ipsum text filler Lorum ipsum text filler Lorum ipsum
              text filler Lorum ipsum text filler{" "}
            </p>
          </div>
        </div>

        <div className="problem-section">
          <div>
            <h3>Feature 1</h3>
            <p>
              Lorum ipsum text filler Lorum ipsum text filler Lorum ipsum text
              filler Lorum ipsum text filler Lorum ipsum text filler Lorum ipsum
              text filler Lorum ipsum text filler{" "}
            </p>
          </div>
          <img src={PMAILogo} alt="PMAI Logo" className="problem-image" />
        </div> */}
      {/* </div> */}
      <div className="footer">
        <p>© 2023 Product Manager AI. All rights reserved.</p>
      </div>
      <PriorityModal
        isOpen={showPriorityModal}
        onClose={() => setShowPriorityModal(false)}
        onPrioritySelect={handlePrioritySelect}
      />
    </div>
  );
}

export default App;
