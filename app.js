// DOM Elements
const startBtn = document.getElementById('start-btn');
const chatSection = document.getElementById('chat-section');
const uploadBtn = document.getElementById('upload-btn');
const artUploadInput = document.getElementById('art-upload');
const previewContainer = document.getElementById('preview-container');
const previewImg = document.getElementById('preview-img');
const closePreviewBtn = document.getElementById('close-preview');
const analyzeBtn = document.getElementById('analyze-btn');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// API Key for Gemini API (would typically be stored securely)
// This is a placeholder - you would need to get your own API key
const API_KEY = "AIzaSyAK8obivhQ8T9mF-dGC-SnaZ7GutGQF4e0";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const VISION_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// State variables
let uploadedImage = null;
let conversationContext = []; // Store conversation history for context
let activeArtworkAnalysis = null; // Store analysis of the current artwork

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeRotatingArt();
});

function initializeEventListeners() {
    // Start button to show chat section
    startBtn.addEventListener('click', () => {
        chatSection.classList.remove('hidden');
        startBtn.scrollIntoView({ behavior: 'smooth' });
    });

    // Upload artwork button
    uploadBtn.addEventListener('click', () => {
        artUploadInput.click();
    });

    // File input change
    artUploadInput.addEventListener('change', handleImageUpload);

    // Close preview button
    closePreviewBtn.addEventListener('click', () => {
        previewContainer.classList.add('hidden');
        // Reset the file input value to allow re-uploading the same file
        artUploadInput.value = '';
        // Reset the uploaded image state
        uploadedImage = null;
        // Also reset the active artwork analysis
        activeArtworkAnalysis = null;
        
        // Add a message to chat if we're in a conversation
        if (chatMessages.children.length > 1) {
            const message = "Artwork preview closed. You can upload another artwork or continue our conversation about art.";
            addMessageToChat(message, 'bot');
            
            // Add to conversation context
            conversationContext.push({
                role: 'system',
                message: 'Artwork preview closed'
            });
            
            conversationContext.push({
                role: 'assistant',
                message: message
            });
        }
    });

    // Analyze artwork button
    analyzeBtn.addEventListener('click', () => {
        analyzeArtwork();
    });

    // Send message button
    sendBtn.addEventListener('click', sendMessage);

    // Allow Enter key to send message
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Initialize rotating art in hero section
function initializeRotatingArt() {
    const rotatingArt = document.querySelector('.rotating-art');
    
    // Create an array of gradient combinations
    const colorCombinations = [
        // Purples to greens (default)
        'conic-gradient(from 0deg, #a78bfa, #2cb67d, #ff8906, #7f5af0, #a78bfa)',
        
        // Blues to oranges
        'conic-gradient(from 45deg, #3b82f6, #06b6d4, #f59e0b, #ef4444, #3b82f6)',
        
        // Pinks to yellows
        'conic-gradient(from 90deg, #ec4899, #8b5cf6, #eab308, #ec4899)',
        
        // Teal to reds
        'conic-gradient(from 135deg, #14b8a6, #6366f1, #f43f5e, #14b8a6)',
        
        // Greens to purples
        'conic-gradient(from 180deg, #22c55e, #0ea5e9, #a855f7, #22c55e)'
    ];
    
    let currentIndex = 0;
    
    // Set initial background
    rotatingArt.style.background = colorCombinations[currentIndex];
    
    // Function to smoothly transition to the next color combination
    function changeColorWithTransition() {
        currentIndex = (currentIndex + 1) % colorCombinations.length;
        
        // Create transition effect
        rotatingArt.style.transition = 'background 3s ease-in-out';
        rotatingArt.style.background = colorCombinations[currentIndex];
        
        // Reset the transition after it completes to avoid affecting other animations
        setTimeout(() => {
            rotatingArt.style.transition = 'none';
        }, 3000);
    }
    
    // Change color combination every 8 seconds
    setInterval(changeColorWithTransition, 8000);
    
    // Add interactive hover effect
    rotatingArt.addEventListener('mouseenter', () => {
        rotatingArt.style.animationPlayState = 'paused';
        rotatingArt.style.transform = 'scale(1.1)';
        rotatingArt.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
    });
    
    rotatingArt.addEventListener('mouseleave', () => {
        rotatingArt.style.animationPlayState = 'running';
        rotatingArt.style.transform = 'scale(1)';
        rotatingArt.style.boxShadow = 'var(--box-shadow)';
    });
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        // Update the preview image
        previewImg.src = event.target.result;
        uploadedImage = event.target.result;
        
        // Reset the active artwork analysis since this is a new image
        activeArtworkAnalysis = null;
        
        // Show the preview container
        previewContainer.classList.remove('hidden');
        
        // Add a message to chat indicating a new image was uploaded
        if (chatMessages.children.length > 1) { // Check if we're already in a conversation
            const message = "New artwork uploaded. Click 'Analyze Artwork' to get feedback on this piece.";
            addMessageToChat(message, 'bot');
            
            // Add to conversation context
            conversationContext.push({
                role: 'system',
                message: 'New artwork uploaded'
            });
            
            conversationContext.push({
                role: 'assistant',
                message: message
            });
        }
    };
    reader.readAsDataURL(file);
}

