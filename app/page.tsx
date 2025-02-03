'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

export default function CodeEditor() {
  const [language, setLanguage] = useState('python'); // Default to Python
  const [code, setCode] = useState('// Start coding here');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleSave = () => {
    console.log('Saved code:', code);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    setError(null);

    try {
      console.log('Sending request to run code');
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`Failed to parse JSON response: ${responseText}`);
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }

      setOutput(data.result || 'No output');
    } catch (err) {
      console.error('Error running code:', err);
      setError(
        `Error: ${
          err instanceof Error ? err.message : 'Unknown error occurred'
        }`
      );
      setOutput('');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Online Code Editor</h1>
      <div className="mb-4 flex justify-between items-center">
        <Select onValueChange={handleLanguageChange} defaultValue={language}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="java">Java</SelectItem>
          </SelectContent>
        </Select>
        <div>
          <Button onClick={handleRun} disabled={isRunning} className="mr-2">
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          <Button onClick={handleSave}>Save Code</Button>
        </div>
      </div>
      <MonacoEditor
        height="70vh"
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
      />
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Output:</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-[200px]">
          {error ? <span className="text-red-500">{error}</span> : output}
        </pre>
      </div>
    </div>
  );
}
