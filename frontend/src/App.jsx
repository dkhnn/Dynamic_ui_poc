import React, { useState } from 'react';
import Widget from './Widget';
import { parsePrompt } from './llm';

function App() {
  const [widgets, setWidgets] = useState([]);
  const [input, setInput] = useState('');
  const [hfToken, setHfToken] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleCreate = async () => {
    if (!input.trim()) return;
    if (!hfToken.trim()) {
        alert("Please enter your Hugging Face Access Token first.");
        return;
    }
    setProcessing(true);
    try {
        // 1. Send prompt to LLM to get widget config
        console.log("Processing prompt:", input);
        const config = await parsePrompt(input, hfToken);

        console.log("Received config:", config);

        // 2. Add widget
        setWidgets([...widgets, { id: Date.now(), ...config }]);
        setInput('');
    } catch (error) {
        console.error("Failed to create widget", error);
        alert("Failed to process request. Check console.");
    } finally {
        setProcessing(false);
    }
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">AI Task Dashboard</h1>

      {/* Token Input */}
      <div className="max-w-2xl mx-auto mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hugging Face Access Token (Required for FunctionGemma)</label>
          <input
            type="password"
            value={hfToken}
            onChange={(e) => setHfToken(e.target.value)}
            placeholder="hf_..."
            className="w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
              You must accept the license for <code>google/functiongemma-270m-it</code> on Hugging Face.
          </p>
      </div>

      {/* Input Section */}
      <div className="max-w-2xl mx-auto mb-10 flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Describe the widget you want (e.g., 'Show me a pie chart of high priority tasks')"
          className="flex-1 p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={processing}
        />
        <button
          onClick={handleCreate}
          disabled={processing}
          className="bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {processing ? 'Thinking...' : 'Add Widget'}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map(w => (
          <Widget key={w.id} config={w} onDelete={() => removeWidget(w.id)} />
        ))}
      </div>

      {widgets.length === 0 && !processing && (
          <div className="text-center text-gray-400 mt-20">
              <p>No widgets yet. Try adding one!</p>
              <p className="text-sm mt-2">Example: "List all tasks that are done"</p>
          </div>
      )}
    </div>
  );
}

export default App;