// Send message to chatbot
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Add to conversation context
    conversationContext.push({
        role: 'user',
        message: message
    });
    
    // Keep conversation context manageable (last 10 messages)
    if (conversationContext.length > 10) {
        conversationContext = conversationContext.slice(-10);
    }
    
    // Clear input
    userInput.value = '';
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        // Get response from API, including artwork context if available
        const response = await getAIResponse(message, uploadedImage, activeArtworkAnalysis);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add bot response to chat
        addMessageToChat(response, 'bot');
        
        // Add to conversation context
        conversationContext.push({
            role: 'assistant',
            message: response
        });
    } catch (error) {
        console.error('Error getting response:', error);
        typingIndicator.remove();
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

// Analyze artwork using AI
async function analyzeArtwork() {
    if (!uploadedImage) {
        alert('Please upload an image first');
        return;
    }
    
    // Add message to indicate analysis
    addMessageToChat('Analyzing your artwork...', 'bot');
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        // Get analysis from API
        const analysis = await getArtworkAnalysis(uploadedImage);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add analysis to chat
        addMessageToChat(analysis, 'bot');
        
        // Store analysis for context in future conversations
        activeArtworkAnalysis = analysis;
        
        // Add to conversation context
        conversationContext.push({
            role: 'system',
            message: 'Artwork uploaded and analyzed'
        });
        
        conversationContext.push({
            role: 'assistant',
            message: analysis
        });
        
        // Keep preview visible for reference during chat
        // Only reset the file input to allow uploading a new image if needed
        artUploadInput.value = '';
    } catch (error) {
        console.error('Error analyzing artwork:', error);
        typingIndicator.remove();
        addMessageToChat('Sorry, I encountered an error analyzing your artwork. Please try again.', 'bot');
    }
}

