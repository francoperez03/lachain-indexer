import React, { useState } from 'react';
import { executeGraphQLQuery } from '../../services/graphQLService';
import { Contract } from '../../types/contract';

interface GraphQLTabProps {
  contract: Contract;
}

const GraphQLTab: React.FC<GraphQLTabProps> = ({ contract }) => {
  const [query, setQuery] = useState<string>(
    `{
  eventLogs(contractAddress: "${contract.address}") {
    id
    eventName
    parameters {
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
      console.error(err)
      setError('Error al ejecutar la consulta GraphQL.');
    }
  };

  return (
    <div>
      <h3>Consulta GraphQL</h3>
      {error && <p>{error}</p>}
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={10}
        cols={80}
      />
      <br />
      <button onClick={handleExecute}>Ejecutar</button>
      {result && (
        <div>
          <h4>Resultado:</h4>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default GraphQLTab;
