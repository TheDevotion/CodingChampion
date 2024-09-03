import React, { useEffect, useRef, useState, Suspense } from 'react'

import QuestionLabCom from './QuestionLabCom'
import CodeEditor from '../CodeEditor'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import Loader from '../../../Components/Loader/Loader'
import { Resizable } from 're-resizable'

function LabSolution() {
  const [questionSlipWidth, setQuestionSlipWidth] = useState('35%')
  const { subjectId, assignment, set, question } = useParams()
  const [language, setLanguage] = useState('')
  const [assignmentNo, setAssignmentNo] = useState('')
  const [setName, setSetName] = useState('')
  const [questionNo, setQuestionNo] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [solution, setSolution] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 768)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const labData = await getDoc(doc(db, 'labSubjects', subjectId))
        if (labData.exists()) {
          const data = labData.data()

          setLanguage(data.language)
          setAssignmentNo(data.assignments[assignment - 1].assignment)
          setSetName(data.assignments[assignment - 1].sets[set - 1].set)
          const qData =
            data.assignments[assignment - 1].sets[set - 1].questions[
              question - 1
            ]
          setQuestionNo(qData.questionNo)
          setQuestionText(qData.questionText)
          setSolution(
            qData.solution ??
              'A solution for this coding question is not available at the moment.\n\t Our team is actively working on it.\n\t\tPlease check back later'
          )
        } else {
          console.log('No question found')
        }
      } catch (error) {
        console.error('Error fetching data : ', error)
      }
      setLoading(false)
    }

    fetchData()
  }, [subjectId, assignment, set, question])

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  //format same as SlipSolution.jsx :->
  return (
    <div className="flex flex-col h-auto mx-auto px-2 py-2 min-h-screen bg-primary">
      <div className="flex flex-col md:flex-row w-full h-full">
        {isLargeScreen ? (
          <Resizable
            size={{ width: questionSlipWidth, height: 'auto' }}
            minWidth="20%"
            maxWidth="70%"
            enable={{ right: true }}
            onResizeStop={(e, direction, ref, d) => {
              setQuestionSlipWidth(ref.style.width)
            }}
          >
            <div className="h-full overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader />
                </div>
              ) : (
                <QuestionLabCom
                  assignmentNo={assignmentNo}
                  setName={setName}
                  questionNo={questionNo}
                  questionText={questionText}
                />
              )}
            </div>
          </Resizable>
        ) : (
          <div className="w-full md:w-[35%] md:mt-11">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader />
              </div>
            ) : (
              <QuestionLabCom
                assignmentNo={assignmentNo}
                setName={setName}
                questionNo={questionNo}
                questionTExt={questionText}
              />
            )}
          </div>
        )}
        {/* resizer line */}
        {isLargeScreen && <div className="w-1 cursor-col-resize bg-accent" />}

        {/* code editor div  */}

        <div
          className={`overflow-y-auto ${
            isLargeScreen
              ? `w-[${100 - parseInt(questionSlipWidth)}]%`
              : 'w-full h-screen mt-6 mb-2'
          } md:w-[80%] md:h-screen md:flex-grow`}
        >
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full">
                <Loader />
              </div>
            }
          >
            <CodeEditor language={language} solution={solution} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default LabSolution
