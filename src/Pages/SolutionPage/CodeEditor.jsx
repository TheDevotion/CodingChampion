import Editor from '@monaco-editor/react'
import Groq from 'groq-sdk'
import FormattedText from './FormattedText'
import Modal from './Modal'
import { useState, useCallback, useRef, useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { toast } from 'react-toastify'
import { Resizable } from 're-resizable'

const apiKeys = [
  import.meta.env.VITE_GROQ_API_KEY_1,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3,
]

const models = [
  import.meta.env.VITE_MODAL1,
  import.meta.env.VITE_MODAL2,
  import.meta.env.VITE_MODAL3,
  import.meta.env.VITE_MODAL4,
  import.meta.env.VITE_MODAL5,
  import.meta.env.VITE_MODAL6,
  import.meta.env.VITE_MODAL7,
  import.meta.env.VITE_MODAL8,
  import.meta.env.VITE_MODAL9,
]

function CodeEditor({ language, solution }) {
  const [result, setResult] = useState('')
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false)
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false)
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0)
  const [currentModelIndex, setCurrentModelIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editorOptions, setEditorOptions] = useState({})
  const [isResizable, setIsResizable] = useState(window.innerWidth > 768)
  const [editorWidth, setEditorWidth] = useState('100%')
  const editorRef = useRef(null)

  // State for user query and its response
  const [userQuery, setUserQuery] = useState('')
  const [queryResponse, setQueryResponse] = useState('')

  const fetchSolution = async () => {
    const apiKey = apiKeys[currentKeyIndex]
    const model = models[currentModelIndex]

    if (!apiKey) {
      console.error('API key is not defined')
      return
    }

    const groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    })

    setLoading(true)

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `${solution}\n\nExplain the given code in simple words. Also explain how each function works in brief. Give sample input and output for the program. Please provide a well-formatted response using Markdown syntax for headings, lists, and code blocks where appropriate.`,
          },
        ],
        model,
      })

      setResult(chatCompletion.choices[0]?.message?.content || '')
      setIsExplanationModalOpen(true)
    } catch (error) {
      console.error('Error fetching solution:', error)
      setResult('An error occurred while fetching the solution.')
    } finally {
      setCurrentKeyIndex((prevIndex) => (prevIndex + 1) % apiKeys.length)
      setCurrentModelIndex(Math.floor(Math.random() * models.length))
      setLoading(false)
    }
  }

  const handleQuerySubmit = async () => {
    if (!userQuery.trim()) return

    const apiKey = apiKeys[currentKeyIndex]
    const model = models[currentModelIndex]

    if (!apiKey) {
      console.error('API key is not defined')
      return
    }

    const groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    })

    setLoading(true)

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `Given this code:\n\n${solution}\n\nUser's question: ${userQuery}\n\nPlease provide a well-formatted response using Markdown syntax for headings, lists, and code blocks where appropriate.`,
          },
        ],
        model,
      })

      setQueryResponse(chatCompletion.choices[0]?.message?.content || '')
    } catch (error) {
      console.error('Error fetching query response:', error)
      setQueryResponse('An error occurred while fetching the response.')
    } finally {
      setCurrentKeyIndex((prevIndex) => (prevIndex + 1) % apiKeys.length)
      setCurrentModelIndex(Math.floor(Math.random() * models.length))
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuerySubmit()
    }
  }

  const copyToClipboard = useCallback(() => {
    const editorValue = editorRef.current?.getValue()

    if (editorValue) {
      window.navigator.clipboard
        .writeText(editorValue)
        .then(() => {
          toast.success('Copied successfully!', {
            position: 'bottom-right',
            autoClose: 3000,
          })
        })
        .catch((err) => {
          console.error('Failed to copy: ', err)
        })
    }
  }, [])

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor

    const editorElement = editor.getDomNode()
    if (editorElement) {
      editorElement.addEventListener('wheel', handleEditorWheel, {
        passive: false,
      })
    }
  }

  const handleEditorWheel = (e) => {
    const editor = editorRef.current
    if (!editor) return

    const editorContent = editor.getModel()
    const lineCount = editorContent.getLineCount()
    const visibleRange = editor.getVisibleRanges()[0]

    const isAtTop = visibleRange.startLineNumber === 1
    const isAtBottom = visibleRange.endLineNumber === lineCount

    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
      return
    }

    e.preventDefault()
    const scrollTop = editor.getScrollTop()
    editor.setScrollTop(scrollTop + e.deltaY)
  }

  useEffect(() => {
    const updateEditorOptions = () => {
      const isMobile = window.innerWidth < 768
      setIsResizable(!isMobile)
      setEditorWidth(isMobile ? '100%' : editorWidth)

      setEditorOptions({
        minimap: { enabled: !isMobile },
        scrollBeyondLastLine: false,
        fontSize: isMobile ? 12 : 15,
        wordWrap: 'on',
        lineNumbers: isMobile ? 'off' : 'on',
        tabSize: 2,
        automaticLayout: true,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          handleMouseWheel: true,
          alwaysConsumeMouseWheel: false,
        },
      })
    }

    updateEditorOptions()
    window.addEventListener('resize', updateEditorOptions)

    return () => {
      window.removeEventListener('resize', updateEditorOptions)
      const editorElement = editorRef.current?.getDomNode()
      if (editorElement) {
        editorElement.removeEventListener('wheel', handleEditorWheel)
      }
    }
  }, [editorWidth])

  const editorComponent = (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderStartStartRadius: '10px',
        borderEndStartRadius: '10px',
        overflow: 'hidden',
        margin: '0 5px',
        zIndex: '1',
        boxSizing: 'border-box',
      }}
    >
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={solution}
        onMount={handleEditorDidMount}
        options={editorOptions}
      />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between mb-1">
        <button
          onClick={fetchSolution}
          disabled={loading}
          className={`px-4 py-2 rounded text-white font-semibold ${
            loading
              ? 'bg-primary2 cursor-not-allowed'
              : 'bg-black hover:bg-accent'
          }`}
        >
          {loading ? 'Wait Magic Is Happening...' : 'Explain Me'}
        </button>
        {/* Ask Your Doubt to AI button */}
        <button
          onClick={() => setIsQueryModalOpen(true)}
          className="px-4 py-2 rounded bg-black text-white font-semibold hover:bg-accent"
        >
          Ask Your Doubt to Myra
        </button>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 rounded bg-black text-white font-semibold hover:bg-accent"
        >
          Copy
        </button>
      </div>

      <Resizable
        enable={{ right: isResizable }}
        defaultSize={{
          width: '100%',
          height: '100%',
        }}
        size={{ width: editorWidth, height: '100%' }}
        onResizeStop={(e, direction, ref, d) => {
          setEditorWidth((prevWidth) => {
            const newWidth = parseInt(prevWidth) + d.width
            return `${newWidth}px`
          })
        }}
      >
        {editorComponent}
      </Resizable>

      {isExplanationModalOpen && (
        <Modal
          isOpen={isExplanationModalOpen}
          title="Myra ---"
          onClose={() => setIsExplanationModalOpen(false)}
        >
          <div className="mt-8 p-4 border rounded bg-white shadow-md overflow-auto">
            <FormattedText text={result} />
          </div>
        </Modal>
      )}
      {isQueryModalOpen && (
        <Modal
          isOpen={isQueryModalOpen}
          title="Ask Your Doubt to AI"
          onClose={() => {
            setIsQueryModalOpen(false)
            setUserQuery('')
            setQueryResponse('')
          }}
        >
          <div className="flex flex-col">
            <textarea
              className="p-2 rounded border mb-4"
              placeholder="Type your query here..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={4}
            />
            <button
              onClick={handleQuerySubmit}
              disabled={loading}
              className={`px-4 py-2 rounded text-white font-semibold ${
                loading
                  ? 'bg-primary2 cursor-not-allowed'
                  : 'bg-black hover:bg-accent'
              }`}
            >
              {loading ? 'Fetching Response...' : 'Submit Query'}
            </button>

            {queryResponse && (
              <div className="mt-4 p-4 border rounded bg-white shadow-md overflow-auto max-h-96">
                <h3 className="font-semibold mb-2">Myra : </h3>
                <FormattedText text={queryResponse} />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default CodeEditor
