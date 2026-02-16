import * as vscode from 'vscode';
import axios from 'axios';
import * as WebSocket from 'ws';

let ws: WebSocket | null = null;
let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
    console.log('Smart DevCopilot extension is now active!');

    // Create diagnostic collection for security warnings
    diagnosticCollection = vscode.languages.createDiagnosticCollection('smartDevCopilot');
    context.subscriptions.push(diagnosticCollection);

    // Get configuration
    const config = vscode.workspace.getConfiguration('smartDevCopilot');
    const apiUrl = config.get<string>('apiUrl', 'http://localhost:8000');
    const enableRealTime = config.get<boolean>('enableRealTime', true);
    const autoScan = config.get<boolean>('autoScan', true);

    // Initialize WebSocket connection for real-time features
    if (enableRealTime) {
        connectWebSocket(apiUrl);
    }

    // Register commands
    
    // 1. Generate Code from Natural Language
    let generateCodeCommand = vscode.commands.registerCommand('smartDevCopilot.generateCode', async () => {
        const prompt = await vscode.window.showInputBox({
            prompt: 'Describe the code you want to generate',
            placeHolder: 'E.g., Build a REST API for customer data'
        });

        if (!prompt) {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const language = editor.document.languageId;

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating code...',
                cancellable: false
            }, async () => {
                const response = await axios.post(`${apiUrl}/api/generate`, {
                    prompt,
                    language,
                    context: editor.document.getText(),
                    max_tokens: 1000
                });

                const { code, explanation, optimization_tips, documentation } = response.data;

                // Insert generated code
                editor.edit(editBuilder => {
                    const position = editor.selection.active;
                    editBuilder.insert(position, code);
                });

                // Show explanation
                const panel = vscode.window.createWebviewPanel(
                    'codeExplanation',
                    'Code Generation Results',
                    vscode.ViewColumn.Two,
                    {}
                );

                panel.webview.html = getExplanationHtml(explanation, optimization_tips, documentation);
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Code generation failed: ${error}`);
        }
    });

    // 2. Debug Code
    let debugCodeCommand = vscode.commands.registerCommand('smartDevCopilot.debugCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const code = editor.document.getText();
        const language = editor.document.languageId;

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Analyzing code...',
                cancellable: false
            }, async () => {
                const response = await axios.post(`${apiUrl}/api/debug`, {
                    code,
                    language
                });

                const { suggestions, explanations, fixed_code } = response.data;

                // Show suggestions
                const panel = vscode.window.createWebviewPanel(
                    'debugSuggestions',
                    'Debug Suggestions',
                    vscode.ViewColumn.Two,
                    {}
                );

                panel.webview.html = getDebugHtml(suggestions, explanations, fixed_code);

                // Optionally apply fixed code
                if (fixed_code) {
                    const apply = await vscode.window.showInformationMessage(
                        'Apply suggested fixes?',
                        'Yes',
                        'No'
                    );

                    if (apply === 'Yes') {
                        editor.edit(editBuilder => {
                            const fullRange = new vscode.Range(
                                editor.document.positionAt(0),
                                editor.document.positionAt(editor.document.getText().length)
                            );
                            editBuilder.replace(fullRange, fixed_code);
                        });
                    }
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Debug analysis failed: ${error}`);
        }
    });

    // 3. Security Scan
    let scanSecurityCommand = vscode.commands.registerCommand('smartDevCopilot.scanSecurity', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        await performSecurityScan(editor, apiUrl);
    });

    // 4. Explain Code
    let explainCodeCommand = vscode.commands.registerCommand('smartDevCopilot.explainCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const selection = editor.document.getText(editor.selection);
        if (!selection) {
            vscode.window.showInformationMessage('Please select code to explain');
            return;
        }

        const language = editor.document.languageId;

        try {
            const response = await axios.post(`${apiUrl}/api/generate`, {
                prompt: `Explain this ${language} code step by step:\n${selection}`,
                language,
                max_tokens: 500
            });

            const panel = vscode.window.createWebviewPanel(
                'codeExplanation',
                'Code Explanation',
                vscode.ViewColumn.Two,
                {}
            );

            panel.webview.html = `
                <html>
                    <body>
                        <h1>Code Explanation</h1>
                        <pre><code>${selection}</code></pre>
                        <hr>
                        <div>${response.data.explanation}</div>
                    </body>
                </html>
            `;
        } catch (error) {
            vscode.window.showErrorMessage(`Explanation failed: ${error}`);
        }
    });

    // 5. Create Pull Request
    let createPRCommand = vscode.commands.registerCommand('smartDevCopilot.createPR', async () => {
        const title = await vscode.window.showInputBox({
            prompt: 'PR Title',
            placeHolder: 'E.g., Add new feature'
        });

        const description = await vscode.window.showInputBox({
            prompt: 'PR Description',
            placeHolder: 'Describe your changes'
        });

        if (!title || !description) {
            return;
        }

        // This would integrate with GitHub API
        vscode.window.showInformationMessage('PR creation will be implemented with GitHub integration');
    });

    // Auto-scan on save
    if (autoScan) {
        vscode.workspace.onDidSaveTextDocument(async (document) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === document) {
                await performSecurityScan(editor, apiUrl);
            }
        });
    }

    context.subscriptions.push(
        generateCodeCommand,
        debugCodeCommand,
        scanSecurityCommand,
        explainCodeCommand,
        createPRCommand
    );
}