// Add message to chat
function addMessageToChat(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    // Replace new lines with <br> tags
    messageContent.innerHTML = content.replace(/\n/g, '<br>');
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// Add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot', 'typing-indicator');
    
    const typingContent = document.createElement('div');
    typingContent.classList.add('message-content');
    typingContent.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

// Get AI response for text message
async function getAIResponse(message, imageData, analysis) {
    try {
        // For production use - with better prompt engineering
        const requestBody = {
            contents: [{
                parts: [{
                    text: buildPromptWithContext(message, analysis)
                }]
            }],
            generation_config: {
                temperature: 0.7,
                max_output_tokens: 800
            }
        };
        
        // If we have an image, add it to the request for multimodal understanding
        if (imageData) {
            const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0];
            const base64Data = imageData.split(',')[1];
            
            // Add the image to the first content part
            requestBody.contents[0].parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                }
            });
        }
        
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API error:', response.status, errorData);
            throw new Error(`API error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        // Improved parsing to handle different response formats
        let responseText = "";
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            if (candidate.content && candidate.content.parts) {
                // Extract text from all parts and join them
                responseText = candidate.content.parts
                    .filter(part => part.text)
                    .map(part => part.text)
                    .join("\n\n");
            }
        }
        
        if (responseText) {
            return responseText;
        } else {
            console.error('Unexpected API response format:', data);
            return "I'm having trouble processing your question right now. Please try again or ask something about art techniques, history, or upload an image for analysis.";
        }
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        if (error.message && error.message.includes('API error')) {
            return `Sorry, I encountered an error communicating with the AI service: ${error.message}. Please try again later.`;
        }
        throw error;
    }
}

// Build prompt with context
function buildPromptWithContext(message, analysis) {
    // Create a representation of the conversation history
    const conversationHistoryText = conversationContext
        .map(entry => `${entry.role === 'user' ? 'User' : 'ArtistAI'}: ${entry.message.substring(0, 150)}${entry.message.length > 150 ? '...' : ''}`)
        .join('\n');
    
    // Check if there's an analyzed artwork in context
    const artworkContext = analysis ? 
        `The user has uploaded an artwork that was analyzed with the following feedback:\n${analysis.substring(0, 500)}${analysis.length > 500 ? '...' : ''}\n\n` : 
        uploadedImage ? 'The user has uploaded an artwork that has not been analyzed yet.\n\n' : '';
    
    return `You are ArtistAI, an expert art assistant with deep knowledge of art history, techniques, styles, and composition.

${artworkContext}

Conversation history:
${conversationHistoryText}

The user is now asking: "${message}"

Provide a helpful, concise, and informative response about this art topic. Include practical advice if appropriate, structured with bullet points or numbered lists if it helps clarify steps or concepts. Aim to be educational and supportive.

If their query relates to the artwork they've uploaded, reference specific elements from the analysis and provide further insights based on their question.

If the query is about improving artistic skills, provide actionable tips. If it's about art history or movements, include key characteristics and notable examples.

Keep your response focused, professional, and suitable for artists of all levels.`;
}

// Get artwork analysis from API
async function getArtworkAnalysis(imageData) {
    try {
        // For production use - with better prompt engineering
        const response = await fetch(`${VISION_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `You are ArtistAI, a professional art critic and mentor. The user has uploaded an artwork for analysis.

Please analyze this artwork in detail, focusing on:

1. Composition: Evaluate the arrangement, balance, focal points, and use of space
2. Color Balance: Analyze the color palette, harmony, contrasts, and emotional impact
3. Lighting: Examine light sources, shadows, highlights, and how they create depth
4. Style: Identify artistic influences, techniques used, and stylistic elements

For each category, provide:
- An assessment of what is working well
- Specific, constructive suggestions for improvement
- Practical techniques the artist could apply to enhance their work

End with 3-5 specific, actionable improvements listed in order of priority.

Your feedback should be educational, supportive, and precise. Use language that is encouraging yet honest. Your goal is to help the artist improve their skills while appreciating their current achievement.` },
                        {
                            inline_data: {
                                mime_type: imageData.split(',')[0].split(':')[1].split(';')[0], // Extract mime type from data URL
                                data: imageData.split(',')[1] // Remove the data:image/jpeg;base64, prefix
                            }
                        }
                    ]
                }],
                generation_config: {
                    temperature: 0.4,
                    max_output_tokens: 1024
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API error:', response.status, errorData);
            throw new Error(`API error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        // Improved parsing to handle different response formats
        let responseText = "";
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            if (candidate.content && candidate.content.parts) {
                // Extract text from all parts and join them
                responseText = candidate.content.parts
                    .filter(part => part.text)
                    .map(part => part.text)
                    .join("\n\n");
            }
        }
        
        if (responseText) {
            return responseText;
        } else {
            console.error('Unexpected API response format:', data);
            return "I'm having trouble analyzing your artwork right now. This could be due to image format limitations or API constraints. Please try another image or try again later.";
        }
        
    } catch (error) {
        console.error('Error analyzing artwork:', error);
        if (error.message && error.message.includes('API error')) {
            return `Sorry, I encountered an error analyzing your artwork: ${error.message}. Please try again later or with a different image.`;
        }
        throw error;
    }
}