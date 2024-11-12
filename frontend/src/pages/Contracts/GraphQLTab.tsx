import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { executeGraphQLQuery } from '../../services/graphQLService';
import { Contract } from '../../types/contract';
import './GraphQLTab.css';
import JsonView from '@uiw/react-json-view';
import { githubDarkTheme } from '@uiw/react-json-view/githubDark';

interface GraphQLTabProps {
  contract: Contract;
}

const GraphQLTab: React.FC<GraphQLTabProps> = ({ contract }) => {
  const [query, setQuery] = useState<string>(
    `query {
  eventLogs(filter: { contractAddress: "${contract.address}", eventName: "Transfer", signature: "0xSignature" }) {
    id
    blockNumber
    transactionHash
    event {
      name
    }
    eventParameters {
      name
      value
    }
  }
}`
  );
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setError(null);
    try {
      const data = await executeGraphQLQuery(query);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setError('Error al ejecutar la consulta GraphQL.');
    }
  };

  return (
    <div className="graphql-tab">
      <h3 className="graphql-title">Consulta GraphQL</h3>
      {error && <p className="graphql-error">{error}</p>}
      <MonacoEditor
        height="300px"
        language="graphql"
        theme="vs-dark"
        value={query}
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          automaticLayout: true,
        }}
        onChange={(value) => setQuery(value || '')}
        className="graphql-editor"
      />
      <button onClick={handleExecute} className="graphql-button">Ejecutar</button>
      {result && (
        <div className="graphql-result">
          <h4 className="graphql-result-title">Resultado:</h4>
          <pre className="graphql-result-content">
            <JsonView value={contract.abi} style={githubDarkTheme}  />
          </pre>
        </div>
      )}
    </div>
  );
};

export default GraphQLTab;
