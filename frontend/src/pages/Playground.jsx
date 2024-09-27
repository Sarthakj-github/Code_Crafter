import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './Playground.css';

const languages = {
  c: 50,         // Judge0 ID for C
  cpp: 54,       // Judge0 ID for C++
  java: 62,      // Judge0 ID for Java
  javascript: 63, // Judge0 ID for JavaScript
  python: 71,    // Judge0 ID for Python
};

const Playground = forwardRef((props, ref) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [input, setInput] = useState(''); // State for custom input
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  // const [lastCode, setLastCode] = useState('');
  const [editorInstance, setEditorInstance] = useState(null);

  useImperativeHandle(ref, () => ({
    getEditorInstance: () => editorInstance,
    // Expose other methods or properties if needed
  }));

  useEffect(() => {
    // Set initial code based on language
    if (language === 'python') {
      setCode('# Start coding here...');
    } else {
      setCode('// Start coding here...');
    }
  }, [language]);

  useEffect(() => {
    // Retrieve the last submitted code when the component loads
    const fetchLastCode = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/last-code/${language}`);
        if (response.data && response.data.code) {
          setCode(response.data.code); // Optionally set the last code as the editor content
        }
      } catch (error) {
        console.error('Error fetching last code:', error);
      }
    };
    fetchLastCode();
  }, [language]);

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (e) => {
    setExecutionTime('');
    setMemoryUsage('');
    setOutput('');
    setError('');
    setLanguage(e.target.value);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const executeCode = async () => {
    try {
      // Reset previous error and output
      setOutput('');
      setError('');
      setExecutionTime('');
      setMemoryUsage('');

      // Prepare options for Judge0 API submission
      const submissionOptions = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: {
          base64_encoded: 'true',
          wait: 'false',
          fields: '*'
        },
        headers: {
          'x-rapidapi-key': '679b360ba5msh57f739e50584c80p16a040jsnfd6d186daf4e',
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          language_id: languages[language], // Use the correct Judge0 language ID
          source_code: btoa(code), // Base64 encode the source code
          stdin: btoa(input) // Base64 encode the custom input
        }
      };

      // Submit Code
      setIsExecuting(true);
      const submissionResponse = await axios.request(submissionOptions);
      const { token } = submissionResponse.data;

      // Poll for the result
      const resultOptions = {
        method: 'GET',
        url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        params: {
          base64_encoded: 'true',
          fields: '*'
        },
        headers: {
          'x-rapidapi-key': '679b360ba5msh57f739e50584c80p16a040jsnfd6d186daf4e',
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
      };

      let result;
      do {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 second
        result = await axios.request(resultOptions);
      } while (result.data.status.id < 3); // Continue polling until status is 'Accepted' or 'Rejected'

      // Check if there's an error
      if (result.data.status.id !== 3) { // Status not 'Accepted'
        const errorOutput = atob(result.data.stderr || result.data.compile_output || '');
        const decodedError = new TextDecoder('utf-8').decode(Uint8Array.from(errorOutput, char => char.charCodeAt(0)));
        setError(decodedError); // Set decoded error message
      } else {
        // No error, set output
        setOutput(atob(result.data.stdout)); // Base64 decode the output
      }
      
      setExecutionTime(result.data.time);
      setMemoryUsage(result.data.memory / 1024); // Convert KB to MB
      
      setIsExecuting(false);
      // Save the submitted code to the backend
      await axios.post('http://127.0.0.1:8000/api/save-code', { code, language });
      
    } catch (error) {
      console.error('Error executing code:', error);
      setError('Error executing the code');
    }
  };

 
  const formatCode = async () => {
    // if (editorInstance) {
    //   editorInstance.getAction('editor.action.formatDocument').run()
    //     .then(() => {
    //       console.log('Code formatted successfully');
    //     })
    //     .catch((err) => {
    //       console.error('Error formatting code:', err);
    //     });
    // } else {
    //   console.log('Editor instance not available');
    // }

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/format-code', {
          code,
          language,
      });
      setCode(response.data.formattedCode); // Update the code state with formatted code
    } catch (error) {
        console.error('Error formatting code:', error);
    }
  };

  return (
    <div className="playground">
      <h1>Playground</h1>
      <select onChange={handleLanguageChange} value={language}>
        {Object.keys(languages).map((key) => (
          <option key={key} value={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </option>
        ))}
      </select>
      <div className="editor-container">
        <Editor
          height="50vh"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            readOnly: false,
          }}
          onMount={setEditorInstance}
        />
      </div>
      <textarea
        className="input-box"
        placeholder="Enter sample input here..."
        value={input}
        onChange={handleInputChange}
      />
      <button className="run-code" onClick={executeCode} disabled={isExecuting}>{isExecuting?'Executing...':'Run Code'}</button>
      <button onClick={formatCode}>Format Code</button>
      <div className="output-section">
        <h2>Output</h2>
        {error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : (
          <pre>{output}</pre>
        )}
        {executionTime && <p>Execution Time: {executionTime} ms</p>}
        {memoryUsage && <p>Memory Usage: {memoryUsage.toFixed(2)} MB</p>}
        {/* <h2>Last Submitted Code</h2>
        <pre>{lastCode}</pre> */}
      </div>
    </div>
  );
});

export default Playground;