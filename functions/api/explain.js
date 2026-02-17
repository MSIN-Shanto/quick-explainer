/**
 * Cloudflare Pages Function - AI Explanation API
 * Handles AI API calls with hardcoded Pollinations endpoint
 */

// Hardcoded API configuration
const API_BASE_URL = 'https://gen.pollinations.ai/v1';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // Get API key from environment variable
        const apiKey = env.API_KEY;
        
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'API key not configured on server' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Parse request body
        const body = await request.json();
        const { messages, temperature = 0.7, max_tokens = 2000 } = body;
        
        if (!messages || !Array.isArray(messages)) {
            return new Response(
                JSON.stringify({ error: 'Invalid request: messages array required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Call the AI API with hardcoded model
        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai',
                messages,
                temperature,
                max_tokens
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return new Response(
                JSON.stringify({ 
                    error: errorData.error?.message || `API error: ${response.status}` 
                }),
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        const data = await response.json();
        
        // Add model info to response for display
        data.model_used = 'openai';
        
        return new Response(
            JSON.stringify(data),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                } 
            }
        );
        
    } catch (error) {
        console.error('Function error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// Handle CORS preflight requests
export async function onRequestOptions(context) {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
