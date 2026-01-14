import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from './CodeBlock';
import { ParamsTable, type Param } from './ParamsTable';
import { cn } from '@/lib/utils';

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestParams?: Param[];
  responseParams?: Param[];
  exampleRequest?: {
    curl: string;
    javascript: string;
    python: string;
  };
  exampleResponse?: string;
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-600 border-green-500/30',
  POST: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  PATCH: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  DELETE: 'bg-red-500/10 text-red-600 border-red-500/30',
};

export function ApiEndpoint({
  method,
  path,
  description,
  requestParams = [],
  responseParams = [],
  exampleRequest,
  exampleResponse,
}: ApiEndpointProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
        <Badge className={cn("font-mono font-bold", methodColors[method])}>
          {method}
        </Badge>
        <code className="text-sm font-mono text-foreground">{path}</code>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        <p className="text-muted-foreground">{description}</p>

        {/* Request Parameters */}
        {requestParams.length > 0 && (
          <ParamsTable params={requestParams} title="Request Body" />
        )}

        {/* Code Examples */}
        {exampleRequest && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Beispiel-Anfrage</h4>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-[300px]">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="curl" className="mt-2">
                <CodeBlock code={exampleRequest.curl} language="bash" />
              </TabsContent>
              <TabsContent value="javascript" className="mt-2">
                <CodeBlock code={exampleRequest.javascript} language="javascript" />
              </TabsContent>
              <TabsContent value="python" className="mt-2">
                <CodeBlock code={exampleRequest.python} language="python" />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Response Parameters */}
        {responseParams.length > 0 && (
          <ParamsTable params={responseParams} title="Response" />
        )}

        {/* Example Response */}
        {exampleResponse && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Beispiel-Antwort</h4>
            <CodeBlock code={exampleResponse} language="json" />
          </div>
        )}
      </div>
    </div>
  );
}
