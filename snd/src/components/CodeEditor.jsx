import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { ChevronUp, ChevronDown } from "lucide-react";

const LANGUAGE_HELLO_WORLD = {
    javascript: `function sayHello() {
    console.log("Hello, World!");
}

sayHello();`,
    typescript: `function sayHello(): void {
    console.log("Hello, World!");
}

sayHello();`,
    python: `def say_hello():
    print("Hello, World!")

say_hello()`,
    cpp: `#include <iostream>
using namespace std;

void sayHello() {
    cout << "Hello, World!" << endl;
}

int main() {
    sayHello();
    return 0;
}`,
    java: `public class HelloWorld {
    public static void sayHello() {
        System.out.println("Hello, World!");
    }

    public static void main(String[] args) {
        sayHello();
    }
}`,
    go: `package main
import "fmt"

func sayHello() {
    fmt.Println("Hello, World!")
}

func main() {
    sayHello()
}`,
    rust: `fn say_hello() {
    println!("Hello, World!");
}

fn main() {
    say_hello();
}`,
    ruby: `def say_hello
    puts "Hello, World!"
end

say_hello`
};

const CodeEditor = ({ websocket, isOpen }) => {
    const editorRef = useRef(null);
    const [supportedLanguages, setSupportedLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [executionResult, setExecutionResult] = useState(null);
    const [terminalOutput, setTerminalOutput] = useState([]);
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const isTyping = useRef(false);
    const contentRef = useRef('');

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = { editor, monaco };
        
        // Dynamically fetch supported languages
        const languages = monaco.languages.getLanguages();
        const langIds = languages.map(lang => ({
            id: lang.id,
            name: lang.aliases?.[0] || lang.id
        })).filter(lang => 
            ['javascript', 'typescript', 'python', 'cpp', 'java', 'go', 'rust', 'ruby'].includes(lang.id)
        );
        
        setSupportedLanguages(langIds);

        // Explicitly set initial model with JavaScript Hello World
        const model = monaco.editor.createModel(
            LANGUAGE_HELLO_WORLD['javascript'],
            'javascript'
        );
        editor.setModel(model);

        editor.onDidChangeModelContent((event) => {
            if (!isTyping.current && websocket?.readyState === WebSocket.OPEN) {
                const content = editor.getValue();
                contentRef.current = content;
                
                websocket.send(JSON.stringify({
                    type: 'code_change',
                    content: content,
                    language: selectedLanguage,
                    changes: event.changes.map(change => ({
                        // Serialize changes for precise synchronization
                        range: {
                            startLineNumber: change.range.startLineNumber,
                            startColumn: change.range.startColumn,
                            endLineNumber: change.range.endLineNumber,
                            endColumn: change.range.endColumn
                        },
                        text: change.text
                    }))
                }));
            }
        });
    };


    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        
        if (editorRef.current?.monaco && editorRef.current?.editor) {
            const { monaco, editor } = editorRef.current;
            
            const model = monaco.editor.createModel(
                LANGUAGE_HELLO_WORLD[newLanguage] || '',
                newLanguage
            );
            
            editor.setModel(model);
        }
        
        setSelectedLanguage(newLanguage);
        if (websocket?.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                type: 'language_change',
                language: newLanguage
            }));
        }
    };

    const runCode = () => {
        if (!editorRef.current?.editor) return;
        
        const code = editorRef.current.editor.getValue();
        console.log('[DEBUG] Running code:', code);
        console.log('[DEBUG] Language:', selectedLanguage);
        // Clear previous terminal output
        setTerminalOutput([]);
        
        if (websocket?.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                type: 'run_code',
                content: code,
                language: selectedLanguage
            }));
        } else {
            console.error('[DEBUG] WebSocket not open');
        }
    };

    useEffect(() => {
        if (!websocket) return;

        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'code_change' && editorRef.current?.editor) {
                    isTyping.current = true;
                    
                    const remoteContent = data.content;
                    if (remoteContent !== contentRef.current) {
                        // More precise content update
                        editorRef.current.editor.setValue(remoteContent);
                        contentRef.current = remoteContent;
                    }
                    
                    // Update language if different
                    if (data.language && data.language !== selectedLanguage) {
                        setSelectedLanguage(data.language);
                    }
                    
                    isTyping.current = false;
                }

                // Handle language change
                if (data.type === 'language_change') {
                    setSelectedLanguage(data.language);
                    
                    if (editorRef.current?.monaco && editorRef.current?.editor) {
                        const { monaco, editor } = editorRef.current;
                        
                        const model = monaco.editor.createModel(
                            LANGUAGE_HELLO_WORLD[data.language] || '',
                            data.language
                        );
                        
                        editor.setModel(model);
                    }
                }

                if (data.type === 'code_execution_result') {
                    setTerminalOutput(prev => [
                        ...prev,
                        {
                            type: data.error ? 'error' : 'output',
                            message: data.error || data.output,
                            language: data.language,
                            timestamp: new Date().toLocaleTimeString()
                        }
                    ]);
                }

                if (data.type === 'clear_terminal') {
                    setTerminalOutput([]);
                }
                
                if (data.type === 'console_log') {
                    setConsoleOutput(prev => [...prev, {
                        id: prev.length + 1,
                        message: data.message,
                        type: data.log_type || 'log'
                    }]);
                }
            } catch (err) {
                console.error('Error handling websocket message:', err);
            }
        };

        websocket.addEventListener('message', handleMessage);

        return () => {
            websocket.removeEventListener('message', handleMessage);
        };
    }, [websocket]);
    
    const toggleTerminal = () => {
        console.log("Toggling terminal. Current state:", isTerminalOpen);
    setIsTerminalOpen(!isTerminalOpen);
    };

    const clearTerminal = () => {
        setTerminalOutput([]);
        
        if (websocket?.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                type: 'clear_terminal'
            }));
        }
    };
    
    return (
        <div className="h-screen flex flex-col">
      <div className="flex items-center space-x-4 p-2 bg-gray-800">
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="bg-gray-700 text-white p-2 rounded"
        >
          {supportedLanguages.map(lang => (
            <option key={lang.id} value={lang.id}>
              {lang.name.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          onClick={runCode}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Run Code
        </button>
      </div>

      <div className="flex-grow relative">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start coding..."
          theme="vs-dark"
          language={selectedLanguage}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true
          }}
          onMount={handleEditorDidMount}
        />

        {/* Terminal Section */}
        <div 
          className={`
            absolute 
            bottom-0 
            left-0 
            right-0 
            transition-all 
            duration-300 
            ease-in-out 
            ${isTerminalOpen ? 'h-1/3' : 'h-10'}
          `}
        >
          <div 
            className="flex justify-between items-center p-2 bg-gray-800 cursor-pointer"
            // onClick={toggleTerminal}
          >
            <div className="flex items-center space-x-2">
            <span className="text-white">Terminal</span>
            <button
                onClick={toggleTerminal}
                className="text-gray-400 hover:text-white"
              >
                {isTerminalOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
            </div>

              <button
                onClick={clearTerminal}
                className="text-gray-400 hover:text-white text-sm"
              >
                Clear
              </button>
              
          </div>

          <div
            className={`
              overflow-y-auto 
              font-mono 
              text-white 
              text-sm 
              bg-black 
              p-2
              h-full
              ${isTerminalOpen ? 'block' : 'hidden'}
            `}
          >
            {terminalOutput.map((output, index) => (
              <div
                key={index}
                className={output.type === 'error' ? 'text-red-400' : 'text-green-400'}
              >
                <span className="text-gray-500 mr-2">[{output.timestamp}]</span>
                {output.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    );
};

export default CodeEditor;