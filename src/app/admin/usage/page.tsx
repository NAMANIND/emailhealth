"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Terminal,
} from "lucide-react";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  id: string;
  title?: string;
}

interface StatusBadgeProps {
  status: 200 | 400 | 401 | 404 | 500;
}

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string>("");

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const CodeBlock = ({
    code,
    language = "javascript",
    id,
    title,
  }: CodeBlockProps) => (
    <div className="relative">
      {title && (
        <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 text-sm font-medium rounded-t-lg">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            {title}
          </span>
          <Badge
            variant="outline"
            className="text-xs border-gray-600 text-gray-300"
          >
            {language}
          </Badge>
        </div>
      )}
      <div className="bg-gray-50 border border-gray-200 rounded-b-lg relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-gray-200"
          onClick={() => copyToClipboard(code, id)}
        >
          {copiedCode === id ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600" />
          )}
        </Button>
        <pre className="p-4 pr-12 text-sm overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );

  const StatusBadge = ({ status }: StatusBadgeProps) => {
    const variants: Record<
      StatusBadgeProps["status"],
      { color: string; icon: typeof CheckCircle }
    > = {
      200: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      400: { color: "bg-red-100 text-red-800", icon: XCircle },
      401: { color: "bg-orange-100 text-orange-800", icon: Shield },
      404: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
      500: { color: "bg-red-100 text-red-800", icon: XCircle },
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${variant.color}`}
      >
        <Icon className="w-3 h-3" />
        {status}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main Content */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <div className="p-8">
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100">
              <TabsTrigger
                value="list"
                className="flex items-center gap-2 text-base"
              >
                <Mail className="w-4 h-4" />
                List Emails
              </TabsTrigger>
              <TabsTrigger
                value="health"
                className="flex items-center gap-2 text-base"
              >
                <Shield className="w-4 h-4" />
                Health Check
              </TabsTrigger>
            </TabsList>

            {/* List Emails Tab */}
            <TabsContent value="list" className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      List Emails API
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Retrieve a comprehensive list of all registered user
                      emails in your system.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-green-800 font-medium">Method</div>
                    <div className="text-2xl font-bold text-green-600">GET</div>
                  </Card>
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-blue-800 font-medium">
                      Authentication
                    </div>
                    <div className="text-blue-600 font-semibold">
                      Not Required
                    </div>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="text-purple-800 font-medium">
                      Rate Limit
                    </div>
                    <div className="text-purple-600 font-semibold">
                      100/hour
                    </div>
                  </Card>
                </div>
              </div>

              {/* Endpoint */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Endpoint
                </h3>
                <div className="bg-gray-900 text-white p-4 rounded-lg font-mono">
                  <span className="text-green-400">GET</span>{" "}
                  <span className="text-blue-300">
                    https://api.yourdomain.com
                  </span>
                  <span className="text-yellow-300">/api/emails/list</span>
                </div>
              </div>

              {/* Response */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Response Format
                </h3>
                <CodeBlock
                  code={`{
  "success": true,
  "data": {
    "emails": [
      "user1@example.com",
      "user2@company.org",
      "admin@business.net"
    ],
    "total": 3,
    "timestamp": "2025-06-12T10:30:00Z"
  }
}`}
                  language="json"
                  id="list-response"
                  title="Response Body"
                />
              </div>

              {/* Code Examples */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Code Examples
                </h3>

                <Tabs defaultValue="curl" className="space-y-4">
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="node">Node.js</TabsTrigger>
                  </TabsList>

                  <TabsContent value="curl">
                    <CodeBlock
                      code={`curl -X GET "https://api.yourdomain.com/api/emails/list" \\
  -H "Accept: application/json" \\
  -H "User-Agent: MyApp/1.0"`}
                      language="bash"
                      id="curl-list"
                      title="cURL Request"
                    />
                  </TabsContent>

                  <TabsContent value="javascript">
                    <CodeBlock
                      code={`// Using fetch API
const response = await fetch('https://api.yourdomain.com/api/emails/list', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'MyApp/1.0'
  }
});

