import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../src/Components/Navbar/Navbar";
import SideBar from "../../src/Components/SideBar/SideBar";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../src/config/firebase";
import "./SlipList.css";
import { uploadData } from "./SlipData";

const SlipList = () => {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [filterMarks, setFilterMarks] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchSubject = async () => {
      const subjectDoc = await getDoc(doc(db, "slipSubjects", subjectId));
      if (subjectDoc.exists()) {
        setSubject(subjectDoc.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchSubject();
  }, [subjectId]);

  if (!subject) {
    return <div>Loading...</div>;
  }

  const filteredAndSortedSlips = subject.slips
    .map((slip) => ({
      ...slip,
      questions: slip.questions.filter(
        (q) => filterMarks === "" || q.marks.toString() === filterMarks
      ),
    }))
    .filter((slip) => slip.questions.length > 0)
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.slipId - b.slipId;
      } else {
        return b.slipId - a.slipId;
      }
    });

  return (
    <div className="slip-list-container">
      <Navbar />
      <div className="slip-list-main-section">
        <SideBar />
        <div className="content-container">
          <h1>{subject.subject} Slips</h1>
          <div className="filter-sort-controls">
            <select
              value={filterMarks}
              onChange={(e) => setFilterMarks(e.target.value)}
              className="filter-select"
            >
              <option value="">All Marks</option>
              <option value="15">15 Marks</option>
              <option value="25">25 Marks</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="sort-button"
            >
              Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
            </button>
          </div>
          {filteredAndSortedSlips.map((slip, index) => (
            <div key={index} className="slip-card">
              <h2>Slip No: {slip.slipId}</h2>
              <ul className="question-list">
                {slip.questions.map((question, qIndex) => (
                  <li key={qIndex} className="question-item">
                    <Link
                      to={`/${subjectId}/${slip.slipId}/${question.questionId}`}
                      className="question-link"
                    >
                      <div
                        className="question-box"
                        dangerouslySetInnerHTML={{
                          __html: question.text,
                        }}
                      />
                      <span className="marks-badge">
                        {question.marks} Marks
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlipList;
