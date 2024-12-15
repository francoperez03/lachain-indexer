import React, { useEffect, useState } from "react";
import { Contract } from "../../types/contract";
import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { executeRestQuery } from "@/services/apiService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import "./RestApiTab.css";

interface RestApiTabProps {
  contract: Contract;
}

const RestApiTab: React.FC<RestApiTabProps> = ({ contract }) => {
  const [selectedRequest, setSelectedRequest] = useState<string>("GET /metadata");
  const [queryParams, setQueryParams] = useState<Record<string,string | number>>({});
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setError(null);
    setResult(null);

    const [method, endpoint] = selectedRequest.split(" ");

    try {
      const data = await executeRestQuery(
        contract.address,
        endpoint,
        method as "GET" | "POST",
        queryParams
      );
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setError(error.message || "Error al ejecutar la consulta REST.");
    }
  };

  useEffect(()=>{
    console.log({queryParams})
  },[queryParams])

  const handleQueryParamChange = (field: string, value: string | number) => {
    setQueryParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleQueryParam = (field: string) => {
    console.log('TOOGLE')
    setQueryParams((prev) => {
      const updatedParams = { ...prev };
      console.log({updatedParams})
      if (updatedParams[field]) {
        delete updatedParams[field];
      } else {
        updatedParams[field] = "";
      }
      return updatedParams;
    });
  };

  const isEventLogsOrTransactions = selectedRequest.includes("/event-logs") || selectedRequest.includes("/transactions");
  const fields = selectedRequest.includes("/event-logs")
    ? [
        { label: "Nombre del Evento", name: "eventName", placeholder: "eventName" },
        { label: "Bloque Desde", name: "fromBlock", placeholder: "fromBlock" },
        { label: "Bloque Hasta", name: "toBlock", placeholder: "toBlock" },
        { label: "Nombre del Parámetro", name: "parameterName", placeholder: "parameterName" },
        { label: "Valor del Parámetro", name: "parameterValue", placeholder: "parameterValue" },
        { label: "Ordenar Por", name: "sortBy", placeholder: "sortBy" },
        { label: "Dirección Orden", name: "sortDirection", placeholder: "sortDirection" },
        { label: "Página", name: "page", placeholder: "page" },
        { label: "Límite", name: "limit", placeholder: "limit" },
      ]
    : [
        { label: "Bloque Desde", name: "fromBlock", placeholder: "fromBlock" },
        { label: "Bloque Hasta", name: "toBlock", placeholder: "toBlock" },
        { label: "Desde Dirección", name: "fromAddress", placeholder: "fromAddress" },
        { label: "Hasta Dirección", name: "toAddress", placeholder: "toAddress" },
        { label: "Ordenar Por", name: "sortBy", placeholder: "sortBy" },
        { label: "Dirección Orden", name: "sortDirection", placeholder: "sortDirection" },
        { label: "Página", name: "page", placeholder: "page" },
        { label: "Límite", name: "limit", placeholder: "limit" },
      ];

  return (
    <div className="rest-api-tab">
      <h3 className="rest-api-title">Consulta API REST</h3>
      {error && <p className="rest-api-error">{error}</p>}

      <div className="rest-api-select">
        <label>Seleccionar Endpoint:</label>
        <Select onValueChange={(value) => setSelectedRequest(value)} value={selectedRequest}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent className="select-content">
            <SelectItem value="GET /metadata">GET /metadata</SelectItem>
            <SelectItem value="GET /abi">GET /abi</SelectItem>
            <SelectItem value="GET /events">GET /events</SelectItem>
            <SelectItem value="GET /event-logs">GET /event-logs</SelectItem>
            <SelectItem value="GET /transactions">GET /transactions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isEventLogsOrTransactions && (
        <div className="query-params-container">
          <h4>Agregar Query Params:</h4>
          {fields.map((field) => (
            <div className="query-param-group" key={field.name}>
              <Checkbox
                id={field.name}
                checked={queryParams[field.name] !== undefined}
                onCheckedChange={() => toggleQueryParam(field.name)}
              />
              <label htmlFor={field.name}>{field.label}:</label>
              <input
                type="text"
                placeholder={field.placeholder}
                disabled={queryParams[field.name] === undefined}
                onChange={(e) => handleQueryParamChange(field.name, e.target.value)}
                value={queryParams[field.name] || ""}
              />
            </div>
          ))}
        </div>
      )}

      <button onClick={handleExecute} className="rest-api-button">
        Ejecutar
      </button>

      {result && (
        <div className="rest-api-result">
          <h4 className="rest-api-result-title">Resultado:</h4>
          <pre className="rest-api-result-content">
            <JsonView
              value={JSON.parse(result)}
              style={githubDarkTheme}
              highlightUpdates={true}
            />
          </pre>
        </div>
      )}
    </div>
  );
};

export default RestApiTab;