const data = await response.json();
console.log('Emails:', data.data.emails);
console.log('Total count:', data.data.total);

// Using axios
import axios from 'axios';

const response = await axios.get('https://api.yourdomain.com/api/emails/list');
console.log('Emails:', response.data.data.emails);`}
                      language="javascript"
                      id="js-list"
                      title="JavaScript (Browser)"
                    />
                  </TabsContent>

                  <TabsContent value="node">
                    <CodeBlock
                      code={`const https = require('https');
const url = require('url');

// Using built-in HTTPS module
function getEmails() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.yourdomain.com',
      path: '/api/emails/list',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MyApp/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Usage
getEmails()
  .then(data => {
    console.log('Emails:', data.data.emails);
    console.log('Total:', data.data.total);
  })
  .catch(console.error);

// Using axios in Node.js
const axios = require('axios');

async function fetchEmails() {
  try {
    const response = await axios.get('https://api.yourdomain.com/api/emails/list');
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}`}
                      language="javascript"
                      id="node-list"
                      title="Node.js"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            {/* Health Check Tab */}
            <TabsContent value="health" className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Email Health Check API
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Analyze email health by checking spam folder contents and
                      providing detailed insights.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-green-800 font-medium">Method</div>
                    <div className="text-2xl font-bold text-green-600">GET</div>
                  </Card>
                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="text-red-800 font-medium">
                      Authentication
                    </div>
                    <div className="text-red-600 font-semibold">Required</div>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="text-purple-800 font-medium">
                      Rate Limit
                    </div>
                    <div className="text-purple-600 font-semibold">20/hour</div>
                  </Card>
                </div>
              </div>

              {/* Endpoint */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Endpoint
                </h3>
                <div className="bg-gray-900 text-white p-4 rounded-lg font-mono">
                  <span className="text-green-400">GET</span>{" "}
                  <span className="text-blue-300">
                    https://api.yourdomain.com
                  </span>
                  <span className="text-yellow-300">/api/emails/health</span>
                  <span className="text-gray-400">?email=user@example.com</span>
                </div>
              </div>

              {/* Parameters */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Query Parameters
                </h3>
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parameter
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Required
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-blue-600">
                            email
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            string
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-red-100 text-red-800">
                              Required
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            Valid email address to analyze
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Response */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Response Format
                </h3>
                <CodeBlock
                  code={`{
  "success": true,
  "data": {
    "email": "user@example.com",
    "spamCount": 12,
    "status": "warning",
    "healthScore": 7.2,
    "message": "Found 12 spam emails - consider reviewing filters",
    "recommendations": [
      "Enable advanced spam filtering",
      "Review sender whitelist",
      "Update email client settings"
    ],
    "lastChecked": "2025-06-12T10:30:00Z"
  }
}`}
                  language="json"
                  id="health-response"
                  title="Response Body"
                />
              </div>

              {/* Status Codes */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  HTTP Status Codes
                </h3>
                <Card className="overflow-hidden">
                  <div className="space-y-3 p-6">
                    {[
                      {
                        code: 200 as const,
                        desc: "Request successful - health check completed",
                      },
                      {
                        code: 400 as const,
                        desc: "Bad request - missing or invalid email parameter",
                      },
                      {
                        code: 401 as const,
                        desc: "Unauthorized - user not authenticated with Gmail",
                      },
                      {
                        code: 404 as const,
                        desc: "Not found - user account not found in system",
                      },
                      {
                        code: 500 as const,
                        desc: "Internal server error - temporary service unavailable",
                      },
                    ].map(({ code, desc }) => (
                      <div
                        key={code}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <StatusBadge status={code} />
                        <span className="text-gray-700">{desc}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Code Examples */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Code Examples
                </h3>

                <Tabs defaultValue="curl" className="space-y-4">
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="node">Node.js</TabsTrigger>
                  </TabsList>

                  <TabsContent value="curl">
                    <CodeBlock
                      code={`curl -X GET "https://api.yourdomain.com/api/emails/health?email=user@example.com" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "User-Agent: MyApp/1.0"`}
                      language="bash"
                      id="curl-health"
                      title="cURL Request"
                    />
                  </TabsContent>

                  <TabsContent value="javascript">
                    <CodeBlock
                      code={`// Using fetch API with error handling
async function checkEmailHealth(email) {
  try {
    const response = await fetch(\`https://api.yourdomain.com/api/emails/health?email=\${encodeURIComponent(email)}\`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer YOUR_API_TOKEN',
        'User-Agent': 'MyApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    
    console.log('Health Status:', data.data.status);
    console.log('Spam Count:', data.data.spamCount);
    console.log('Health Score:', data.data.healthScore);
    console.log('Recommendations:', data.data.recommendations);
    
    return data;
  } catch (error) {
    console.error('Error checking email health:', error);
    throw error;
  }
}

// Usage
checkEmailHealth('user@example.com')
  .then(result => console.log('Health check complete:', result))
  .catch(error => console.error('Health check failed:', error));

// Using axios
import axios from 'axios';

const checkHealth = async (email) => {
  const response = await axios.get('https://api.yourdomain.com/api/emails/health', {
    params: { email },
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN'
    }
  });
  
  return response.data;
};`}
                      language="javascript"
                      id="js-health"
                      title="JavaScript (Browser)"
                    />
                  </TabsContent>

                  <TabsContent value="node">
                    <CodeBlock
                      code={`const https = require('https');
const querystring = require('querystring');

// Using built-in HTTPS module
function checkEmailHealth(email, apiToken) {
  return new Promise((resolve, reject) => {
    const params = querystring.stringify({ email });
    const options = {
      hostname: 'api.yourdomain.com',
      path: \`/api/emails/health?\${params}\`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': \`Bearer \${apiToken}\`,
        'User-Agent': 'MyApp/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(\`HTTP \${res.statusCode}: \${result.message || 'Unknown error'}\`));
          }
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', error => {
      reject(new Error(\`Request failed: \${error.message}\`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Usage with async/await
async function main() {
  try {
    const result = await checkEmailHealth('user@example.com', 'your_api_token_here');
    
    console.log('Email Health Report:');
    console.log('- Status:', result.data.status);
    console.log('- Spam Count:', result.data.spamCount);
    console.log('- Health Score:', result.data.healthScore);
    console.log('- Message:', result.data.message);
    
    if (result.data.recommendations.length > 0) {
      console.log('- Recommendations:');
      result.data.recommendations.forEach((rec, index) => {
        console.log(\`  \${index + 1}. \${rec}\`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();

// Using axios in Node.js with environment variables
const axios = require('axios');

class EmailHealthAPI {
  constructor(apiToken, baseURL = 'https://api.yourdomain.com') {
    this.apiToken = apiToken;
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': \`Bearer \${apiToken}\`,
        'User-Agent': 'MyApp/1.0'
      },
      timeout: 10000
    });
  }

  async checkHealth(email) {
    try {
      const response = await this.client.get('/api/emails/health', {
        params: { email }
      });
      
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(\`API Error \${error.response.status}: \${error.response.data.message || 'Unknown error'}\`);
      } else if (error.request) {
        throw new Error('No response received from API');
      } else {
        throw new Error(\`Request setup error: \${error.message}\`);
      }
    }
  }
}

// Usage
const emailAPI = new EmailHealthAPI(process.env.API_TOKEN);

emailAPI.checkHealth('user@example.com')
  .then(result => console.log('Health check result:', result))
  .catch(error => console.error('Error:', error.message));`}
                      language="javascript"
                      id="node-health"
                      title="Node.js"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