function connectWebSocket(apiUrl: string) {
    const wsUrl = apiUrl.replace('http', 'ws') + '/ws/realtime';
    
    ws = new WebSocket(wsUrl);

    ws.on('open', () => {
        console.log('WebSocket connected');
    });

    ws.on('message', (data: WebSocket.Data) => {
        try {
            const message = JSON.parse(data.toString());
            handleWebSocketMessage(message);
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('WebSocket disconnected');
        // Reconnect after 5 seconds
        setTimeout(() => connectWebSocket(apiUrl), 5000);
    });
}

function handleWebSocketMessage(message: any) {
    if (message.type === 'security') {
        const vulnerabilities = message.data.vulnerabilities;
        // Update diagnostics in real-time
        if (vscode.window.activeTextEditor) {
            updateSecurityDiagnostics(vscode.window.activeTextEditor, vulnerabilities);
        }
    }
}

async function performSecurityScan(editor: vscode.TextEditor, apiUrl: string) {
    const code = editor.document.getText();
    const language = editor.document.languageId;

    try {
        const response = await axios.post(`${apiUrl}/api/security-scan`, {
            code,
            language,
            file_path: editor.document.fileName
        });

        const { vulnerabilities, severity_levels, recommendations } = response.data;

        // Clear existing diagnostics
        diagnosticCollection.clear();

        // Update diagnostics
        updateSecurityDiagnostics(editor, vulnerabilities);

        // Show notification
        const total = Object.values(severity_levels).reduce((a: any, b: any) => a + b, 0);
        if (total > 0) {
            vscode.window.showWarningMessage(`Found ${total} security issues`);
        } else {
            vscode.window.showInformationMessage('No security issues found');
        }
    } catch (error) {
        console.error('Security scan failed:', error);
    }
}

function updateSecurityDiagnostics(editor: vscode.TextEditor, vulnerabilities: any[]) {
    const diagnostics: vscode.Diagnostic[] = [];

    for (const vuln of vulnerabilities) {
        const line = Math.max(0, (vuln.line || 1) - 1);
        const range = new vscode.Range(line, 0, line, 100);
        
        const severity = vuln.severity === 'critical' ? vscode.DiagnosticSeverity.Error :
                        vuln.severity === 'high' ? vscode.DiagnosticSeverity.Warning :
                        vscode.DiagnosticSeverity.Information;

        const diagnostic = new vscode.Diagnostic(
            range,
            `${vuln.description} (${vuln.pattern})`,
            severity
        );
        diagnostic.source = 'Smart DevCopilot';
        
        diagnostics.push(diagnostic);
    }

    diagnosticCollection.set(editor.document.uri, diagnostics);
}

function getExplanationHtml(explanation: string, tips: string[], documentation: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { color: #007acc; }
                .tip { background: #f0f0f0; padding: 10px; margin: 5px 0; border-radius: 5px; }
                pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>Code Generation Results</h1>
            
            <h2>Explanation</h2>
            <p>${explanation}</p>
            
            <h2>Optimization Tips</h2>
            ${tips.map(tip => `<div class="tip">💡 ${tip}</div>`).join('')}
            
            <h2>Documentation</h2>
            <pre>${documentation}</pre>
        </body>
        </html>
    `;
}

function getDebugHtml(suggestions: any[], explanations: string[], fixedCode: string | null): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { color: #007acc; }
                .suggestion { background: #fff3cd; padding: 10px; margin: 10px 0; border-radius: 5px; }
                .explanation { background: #e7f3ff; padding: 10px; margin: 10px 0; border-radius: 5px; }
                pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>Debug Analysis</h1>
            
            <h2>Suggestions</h2>
            ${suggestions.map(s => `
                <div class="suggestion">
                    <strong>Line ${s.line}</strong>: ${s.description}
                </div>
            `).join('')}
            
            <h2>Explanations</h2>
            ${explanations.map(e => `<div class="explanation">📝 ${e}</div>`).join('')}
            
            ${fixedCode ? `
                <h2>Fixed Code</h2>
                <pre><code>${fixedCode}</code></pre>
            ` : ''}
        </body>
        </html>
    `;
}

export function deactivate() {
    if (ws) {
        ws.close();
    }
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}
