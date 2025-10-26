

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Chat, GenerateContentResponse, UsageMetadata } from '@google/genai';

// IMPORTANT: The API key is sourced from `process.env.API_KEY`.
// Assume this environment variable is set and valid in your deployment environment.
const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (!API_KEY) {
    console.error("API_KEY environment variable not set. Application functionality will be limited.");
    // Login UI will still work, but generation will fail if API key is needed.
} else {
    ai = new GoogleGenAI({ apiKey: API_KEY });
}

const model = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';
const generationDelayMs = 750; // Delay in milliseconds between API calls
const DEFAULT_WELCOME_CREDITS = 10;

// --- START AUTH ELEMENTS ---
const loginButton = document.getElementById('login-button') as HTMLButtonElement;
const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;
const buyCreditsButton = document.getElementById('buy-credits-button') as HTMLButtonElement;
const userCreditsDisplayElement = document.getElementById('user-credits-display') as HTMLSpanElement;

const authModal = document.getElementById('auth-modal') as HTMLDivElement;
const closeAuthModalButton = document.getElementById('close-auth-modal-button') as HTMLButtonElement;
const authModalTitle = document.getElementById('auth-modal-title') as HTMLHeadingElement;

const loginView = document.getElementById('login-view') as HTMLDivElement;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const loginEmailInput = document.getElementById('login-email') as HTMLInputElement;
const loginPasswordInput = document.getElementById('login-password') as HTMLInputElement;
const loginErrorMessage = document.getElementById('login-error-message') as HTMLParagraphElement;
const showRegisterViewButton = document.getElementById('show-register-view-button') as HTMLButtonElement;

const registerView = document.getElementById('register-view') as HTMLDivElement;
const registerForm = document.getElementById('register-form') as HTMLFormElement;
const registerNameInput = document.getElementById('register-name') as HTMLInputElement;
const registerEmailInput = document.getElementById('register-email') as HTMLInputElement;
const registerPasswordInput = document.getElementById('register-password') as HTMLInputElement;
const registerConfirmPasswordInput = document.getElementById('register-confirm-password') as HTMLInputElement;
const registerErrorMessage = document.getElementById('register-error-message') as HTMLParagraphElement;
const showLoginViewButton = document.getElementById('show-login-view-button') as HTMLButtonElement;

const authSuccessMessage = document.getElementById('auth-success-message') as HTMLParagraphElement;

const welcomeMessageSpan = document.getElementById('welcome-message') as HTMLSpanElement;
const appContentWrapper = document.getElementById('app-content-wrapper') as HTMLDivElement;
// --- END AUTH ELEMENTS ---

// --- START BUY CREDITS MODAL ELEMENTS ---
const buyCreditsModal = document.getElementById('buy-credits-modal') as HTMLDivElement;
const closeBuyCreditsModalButton = document.getElementById('close-buy-credits-modal-button') as HTMLButtonElement;
const creditsPackageSelectionView = document.getElementById('credits-package-selection') as HTMLDivElement;
const creditPackageCards = document.querySelectorAll('.credit-package-card');
const paymentFormSectionView = document.getElementById('payment-form-section') as HTMLDivElement;
const paymentForm = document.getElementById('payment-form') as HTMLFormElement;
const selectedCardInfo = document.getElementById('selected-package-info') as HTMLParagraphElement;
const cardNameInput = document.getElementById('card-name') as HTMLInputElement;
const cardNumberInput = document.getElementById('card-number') as HTMLInputElement;
const cardExpiryInput = document.getElementById('card-expiry') as HTMLInputElement;
const cardCvvInput = document.getElementById('card-cvv') as HTMLInputElement;
const paymentErrorMessage = document.getElementById('payment-error-message') as HTMLParagraphElement;
const purchaseSuccessMessage = document.getElementById('purchase-success-message') as HTMLParagraphElement;
const backToPackagesButton = document.getElementById('back-to-packages-button') as HTMLButtonElement;
// --- END BUY CREDITS MODAL ELEMENTS ---


const form = document.getElementById('business-form') as HTMLFormElement;
const generateButton = document.getElementById('generate-plan-button') as HTMLButtonElement;
const printPdfButton = document.getElementById('print-pdf-button') as HTMLButtonElement;
const downloadHtmlLightButton = document.getElementById('download-html-light-button') as HTMLButtonElement;
const downloadHtmlDarkButton = document.getElementById('download-html-dark-button') as HTMLButtonElement;
const downloadLandingPageHtmlButton = document.getElementById('download-landing-page-html-button') as HTMLButtonElement;
const downloadInstagramContentButton = document.getElementById('download-instagram-content-button') as HTMLButtonElement;


const loadingIndicator = document.getElementById('loading-indicator') as HTMLDivElement;
const outputSection = document.getElementById('output-section') as HTMLElement;
const additionalAiResourcesSection = document.getElementById('additional-ai-resources') as HTMLElement;
const generationStatsDiv = document.getElementById('generation-stats') as HTMLDivElement;
const totalTokensValueSpan = document.getElementById('total-tokens-value') as HTMLSpanElement;
const generationCostValueSpan = document.getElementById('generation-cost-value') as HTMLSpanElement;


// Output content elements
const businessOverviewContent = document.querySelector('#business-overview .content') as HTMLDivElement;
const productPackagesContent = document.querySelector('#product-packages .content') as HTMLDivElement;
const operationalStrategyContent = document.querySelector('#operational-strategy .content') as HTMLDivElement;
const prospectingStrategyContent = document.querySelector('#prospecting-strategy .content') as HTMLDivElement;
const contractTemplatesContent = document.querySelector('#contract-templates .content') as HTMLDivElement;
const landingPagePreviewContent = document.querySelector('#landing-page-preview .content') as HTMLDivElement; // Hosts the iframe
const offersGenerationContent = document.querySelector('#offers-generation .content') as HTMLDivElement;
const organicGrowthStrategyContent = document.querySelector('#organic-growth-strategy .content') as HTMLDivElement;
const customerFunnelContent = document.querySelector('#customer-funnel .content') as HTMLDivElement;
const monthlyGrowthProjectionContent = document.querySelector('#monthly-growth-projection .content') as HTMLDivElement;
const financialProjectionVisualizationContent = document.querySelector('#financial-projection-visualization .content') as HTMLDivElement;
const customerServiceFlowContent = document.querySelector('#customer-service-flow .content') as HTMLDivElement;
const customerServiceOrganizationContent = document.querySelector('#customer-service-organization .content') as HTMLDivElement;
const actionPlan30DaysContent = document.querySelector('#action-plan-30days .content') as HTMLDivElement;
const instagramStrategyContent = document.querySelector('#instagram-strategy .content') as HTMLDivElement;
const financialAnalysisContent = document.querySelector('#financial-analysis .content') as HTMLDivElement;
const competitorAnalysisContent = document.querySelector('#competitor-analysis .content') as HTMLDivElement;


let currentLandingPageHtml = ''; // To store the raw HTML of the landing page
let currentPlanTextContent = ''; // To store text version of the plan for the assistant

// AI Business Assistant Modal Elements
const openAssistantButton = document.getElementById('open-assistant-button') as HTMLButtonElement;
const assistantModal = document.getElementById('assistant-modal') as HTMLDivElement;
const closeAssistantModalButton = document.getElementById('close-assistant-modal-button') as HTMLButtonElement;
const assistantChatHistory = document.getElementById('assistant-chat-history') as HTMLDivElement;
const assistantUserInput = document.getElementById('assistant-user-input') as HTMLTextAreaElement;
const sendAssistantMessageButton = document.getElementById('send-assistant-message-button') as HTMLButtonElement;
const assistantLoadingIndicator = document.getElementById('assistant-loading-indicator') as HTMLDivElement;
let businessAssistantChat: Chat | null = null;

// Customer-Facing Bot Script Elements
const generateClientBotScriptButton = document.getElementById('generate-client-bot-script-button') as HTMLButtonElement;
const clientBotScriptOutput = document.getElementById('client-bot-script-output') as HTMLDivElement;
const clientBotScriptCode = document.getElementById('client-bot-script-code') as HTMLElement;
const clientBotLoadingIndicator = document.getElementById('client-bot-loading-indicator') as HTMLDivElement;

// Customer Service AI Chat Modal (Prospecting) Elements
const openCustomerChatButton = document.getElementById('open-customer-chat-button') as HTMLButtonElement;
const customerChatModal = document.getElementById('customer-chat-modal') as HTMLDivElement;
const closeCustomerChatModalButton = document.getElementById('close-customer-chat-modal-button') as HTMLButtonElement;
const customerChatHistory = document.getElementById('customer-chat-history') as HTMLDivElement;
const customerChatUserInput = document.getElementById('customer-chat-user-input') as HTMLTextAreaElement;
const sendCustomerChatMessageButton = document.getElementById('send-customer-chat-message-button') as HTMLButtonElement;
const customerChatLoadingIndicator = document.getElementById('customer-chat-loading-indicator') as HTMLDivElement;
let customerProspectingChat: Chat | null = null;
let companyProfileForCustomerChat: string | null = null;

// Post-Purchase Bot Modal Elements
const openPostPurchaseBotButton = document.getElementById('open-post-purchase-bot-button') as HTMLButtonElement;
const postPurchaseBotModal = document.getElementById('post-purchase-bot-modal') as HTMLDivElement;
const closePostPurchaseBotButton = document.getElementById('close-post-purchase-bot-button') as HTMLButtonElement;
const postPurchaseBotChatHistory = document.getElementById('post-purchase-bot-chat-history') as HTMLDivElement;
const postPurchaseBotUserInput = document.getElementById('post-purchase-bot-user-input') as HTMLTextAreaElement;
const sendPostPurchaseBotMessageButton = document.getElementById('send-post-purchase-bot-message-button') as HTMLButtonElement;
const postPurchaseBotLoadingIndicator = document.getElementById('post-purchase-bot-loading-indicator') as HTMLDivElement;
let postPurchaseSupportChat: Chat | null = null;

// --- START AUTH LOGIC ---
let isLoggedIn = false;
let loggedInUserEmail: string | null = null;
let currentUserCredits = 0;

function updateAuthUI() {
    loginErrorMessage.classList.add('hidden');
    registerErrorMessage.classList.add('hidden');
    authSuccessMessage.classList.add('hidden');

    if (isLoggedIn) {
        appContentWrapper.classList.remove('hidden');
        loginButton.classList.add('hidden');
        logoutButton.classList.remove('hidden');
        buyCreditsButton.classList.remove('hidden');
        userCreditsDisplayElement.classList.remove('hidden');
        welcomeMessageSpan.textContent = `Bem-vindo(a), ${loggedInUserEmail}!`;
        welcomeMessageSpan.classList.remove('hidden');
        userCreditsDisplayElement.textContent = `Seus Créditos: ${currentUserCredits}`;
        authModal.classList.add('hidden'); // Close auth modal on successful login/state update
    } else {
        appContentWrapper.classList.add('hidden');
        loginButton.classList.remove('hidden');
        logoutButton.classList.add('hidden');
        buyCreditsButton.classList.add('hidden');
        userCreditsDisplayElement.classList.add('hidden');
        welcomeMessageSpan.classList.add('hidden');
        welcomeMessageSpan.textContent = '';
        userCreditsDisplayElement.textContent = `Seus Créditos: 0`;
        // Do not show authModal by default, only on click
    }
}

function showAuthModal(view: 'login' | 'register' = 'login') {
    authModal.classList.remove('hidden');
    loginErrorMessage.classList.add('hidden');
    registerErrorMessage.classList.add('hidden');
    authSuccessMessage.classList.add('hidden');
    loginForm.reset();
    registerForm.reset();

    if (view === 'login') {
        authModalTitle.textContent = 'Acessar Plataforma';
        loginView.classList.remove('hidden');
        registerView.classList.add('hidden');
        loginEmailInput.focus();
    } else {
        authModalTitle.textContent = 'Criar Nova Conta';
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
        registerNameInput.focus();
    }
}

function handleLogin(event: Event) {
    event.preventDefault();
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    loginErrorMessage.classList.add('hidden');
    authSuccessMessage.classList.add('hidden');

    if (email && password) {
        isLoggedIn = true;
        loggedInUserEmail = email;
        // Check if user already has credits, otherwise assign default
        const existingCredits = localStorage.getItem(`userCredits_${email}`);
        currentUserCredits = existingCredits ? parseInt(existingCredits, 10) : DEFAULT_WELCOME_CREDITS;
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUserEmail', email);
        localStorage.setItem(`userCredits_${email}`, currentUserCredits.toString());
        updateAuthUI();
        if (!API_KEY) {
            console.warn("Login successful, but API_KEY is missing. Core features may not work.");
        }
    } else {
        loginErrorMessage.textContent = 'Por favor, insira email e senha válidos.';
        loginErrorMessage.classList.remove('hidden');
    }
}

function handleRegistration(event: Event) {
    event.preventDefault();
    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;
    const confirmPassword = registerConfirmPasswordInput.value;

    registerErrorMessage.classList.add('hidden');
    authSuccessMessage.classList.add('hidden');

    if (!name || !email || !password || !confirmPassword) {
        registerErrorMessage.textContent = 'Todos os campos são obrigatórios.';
        registerErrorMessage.classList.remove('hidden');
        return;
    }
    if (password !== confirmPassword) {
        registerErrorMessage.textContent = 'As senhas não coincidem.';
        registerErrorMessage.classList.remove('hidden');
        return;
    }

    // Simulated registration success - give new users default credits
    console.log(`Simulated registration for: ${name}, ${email}`);
    currentUserCredits = DEFAULT_WELCOME_CREDITS; // Assign default credits
    localStorage.setItem(`userCredits_${email}`, currentUserCredits.toString()); // Save credits for this new user
    // Note: In a real app, you'd save this to a backend database.
    // For this simulation, we're not automatically logging them in after registration.

    authSuccessMessage.textContent = `Cadastro realizado com sucesso! Você recebeu ${DEFAULT_WELCOME_CREDITS} créditos de boas-vindas. Faça login para começar.`;
    authSuccessMessage.classList.remove('hidden');
    
    setTimeout(() => {
        showAuthModal('login');
        loginEmailInput.value = email; 
        loginPasswordInput.focus();
    }, 2500); // Increased delay for message visibility
}


function handleLogout() {
    if (loggedInUserEmail) {
        // Option: Save current credits before logout, or reset them.
        // For this simulation, we keep them in localStorage associated with the email.
        // localStorage.setItem(`userCredits_${loggedInUserEmail}`, currentUserCredits.toString());
    }
    isLoggedIn = false;
    loggedInUserEmail = null;
    currentUserCredits = 0; // Reset local variable, actual credits are still in localStorage by email
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUserEmail'); // Or keep this if you want to prefill login form next time

    currentPlanTextContent = ''; 
    if (businessAssistantChat) { businessAssistantChat = null; }
    if (customerProspectingChat) { customerProspectingChat = null; }
    if (postPurchaseSupportChat) { postPurchaseSupportChat = null; }
    updateAuthUI();
}

function checkInitialAuthState() {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const storedEmail = localStorage.getItem('loggedInUserEmail');
    if (storedIsLoggedIn === 'true' && storedEmail) {
        isLoggedIn = true;
        loggedInUserEmail = storedEmail;
        const storedCredits = localStorage.getItem(`userCredits_${storedEmail}`);
        currentUserCredits = storedCredits ? parseInt(storedCredits, 10) : DEFAULT_WELCOME_CREDITS;
    } else {
        isLoggedIn = false;
        loggedInUserEmail = null;
        currentUserCredits = 0;
    }
    updateAuthUI();
}

loginButton.addEventListener('click', () => showAuthModal('login'));
logoutButton.addEventListener('click', handleLogout);
closeAuthModalButton.addEventListener('click', () => {
    authModal.classList.add('hidden');
});

loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegistration);

showRegisterViewButton.addEventListener('click', () => showAuthModal('register'));
showLoginViewButton.addEventListener('click', () => showAuthModal('login'));

checkInitialAuthState();
// --- END AUTH LOGIC ---

// --- START BUY CREDITS LOGIC ---
buyCreditsButton.addEventListener('click', () => {
    buyCreditsModal.classList.remove('hidden');
    creditsPackageSelectionView.classList.remove('hidden');
    paymentFormSectionView.classList.add('hidden');
    purchaseSuccessMessage.classList.add('hidden');
    paymentErrorMessage.classList.add('hidden');
    paymentForm.reset();
});

closeBuyCreditsModalButton.addEventListener('click', () => {
    buyCreditsModal.classList.add('hidden');
});

creditPackageCards.forEach(card => {
    card.addEventListener('click', () => {
        const credits = card.getAttribute('data-credits');
        const price = card.getAttribute('data-price');
        // Store selected package data for the payment form
        paymentForm.setAttribute('data-selected-credits', credits || '0');
        
        selectedCardInfo.textContent = `Pacote Selecionado: ${credits} créditos por R$ ${price}`;
        
        creditsPackageSelectionView.classList.add('hidden');
        paymentFormSectionView.classList.remove('hidden');
        purchaseSuccessMessage.classList.add('hidden');
        paymentErrorMessage.classList.add('hidden');
        cardNameInput.focus();
    });
});

backToPackagesButton.addEventListener('click', () => {
    creditsPackageSelectionView.classList.remove('hidden');
    paymentFormSectionView.classList.add('hidden');
    purchaseSuccessMessage.classList.add('hidden');
    paymentErrorMessage.classList.add('hidden');
});


paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    paymentErrorMessage.classList.add('hidden');
    purchaseSuccessMessage.classList.add('hidden');

    const cardName = cardNameInput.value.trim();
    const cardNumber = cardNumberInput.value.trim();
    const cardExpiry = cardExpiryInput.value.trim();
    const cardCvv = cardCvvInput.value.trim();

    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        paymentErrorMessage.textContent = 'Todos os campos de pagamento são obrigatórios.';
        paymentErrorMessage.classList.remove('hidden');
        return;
    }
    
    cardNumberInput.value = cardNumber.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, "$1 ");

    const creditsToAddStr = paymentForm.getAttribute('data-selected-credits');
    const creditsToAdd = creditsToAddStr ? parseInt(creditsToAddStr, 10) : 0;

    if (creditsToAdd > 0 && loggedInUserEmail) {
        currentUserCredits += creditsToAdd;
        localStorage.setItem(`userCredits_${loggedInUserEmail}`, currentUserCredits.toString());
        updateAuthUI(); // Update credit display in header
        
        console.log(`Simulating credit purchase: ${creditsToAdd} credits added for ${loggedInUserEmail}. New balance: ${currentUserCredits}`);
        paymentFormSectionView.classList.add('hidden');
        purchaseSuccessMessage.textContent = `Compra de ${creditsToAdd} créditos realizada com sucesso! Seu novo saldo é ${currentUserCredits}. (Simulação)`;
        purchaseSuccessMessage.classList.remove('hidden');

        setTimeout(() => {
            buyCreditsModal.classList.add('hidden');
        }, 3000);
    } else {
        paymentErrorMessage.textContent = 'Erro ao processar a compra. Tente novamente.';
        paymentErrorMessage.classList.remove('hidden');
        console.error('Error processing purchase: No credits to add or user not logged in.');
    }
});

cardNumberInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, "$1 ");
});
cardExpiryInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.substring(0,2) + '/' + value.substring(2,4);
    }
    target.value = value;
});

// --- END BUY CREDITS LOGIC ---


// Helper function to show loading state
function showLoading(isLoading: boolean) {
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
        generateButton.disabled = true;
        outputSection.classList.add('hidden');
        additionalAiResourcesSection.classList.add('hidden');
        generationStatsDiv.classList.add('hidden'); // Hide stats during new generation
    } else {
        loadingIndicator.classList.add('hidden');
        generateButton.disabled = false;
    }
}

// Helper to sanitize HTML content from AI
function sanitizeHtml(htmlString: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    // Basic sanitization: remove script and style tags, and event handlers
    const elementsToRemove = tempDiv.querySelectorAll('script, style');
    elementsToRemove.forEach(el => el.remove());
    
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
        for (const attr of Array.from(el.attributes)) {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        }
    });
    return tempDiv.innerHTML;
}


function escapeHtml(unsafe: string): string {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function formatTextToHtml(text: string): string {
    if (typeof text !== 'string') return '<p class="error-message">Conteúdo inválido recebido.</p>';

    // Replace [[highlight:text]] with <span class="highlight-text">text</span>
    text = text.replace(/\[\[highlight:(.*?)\]\]/g, '<span class="highlight-text">$1</span>');
    
    // Convert markdown-like bold and italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');       // Italic

    // Convert markdown-like headings
    text = text.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    text = text.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Convert markdown-like unordered lists
    text = text.replace(/^\s*[-*+] (.*$)/gim, '<li>$1</li>');
    text = text.replace(/<\/li>\n<li>/gim, '</li><li>'); // Fix newlines between list items
    text = text.replace(/((<li>.*<\/li>\s*)+)/gim, '<ul>$1</ul>');
    // text = text.replace(/<\/ul>\s*<ul>/gim, ''); // Combine adjacent lists - careful with this

    // Convert markdown-like ordered lists
    text = text.replace(/^\s*\d+\. (.*$)/gim, '<oli>$1</oli>'); // Use <oli> temporarily
    text = text.replace(/<\/oli>\n<oli>/gim, '</oli><oli>');
    text = text.replace(/((<oli>.*<\/oli>\s*)+)/gim, '<ol>$1</ol>');
    text = text.replace(/<oli>/g, '<li>').replace(/<\/oli>/g, '</li>');

    // Paragraphs: Wrap lines that are not part of other structures in <p> tags
    // This is tricky and can be aggressive. A simpler approach is to split by double newlines.
    const blocks = text.split(/\n\s*\n/);
    return blocks.map(block => {
        block = block.trim();
        if (!block) return '';
        if (block.startsWith('<ul>') || block.startsWith('<ol>') || 
            block.startsWith('<h1>') || block.startsWith('<h2>') || 
            block.startsWith('<h3>') || block.startsWith('<h4>') ||
            block.startsWith('<h5>') || block.startsWith('<h6>') ||
            block.startsWith('<p>') || block.startsWith('<table>') ||
            block.startsWith('<div class="timeline">') || block.startsWith('<div class="flowchart">') || block.startsWith('<div class="financial-chart-container">')
        ) {
            return block; // Already formatted block
        }
        return `<p>${block}</p>`;
    }).join('');
}


// Function to render content safely
function renderContent(element: HTMLDivElement | null, content: string | undefined, type: 'html' | 'text' | 'preformatted' | 'special' = 'html') {
    if (element) {
        if (typeof content === 'undefined' || content === null) {
            element.innerHTML = '<p class="content-placeholder">Nenhum conteúdo gerado para esta seção.</p>';
            return;
        }
        if (content.trim() === '') {
            element.innerHTML = '<p class="content-placeholder">Conteúdo vazio gerado.</p>';
            return;
        }
        
        element.classList.remove('content-placeholder'); // Ensure placeholder class is removed
        
        switch (type) {
            case 'html':
                // For HTML that might come from the AI, ensure it's sanitized if it's not custom generated by us.
                // Assuming content here is generated by our custom prompt structures which are safe.
                // If it were user-generated or less controlled AI output, sanitization would be critical.
                element.innerHTML = content; // If AI provides HTML, it might need sanitization
                break;
            case 'text':
                element.innerHTML = formatTextToHtml(content);
                break;
            case 'preformatted':
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.textContent = content;
                pre.appendChild(code);
                element.innerHTML = ''; // Clear previous content
                element.appendChild(pre);
                break;
            case 'special': // For cases where content is already structured (e.g., specific visualizers)
                 element.innerHTML = content; // The content is already prepared HTML by a special renderer
                 break;
            default:
                element.textContent = content; // Fallback to textContent for safety
        }
    } else {
        console.warn('Attempted to render content to a null element.');
    }
}

async function callGenerativeAI(prompt: string, sectionIdentifier: string, isJsonExpected = false): Promise<string> {
    if (!ai) {
        console.error("GoogleGenAI not initialized. API_KEY might be missing.");
        throw new Error("API_KEY_MISSING");
    }
    console.log(`Generating content for: ${sectionIdentifier} (JSON: ${isJsonExpected})`);
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: isJsonExpected ? { responseMimeType: "application/json" } : {}
        });

        const textResponse = response.text;
        if (!textResponse) {
            console.error(`Empty response from AI for ${sectionIdentifier}.`);
            return Promise.reject(`Empty response from AI for ${sectionIdentifier}.`);
        }
        
        // Update usage stats based on the response, if available
        if (response.usageMetadata) {
            updateTotalUsageStats(response.usageMetadata);
        }


        if (isJsonExpected) {
            let jsonStr = textResponse.trim();
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
                jsonStr = match[2].trim();
            }
            try {
                // The AI might return an object or an array of objects. We expect a stringifiable JSON.
                JSON.parse(jsonStr); // Validate JSON
                return jsonStr; // Return the stringified JSON
            } catch (e) {
                console.error(`Failed to parse JSON for ${sectionIdentifier}:`, e, "\nReceived:", textResponse);
                return Promise.reject(`Invalid JSON response for ${sectionIdentifier}.`);
            }
        }
        return textResponse;
    } catch (error) {
        console.error(`Error calling Generative AI for ${sectionIdentifier}:`, error);
        // @ts-ignore
        const errorMessage = error.message || 'Unknown API error';
        if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('permission')) {
             return Promise.reject('API_KEY_INVALID');
        }
        return Promise.reject(`API Error for ${sectionIdentifier}: ${errorMessage}`);
    }
}


function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let totalTokensAccumulated = 0;
// Function to update token stats
function updateTotalUsageStats(usageMetadata?: UsageMetadata) {
    if (usageMetadata) {
        // totalTokenCount is the sum of promptTokenCount and candidatesTokenCount for this specific call
        totalTokensAccumulated += (usageMetadata.totalTokenCount || 0);
    }
    // For generateContent, actual tokens are not directly in response object in the same way.
    // This is a rough estimation or placeholder.
    // A more accurate way might involve parsing the response or if the SDK provides it differently for this method.
    totalTokensValueSpan.textContent = `${totalTokensAccumulated} (Estimado)`;

    // Simulated cost: $0.00015 per 1K input tokens, $0.0005 per 1K output tokens for Flash (example pricing)
    // This is highly simplified and for demonstration.
    const estimatedCost = (totalTokensAccumulated / 1000) * 0.0003; // Average example
    generationCostValueSpan.textContent = `R$ ${estimatedCost.toFixed(4)}`;
    generationStatsDiv.classList.remove('hidden');
}


async function generateLandingPageHTML(formData: FormData): Promise<string> {
    if (!ai) throw new Error("API_KEY_MISSING");
    const companyName = formData.get('company-name') as string;
    const businessIdea = formData.get('business-idea') as string;
    const productDescription = formData.get('product-description') as string;

    const prompt = `
    Crie o código HTML COMPLETO para uma landing page moderna e atraente para a empresa "${companyName}", com a ideia de negócio "${businessIdea}".
    Descrição dos produtos/serviços: "${productDescription}".
    Requisitos:
    - Inclua um cabeçalho (header) com o nome da empresa e um slogan.
    - Uma seção "Sobre Nós" (About Us) breve.
    - Uma seção destacando os principais produtos/serviços com descrições curtas e botões "Saiba Mais" (placeholders, sem links reais).
    - Uma seção de "Chamada para Ação" (Call to Action - CTA) com um formulário de contato simples (Nome, Email, Mensagem) e um botão "Enviar". Não implemente o envio do formulário, apenas a estrutura HTML.
    - Um rodapé (footer) com informações de copyright.
    - ESTILO: Use CSS inline DENTRO de tags <style> no <head> do HTML. O CSS deve ser moderno, responsivo e visualmente atraente. Use cores, fontes e layout que transmitam profissionalismo e inovação. Paleta de cores sugerida: tons de azul, verde ou roxo com branco/cinza claro para texto e fundos escuros ou claros, o que for mais esteticamente agradável e profissional.
    - ESTRUTURA: HTML5 semântico. Deve ser um documento HTML completo (<!DOCTYPE html><html><head>...</head><body>...</body></html>).
    - Não use JavaScript externo ou frameworks de CSS externos (como Bootstrap/Tailwind). Todo o CSS deve estar na tag <style>.
    - IMAGENS: Inclua 2-4 tags <img> em locais estratégicos (ex: logo no header, imagem de herói, imagem na seção "Sobre Nós", imagem para produto/serviço).
        - Para cada <img>:
            - Use src="#" como placeholder inicial.
            - Adicione um 'id' único (ex: id="lp-image-hero", id="lp-image-about").
            - Adicione um atributo 'data-image-prompt' contendo uma descrição DETALHADA e OTIMIZADA para uma IA de geração de imagem (como Imagen). Este prompt deve ser específico para a imagem desejada naquele local. Por exemplo: "Um logotipo minimalista e moderno para uma empresa de tecnologia chamada '${companyName}', usando tons de azul e verde, simbolizando crescimento e inovação." ou "Uma imagem de herói vibrante mostrando pessoas diversas colaborando em um projeto de horta urbana comunitária, com foco em tecnologia e sustentabilidade."
            - Adicione um atributo 'alt' descritivo para acessibilidade.
    - O conteúdo textual deve ser conciso e persuasivo.
    - Garanta que a página seja minimamente responsiva usando media queries dentro da tag <style>.
    Retorne APENAS o código HTML completo. Não adicione nenhum texto explicativo antes ou depois do código.
    `;
    try {
        const response = await ai.models.generateContent({ model: model, contents: prompt });
        let htmlContent = response.text;
         if (response.usageMetadata) { updateTotalUsageStats(response.usageMetadata); }
        
        // Ensure it starts with <!DOCTYPE html>
        if (!htmlContent.toLowerCase().startsWith('<!doctype html>')) {
            const doctypeMatch = htmlContent.match(/<!DOCTYPE html>/i);
            if (doctypeMatch) {
                htmlContent = htmlContent.substring(doctypeMatch.index!);
            } else {
                 console.warn("Landing page HTML missing DOCTYPE. Prepending it.");
                 htmlContent = "<!DOCTYPE html>\n" + htmlContent;
            }
        }
         // Remove markdown fences if present
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = htmlContent.match(fenceRegex);
        if (match && match[2]) {
            htmlContent = match[2].trim();
        }

        return htmlContent;
    } catch (error) {
        console.error('Error generating landing page HTML:', error);
        // @ts-ignore
        const errorMessage = error.message || 'Unknown API error';
        if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('permission')) {
             throw new Error('API_KEY_INVALID');
        }
        throw new Error('Failed to generate landing page HTML.');
    }
}


function renderLandingPage(htmlContent: string) {
    if (landingPagePreviewContent) {
        // currentLandingPageHtml is updated after images are processed
        const iframe = document.createElement('iframe');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin'); 
        iframe.setAttribute('srcdoc', htmlContent);
        iframe.style.width = '100%';
        iframe.style.minHeight = '700px'; 
        iframe.style.border = 'none';
        
        landingPagePreviewContent.innerHTML = ''; // Clear previous content
        landingPagePreviewContent.appendChild(iframe);
    }
}


// --- START Financial Projection Visualization ---
interface FinancialMonthData {
    mes: string;
    receitaEstimada: number;
    custosOperacionais: number;
    lucroPrejuizo: number;
}

interface FinancialProjectionData {
    titulo: string;
    descricao?: string;
    moeda: string;
    projecoesMensais: FinancialMonthData[];
    analiseGeral?: string;
}

function renderFinancialProjection(data: FinancialProjectionData, container: HTMLElement) {
    if (!data || !data.projecoesMensais || data.projecoesMensais.length === 0) {
        container.innerHTML = '<p class="content-placeholder">Dados de projeção financeira insuficientes ou inválidos.</p>';
        return;
    }

    let maxAbsoluteValue = 0;
    data.projecoesMensais.forEach(month => {
        maxAbsoluteValue = Math.max(maxAbsoluteValue, Math.abs(month.receitaEstimada), Math.abs(month.custosOperacionais), Math.abs(month.lucroPrejuizo));
    });
    if (maxAbsoluteValue === 0) maxAbsoluteValue = 1; // Avoid division by zero for bar width calculation if all values are 0

    const tableRows = data.projecoesMensais.map(month => `
        <tr>
            <td>${escapeHtml(month.mes)}</td>
            <td>${data.moeda} ${month.receitaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${data.moeda} ${month.custosOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="color: ${month.lucroPrejuizo >= 0 ? 'var(--accent-secondary)' : '#e57373'};">${data.moeda} ${month.lucroPrejuizo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
    `).join('');

    const chartHtml = data.projecoesMensais.map(month => {
        const receitaWidth = (Math.abs(month.receitaEstimada) / maxAbsoluteValue) * 100;
        const custosWidth = (Math.abs(month.custosOperacionais) / maxAbsoluteValue) * 100;
        const lucroWidth = (Math.abs(month.lucroPrejuizo) / maxAbsoluteValue) * 100;
        const lucroColor = month.lucroPrejuizo >= 0 ? 'var(--accent-primary)' : '#e57373';

        return `
        <div class="chart-month-data">
            <h5 class="month-name">${escapeHtml(month.mes)}</h5>
            <div class="bars-container">
                <div class="bar-group">
                    <span class="bar-label">Receita:</span>
                    <div class="bar receita" style="width: ${receitaWidth}%;">${data.moeda} ${month.receitaEstimada.toLocaleString('pt-BR')}</div>
                </div>
                <div class="bar-group">
                    <span class="bar-label">Custos:</span>
                    <div class="bar custos" style="width: ${custosWidth}%;">${data.moeda} ${month.custosOperacionais.toLocaleString('pt-BR')}</div>
                </div>
                <div class="bar-group">
                    <span class="bar-label">Lucro/Prejuízo:</span>
                    <div class="bar lucro" style="width: ${lucroWidth}%; background-color: ${lucroColor};">${data.moeda} ${month.lucroPrejuizo.toLocaleString('pt-BR')}</div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    const htmlContent = `
        <h4>${escapeHtml(data.titulo)}</h4>
        ${data.descricao ? `<p>${formatTextToHtml(data.descricao)}</p>` : ''}
        
        <h5>Tabela Detalhada (${escapeHtml(data.moeda)}):</h5>
        <div style="overflow-x:auto;">
            <table class="financial-table">
                <thead>
                    <tr>
                        <th>Mês</th>
                        <th>Receita Estimada</th>
                        <th>Custos Operacionais</th>
                        <th>Lucro/Prejuízo</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>

        <h5>Visualização Gráfica Mensal:</h5>
        <div class="financial-chart-container">
            ${chartHtml}
        </div>
        ${data.analiseGeral ? `<h5>Análise Geral:</h5>${formatTextToHtml(data.analiseGeral)}` : ''}
    `;
    container.innerHTML = htmlContent;
}
// --- END Financial Projection Visualization ---


// --- START Customer Service Flowchart Visualization ---
interface FlowchartNode {
    id: string;
    type: 'step' | 'decision' | 'terminal'; // step, decision, terminal (start/end)
    label: string;
    next?: string; // For step and terminal (if not end)
    yesPath?: string; // For decision
    noPath?: string; // For decision
}
interface FlowchartData {
    titulo: string;
    descricao?: string;
    nodes: FlowchartNode[];
    startNode: string;
}

function renderFlowchart(data: FlowchartData, container: HTMLElement) {
    if (!data || !data.nodes || data.nodes.length === 0 || !data.startNode) {
        container.innerHTML = '<p class="content-placeholder">Dados de fluxograma insuficientes ou inválidos.</p>';
        return;
    }

    const nodesMap = new Map(data.nodes.map(node => [node.id, node]));

    function buildPathHtml(nodeId: string | undefined): string {
        if (!nodeId) return '';
        const node = nodesMap.get(nodeId);
        if (!node) return `<p class="error-message">Erro: Nó ${nodeId} não encontrado.</p>`;

        let html = `<div class="flow-${node.type}" data-id="${escapeHtml(node.id)}">${formatTextToHtml(node.label)}</div>`;

        if (node.type === 'step' || (node.type === 'terminal' && node.next)) {
            if (node.next) {
                html += `<span class="flow-arrow global-down-arrow">↓</span>`;
                html += buildPathHtml(node.next);
            }
        } else if (node.type === 'decision') {
            html += `<span class="flow-arrow global-down-arrow">↓</span>`;
            html += `<div class="flow-paths">`;
            html += `<div class="flow-path">
                        <span class="flow-arrow-label">Sim</span>
                        <span class="flow-arrow">↘</span>
                        ${buildPathHtml(node.yesPath)}
                     </div>`;
            html += `<div class="flow-path">
                        <span class="flow-arrow-label">Não</span>
                        <span class="flow-arrow">↙</span>
                        ${buildPathHtml(node.noPath)}
                     </div>`;
            html += `</div>`;
        }
        return html;
    }

    const flowchartHtml = buildPathHtml(data.startNode);
    const finalHtml = `
        <h4>${escapeHtml(data.titulo)}</h4>
        ${data.descricao ? `<p>${formatTextToHtml(data.descricao)}</p>` : ''}
        <div class="flowchart">
            ${flowchartHtml}
        </div>
    `;
    container.innerHTML = finalHtml;
}
// --- END Customer Service Flowchart Visualization ---

// --- START Action Plan Timeline Visualization ---
interface TimelineTask {
    descricao: string;
    metaRelacionada?: string; // e.g. "Aumentar engajamento"
}
interface TimelineWeek {
    semana: string; // e.g., "Semana 1-2"
    focoPrincipal: string;
    metas: string[];
    tarefas: TimelineTask[];
    entregavelEsperado: string;
}
interface ActionPlanData {
    titulo: string;
    descricao?: string;
    planoSemanas: TimelineWeek[];
}

function renderActionPlanTimeline(data: ActionPlanData, container: HTMLElement) {
    if (!data || !data.planoSemanas || data.planoSemanas.length === 0) {
        container.innerHTML = '<p class="content-placeholder">Dados do plano de ação insuficientes ou inválidos.</p>';
        return;
    }

    const weeksHtml = data.planoSemanas.map(week => {
        const metasHtml = week.metas.map(meta => `<li>${formatTextToHtml(meta)}</li>`).join('');
        const tarefasHtml = week.tarefas.map(task => `
            <li>
                ${formatTextToHtml(task.descricao)}
                ${task.metaRelacionada ? `<span class="task-meta"> (Meta: ${formatTextToHtml(task.metaRelacionada)})</span>` : ''}
            </li>`).join('');

        return `
            <div class="timeline-week">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <h4 class="week-title">${escapeHtml(week.semana)}: ${formatTextToHtml(week.focoPrincipal)}</h4>
                    ${metasHtml ? `<h5>Metas Chave:</h5><ul class="task-list">${metasHtml}</ul>` : ''}
                    ${tarefasHtml ? `<h5>Tarefas Principais:</h5><ul class="task-list">${tarefasHtml}</ul>` : ''}
                    <h5>Entregável Esperado:</h5>
                    <div class="entregavel-esperado">${formatTextToHtml(week.entregavelEsperado)}</div>
                </div>
            </div>
        `;
    }).join('');

    const finalHtml = `
        <h4>${escapeHtml(data.titulo)}</h4>
        ${data.descricao ? `<p>${formatTextToHtml(data.descricao)}</p>` : ''}
        <div class="timeline">
            ${weeksHtml}
        </div>
    `;
    container.innerHTML = finalHtml;
}
// --- END Action Plan Timeline Visualization ---

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isLoggedIn) {
        alert("Por favor, faça login para gerar um plano de negócios.");
        showAuthModal('login');
        return;
    }
    if (!ai) {
        renderContent(businessOverviewContent, '<p class="error-message"><strong>Erro Crítico:</strong> A chave da API não foi configurada corretamente. Não é possível gerar o plano. Verifique a configuração da API_KEY.</p>');
        outputSection.classList.remove('hidden');
        return;
    }
    // TODO: Implement credit deduction logic here in a real system.
    // if (currentUserCredits < REQUIRED_CREDITS_FOR_PLAN) {
    //     alert("Você não tem créditos suficientes para gerar um plano. Por favor, compre mais créditos.");
    //     buyCreditsModal.classList.remove('hidden'); // Open buy credits modal
    //     return;
    // }


    showLoading(true);
    totalTokensAccumulated = 0; // Reset token count for new generation
    updateTotalUsageStats(); // Update UI to show reset count

    const formData = new FormData(form);
    const companyName = formData.get('company-name') as string;
    const businessIdea = formData.get('business-idea') as string;
    const numPackages = formData.get('num-packages') as string;
    let monthlyInvestment = formData.get('monthly-investment') as string; // Keep as string for now
    const targetRevenue = formData.get('target-revenue') as string;
    const detailLevel = formData.get('detail-level') as string;
    const productDescription = formData.get('product-description') as string;
    const operationalLevel = formData.get('operational-level') as string;
    const ownPremises = formData.get('own-premises') as string;

    let adjustedMonthlyInvestment = parseFloat(monthlyInvestment);
    let premisesInfoForPrompt = `Sede da empresa: ${ownPremises === 'yes' ? 'Espaço próprio/casa do usuário.' : 'Necessitará de espaço comercial/alugado.'}`;

    if (ownPremises === 'yes') {
        const originalInvestment = adjustedMonthlyInvestment;
        adjustedMonthlyInvestment *= 0.80; // Reduce by 20%
        if (adjustedMonthlyInvestment < 50) adjustedMonthlyInvestment = 50; // Ensure a minimum
        premisesInfoForPrompt += ` Investimento mensal original de R$ ${originalInvestment.toFixed(2)} foi ajustado para R$ ${adjustedMonthlyInvestment.toFixed(2)} devido ao uso de espaço próprio/casa.`;
    }


    // Clear previous outputs and show placeholders
    const contentPlaceholders = [
        businessOverviewContent, productPackagesContent, operationalStrategyContent,
        prospectingStrategyContent, contractTemplatesContent, landingPagePreviewContent,
        offersGenerationContent, organicGrowthStrategyContent, customerFunnelContent,
        monthlyGrowthProjectionContent, financialProjectionVisualizationContent, customerServiceFlowContent,
        customerServiceOrganizationContent, actionPlan30DaysContent, instagramStrategyContent, financialAnalysisContent,
        competitorAnalysisContent
    ];
    contentPlaceholders.forEach(el => {
        if (el) el.innerHTML = '<p class="content-placeholder">Gerando...</p>';
    });
    outputSection.classList.remove('hidden');
    additionalAiResourcesSection.classList.add('hidden'); // Hide until main plan is generated
    
    // Reset AI Assistant Chat
    businessAssistantChat = null;
    assistantChatHistory.innerHTML = '';
    currentPlanTextContent = '';


    // Store company profile for customer chat simulation
    companyProfileForCustomerChat = `Nome da Empresa: ${companyName}\nIdeia de Negócio: ${businessIdea}\nDescrição dos Produtos/Serviços: ${productDescription}`;


    const basePromptContext = `
    Você é um consultor de negócios especialista em criar planos de negócios detalhados para startups e pequenas empresas.
    Informações fornecidas pelo usuário:
    - Nome da Empresa: "${companyName}"
    - Ideia/Nicho de Negócio: "${businessIdea}"
    - Nº de Produtos/Serviços Principais: ${numPackages}
    - Descrição dos Produtos/Serviços Iniciais: "${productDescription}"
    - Investimento Mensal Estimado: R$ ${adjustedMonthlyInvestment.toFixed(2)} (Original: R$ ${monthlyInvestment})
    - ${premisesInfoForPrompt}
    - Receita Mensal Alvo: R$ ${targetRevenue}
    - Nível Operacional Principal: "${operationalLevel}" (Opções: terceirizacao_completa, terceirizacao_parcial, producao_propria)
    - Nível de Detalhamento Solicitado: "${detailLevel}" (Opções: extendido, medio, resumido)

    Instruções Gerais:
    - Use um tom profissional, encorajador e prático.
    - Formate a saída usando títulos (## H2, ### H3), listas (* item), negrito (**texto**) e itálico (*texto*).
    - Para tabelas, use um formato simples de markdown que possa ser facilmente convertido para HTML. Exemplo:
      | Cabeçalho 1 | Cabeçalho 2 |
      |-------------|-------------|
      | Linha 1 Col 1 | Linha 1 Col 2 |
      | Linha 2 Col 1 | Linha 2 Col 2 |
    - Use [[highlight:texto importante]] para destacar pontos cruciais que o usuário deve prestar atenção.
    - Adapte a profundidade e o volume do conteúdo ao "Nível de Detalhamento Solicitado". "Extendido" deve ser muito completo.
    - Moeda padrão: Real (R$).
    - Ao gerar listas, certifique-se de que cada item da lista comece em uma nova linha com o marcador apropriado (-, *, +, 1.).
    - Evite blocos de código markdown (\`\`\`) na resposta, a menos que seja especificamente para código HTML ou JSON.
    `;

    let accumulatedPlanText = `Contexto do Plano de Negócios para ${companyName}:\n`;

    try {
        // Section 1: Business Overview
        let prompt1 = `${basePromptContext}\nSeção: Visão Geral do Negócio.\nCrie uma visão geral concisa e inspiradora para "${companyName}". Inclua missão, visão, valores e os principais objetivos do negócio.`;
        const overview = await callGenerativeAI(prompt1, "Business Overview");
        renderContent(businessOverviewContent, overview, 'text');
        accumulatedPlanText += `\n\n## Visão Geral do Negócio\n${overview}`;
        await delay(generationDelayMs);

        // Section 2: Product Packages
        let prompt2 = `${basePromptContext}\nSeção: Produtos ou Serviços.\nDetalhe ${numPackages} pacote(s) de produto(s) ou serviço(s) iniciais, incluindo nome, descrição, características principais e preço sugerido (se aplicável, ou estratégia de precificação).`;
        const packages = await callGenerativeAI(prompt2, "Product Packages");
        renderContent(productPackagesContent, packages, 'text');
        accumulatedPlanText += `\n\n## Produtos ou Serviços\n${packages}`;
        await delay(generationDelayMs);

        // Section 3: Operational Strategy
        let prompt3 = `${basePromptContext}\nSeção: Estratégia Operacional.\nDescreva a estratégia operacional considerando o nível "${operationalLevel}" e o investimento de R$ ${adjustedMonthlyInvestment.toFixed(2)}. Detalhe processos chave, fornecedores (se aplicável), tecnologia necessária e equipe inicial.`;
        const opStrategy = await callGenerativeAI(prompt3, "Operational Strategy");
        renderContent(operationalStrategyContent, opStrategy, 'text');
        accumulatedPlanText += `\n\n## Estratégia Operacional\n${opStrategy}`;
        await delay(generationDelayMs);

        // Section 4: Prospecting Strategy
        let prompt4 = `${basePromptContext}\nSeção: Estratégia de Prospecção Inicial.\nSugira canais de prospecção (online e offline), público-alvo detalhado e primeiras ações para atrair clientes.`;
        const prospecting = await callGenerativeAI(prompt4, "Prospecting Strategy");
        renderContent(prospectingStrategyContent, prospecting, 'text');
        accumulatedPlanText += `\n\n## Estratégia de Prospecção Inicial\n${prospecting}`;
        await delay(generationDelayMs);

        // Section 5: Contract Templates Ideas
        let prompt5 = `${basePromptContext}\nSeção: Ideias para Modelos de Contrato.\nListe os principais tipos de contrato que a empresa pode precisar (ex: prestação de serviços, parceria, NDA) e os pontos chave que cada um deve cobrir. Não gere os contratos completos, apenas os tópicos e considerações.`;
        const contracts = await callGenerativeAI(prompt5, "Contract Templates");
        renderContent(contractTemplatesContent, contracts, 'text');
        accumulatedPlanText += `\n\n## Ideias para Modelos de Contrato\n${contracts}`;
        await delay(generationDelayMs);

        // Section 6: Landing Page
        renderContent(landingPagePreviewContent, '<p class="content-placeholder">Gerando estrutura da landing page...</p>', 'html');
        let initialLandingPageHtml = await generateLandingPageHTML(formData);
        renderLandingPage(initialLandingPageHtml); // Render initial structure

        if (ai) {
            renderContent(landingPagePreviewContent, '<p class="content-placeholder">Estrutura da landing page gerada. Gerando imagens agora...</p>', 'html');
            const parser = new DOMParser();
            const doc = parser.parseFromString(initialLandingPageHtml, 'text/html');
            const imageElements = Array.from(doc.querySelectorAll('img[data-image-prompt]'));
            const imagePromises = [];

            for (const imgElement of imageElements) {
                const imagePrompt = imgElement.getAttribute('data-image-prompt');
                const imageId = imgElement.getAttribute('id');
                if (imagePrompt && imageId) {
                    console.log(`Generating image for ID: ${imageId}, Prompt: "${imagePrompt}"`);
                    imagePromises.push(
                        ai.models.generateImages({
                            model: imageModel,
                            prompt: imagePrompt,
                            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
                        }).then(imageResponse => {
                            if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                                const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
                                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                                const targetImg = doc.getElementById(imageId) as HTMLImageElement | null;
                                if (targetImg) {
                                    targetImg.src = imageUrl;
                                    targetImg.removeAttribute('data-image-prompt'); // Clean up
                                    console.log(`Image generated and set for ID: ${imageId}`);
                                }
                            }
                        }).catch(err => {
                            console.error(`Failed to generate image for ID ${imageId}:`, err);
                            const targetImg = doc.getElementById(imageId) as HTMLImageElement | null;
                            if (targetImg) {
                                targetImg.alt += " (Erro ao gerar imagem)";
                            }
                        })
                    );
                }
            }
            try {
                await Promise.all(imagePromises);
                currentLandingPageHtml = new XMLSerializer().serializeToString(doc);
                renderLandingPage(currentLandingPageHtml); // Re-render with images
                renderContent(landingPagePreviewContent, '', 'html'); // Clear placeholder message by rendering empty (iframe is child)
                const iframe = landingPagePreviewContent.querySelector('iframe');
                if (iframe) iframe.srcdoc = currentLandingPageHtml; // ensure iframe gets the update
                else renderLandingPage(currentLandingPageHtml); // fallback if iframe somehow not found

            } catch (imageGenError) {
                console.error("Error during batch image generation for landing page:", imageGenError);
                renderContent(landingPagePreviewContent, '<p class="error-message">Erro ao gerar imagens para a landing page.</p>', 'html');
                // Use initial HTML without generated images if batch fails, or keep placeholders
                currentLandingPageHtml = initialLandingPageHtml; // Fallback to HTML without AI images
                renderLandingPage(currentLandingPageHtml);
            }
        } else {
             currentLandingPageHtml = initialLandingPageHtml; // AI not available
             renderLandingPage(currentLandingPageHtml);
        }
        await delay(generationDelayMs);


        // Section 7: Offers Generation
        let prompt7 = `${basePromptContext}\nSeção: Geração de Ofertas Iniciais.\nCrie 2-3 ofertas iniciais atraentes (ex: desconto de lançamento, pacote promocional, bônus por indicação) para impulsionar as primeiras vendas. Detalhe a oferta, o público e a duração sugerida.`;
        const offers = await callGenerativeAI(prompt7, "Offers Generation");
        renderContent(offersGenerationContent, offers, 'text');
        accumulatedPlanText += `\n\n## Geração de Ofertas Iniciais\n${offers}`;
        await delay(generationDelayMs);

        // Section 8: Organic Growth Strategy
        let prompt8 = `${basePromptContext}\nSeção: Estratégia de Crescimento Orgânico.\nSugira táticas de SEO, marketing de conteúdo e mídias sociais para crescimento orgânico a médio prazo.`;
        const organicGrowth = await callGenerativeAI(prompt8, "Organic Growth Strategy");
        renderContent(organicGrowthStrategyContent, organicGrowth, 'text');
        accumulatedPlanText += `\n\n## Estratégia de Crescimento Orgânico\n${organicGrowth}`;
        await delay(generationDelayMs);
        
        // Section 9: Customer Funnel
        let prompt9 = `${basePromptContext}\nSeção: Funil de Aquisição e Atendimento ao Cliente.\nDescreva as etapas do funil de vendas (Topo, Meio, Fundo) e como o atendimento ao cliente se integra em cada etapa para esta empresa. Identifique os principais pontos de contato com o cliente.`;
        const customerFunnel = await callGenerativeAI(prompt9, "Customer Funnel");
        renderContent(customerFunnelContent, customerFunnel, 'text');
        accumulatedPlanText += `\n\n## Funil de Aquisição e Atendimento\n${customerFunnel}`;
        await delay(generationDelayMs);

        // Section 10: Monthly Growth Projection
        let prompt10 = `${basePromptContext}\nSeção: Projeção de Crescimento Mensal (Primeiros 6 Meses).\nCrie uma tabela simples em markdown com projeções otimistas, realistas e pessimistas para os primeiros 6 meses em termos de número de clientes e receita, baseando-se no investimento de R$ ${adjustedMonthlyInvestment.toFixed(2)} e receita alvo. Formato da tabela: Mês | Cenário Otimista (Clientes, Receita) | Cenário Realista (Clientes, Receita) | Cenário Pessimista (Clientes, Receita).`;
        const monthlyGrowth = await callGenerativeAI(prompt10, "Monthly Growth Projection");
        renderContent(monthlyGrowthProjectionContent, monthlyGrowth, 'text'); 
        accumulatedPlanText += `\n\n## Projeção de Crescimento Mensal\n${monthlyGrowth}`;
        await delay(generationDelayMs);

        // Section 11: Financial Projection Visualization (JSON)
        const financialProjectionPrompt = `
            ${basePromptContext}
            Seção: Projeção Financeira Detalhada (12 Meses).
            Gere uma projeção financeira para os primeiros 12 meses.
            Responda em formato JSON. O objeto JSON deve ter a seguinte estrutura:
            {
              "titulo": "Projeção Financeira Detalhada - 12 Meses para ${companyName}",
              "descricao": "Uma análise das projeções de receita, custos e lucro para o primeiro ano de operação.",
              "moeda": "BRL", 
              "projecoesMensais": [ 
                {
                  "mes": "Mês 1", 
                  "receitaEstimada": 0, 
                  "custosOperacionais": 0, 
                  "lucroPrejuizo": 0 
                }
              ],
              "analiseGeral": "Um breve parágrafo resumindo as expectativas financeiras, principais desafios e oportunidades identificados na projeção."
            }
            Baseie os números no investimento mensal de R$ ${adjustedMonthlyInvestment.toFixed(2)} e na receita alvo de R$ ${targetRevenue}, distribuindo o crescimento ao longo dos 12 meses.
            Os custos operacionais devem ser realistas para uma startup no nicho "${businessIdea}".
            O lucro/prejuízo é a receita menos os custos.
            Retorne APENAS o objeto JSON. Não adicione nenhum texto explicativo antes ou depois do JSON.
        `;
        const financialProjectionJsonString = await callGenerativeAI(financialProjectionPrompt, "Financial Projection Visualization", true);
        try {
            const financialData = JSON.parse(financialProjectionJsonString) as FinancialProjectionData;
            renderFinancialProjection(financialData, financialProjectionVisualizationContent);
            accumulatedPlanText += `\n\n## Projeção Financeira Detalhada (12 Meses)\n${JSON.stringify(financialData, null, 2)}`; 
        } catch (e) {
            console.error("Error parsing financial projection JSON:", e);
            renderContent(financialProjectionVisualizationContent, `<p class="error-message">Erro ao processar dados da projeção financeira: ${escapeHtml(String(e))}<br>Conteúdo recebido: <pre>${escapeHtml(financialProjectionJsonString)}</pre></p>`, 'html');
        }
        await delay(generationDelayMs);


        // Section 12: Customer Service Flow (JSON for custom rendering)
        const customerServiceFlowPrompt = `
            ${basePromptContext}
            Seção: Fluxograma de Atendimento ao Cliente.
            Desenvolva um fluxograma básico para o processo de atendimento ao cliente, desde o primeiro contato até a resolução.
            Responda em formato JSON. O objeto JSON deve ter a seguinte estrutura:
            {
              "titulo": "Fluxograma de Atendimento ao Cliente para ${companyName}",
              "descricao": "Processo padrão para lidar com interações de clientes.",
              "startNode": "contato_inicial", 
              "nodes": [ 
                {
                  "id": "contato_inicial", 
                  "type": "terminal", 
                  "label": "Cliente Entra em Contato (ex: formulário, chat, email)",
                  "next": "triagem_demanda" 
                },
                {
                  "id": "triagem_demanda",
                  "type": "step",
                  "label": "Analisar e Categorizar Demanda (ex: dúvida, problema técnico, feedback)",
                  "next": "eh_simples"
                },
                {
                  "id": "eh_simples",
                  "type": "decision",
                  "label": "Demanda simples de resolver?",
                  "yesPath": "resolver_rapido", 
                  "noPath": "escalar_ou_investigar" 
                },
                {
                  "id": "resolver_rapido",
                  "type": "step",
                  "label": "Fornecer Solução Imediata/Informação",
                  "next": "confirmar_satisfacao"
                },
                {
                  "id": "escalar_ou_investigar",
                  "type": "step",
                  "label": "Investigar Detalhadamente ou Escalar para Nível Adequado",
                  "next": "comunicar_cliente_prazo"
                },
                {
                  "id": "comunicar_cliente_prazo",
                  "type": "step",
                  "label": "Comunicar ao Cliente Próximos Passos e Prazo Estimado",
                  "next": "resolver_complexo"
                },
                {
                  "id": "resolver_complexo",
                  "type": "step",
                  "label": "Implementar Solução para Demanda Complexa",
                  "next": "confirmar_satisfacao"
                },
                {
                  "id": "confirmar_satisfacao",
                  "type": "step",
                  "label": "Confirmar com o Cliente se a Demanda foi Resolvida e se está Satisfeito",
                  "next": "coletar_feedback_final"
                },
                {
                    "id": "coletar_feedback_final",
                    "type": "step",
                    "label": "Coletar Feedback sobre o Atendimento e Registrar",
                    "next": "fim_atendimento"
                },
                {
                  "id": "fim_atendimento",
                  "type": "terminal",
                  "label": "Fim do Atendimento / Registrar Informações"
                }
              ]
            }
            Adapte os rótulos e etapas para o nicho "${businessIdea}".
            Retorne APENAS o objeto JSON.
        `;
        const customerServiceFlowJsonString = await callGenerativeAI(customerServiceFlowPrompt, "Customer Service Flow", true);
        try {
            const flowchartData = JSON.parse(customerServiceFlowJsonString) as FlowchartData;
            renderFlowchart(flowchartData, customerServiceFlowContent);
            accumulatedPlanText += `\n\n## Fluxograma de Atendimento ao Cliente\n${JSON.stringify(flowchartData, null, 2)}`;
        } catch (e) {
            console.error("Error parsing customer service flow JSON:", e);
            renderContent(customerServiceFlowContent, `<p class="error-message">Erro ao processar dados do fluxograma: ${escapeHtml(String(e))}<br>Conteúdo recebido: <pre>${escapeHtml(customerServiceFlowJsonString)}</pre></p>`, 'html');
        }
        await delay(generationDelayMs);


        // Section 13: Customer Service Organization
        let prompt13 = `${basePromptContext}\nSeção: Organização do Atendimento ao Cliente.\nDescreva como o atendimento será estruturado (canais, ferramentas sugeridas, SLAs básicos, tom de voz da marca no atendimento).`;
        const customerServiceOrg = await callGenerativeAI(prompt13, "Customer Service Organization");
        renderContent(customerServiceOrganizationContent, customerServiceOrg, 'text');
        accumulatedPlanText += `\n\n## Organização do Atendimento ao Cliente\n${customerServiceOrg}`;
        await delay(generationDelayMs);

        // Section 14: Action Plan - 30 Days (JSON for custom rendering)
        const actionPlan30DaysPrompt = `
            ${basePromptContext}
            Seção: Plano de Ação Detalhado - Primeiros 30 Dias.
            Crie um plano de ação para os primeiros 30 dias, dividido em 4 semanas.
            Responda em formato JSON. O objeto JSON deve ter a seguinte estrutura:
            {
              "titulo": "Plano de Ação Detalhado - Primeiros 30 Dias para ${companyName}",
              "descricao": "Um guia prático com metas e tarefas semanais para o lançamento e crescimento inicial.",
              "planoSemanas": [ 
                {
                  "semana": "Semana 1", 
                  "focoPrincipal": "Configuração e Validação Inicial", 
                  "metas": ["Meta A da Semana 1", "Meta B da Semana 1"], 
                  "tarefas": [ 
                    {"descricao": "Registrar domínio e configurar emails.", "metaRelacionada": "Configuração"},
                    {"descricao": "Criar perfis básicos nas redes sociais chave.", "metaRelacionada": "Presença Online"}
                  ],
                  "entregavelEsperado": "Plataforma básica configurada e primeiras interações de validação." 
                }
              ]
            }
            O plano deve ser prático e focado em ações que gerem resultado rápido.
            Retorne APENAS o objeto JSON.
        `;
        const actionPlanJsonString = await callGenerativeAI(actionPlan30DaysPrompt, "Action Plan 30 Days", true);
        try {
            const actionPlanData = JSON.parse(actionPlanJsonString) as ActionPlanData;
            renderActionPlanTimeline(actionPlanData, actionPlan30DaysContent);
            accumulatedPlanText += `\n\n## Plano de Ação - 30 Dias\n${JSON.stringify(actionPlanData, null, 2)}`;
        } catch (e) {
            console.error("Error parsing action plan JSON:", e);
            renderContent(actionPlan30DaysContent, `<p class="error-message">Erro ao processar dados do plano de ação: ${escapeHtml(String(e))}<br>Conteúdo recebido: <pre>${escapeHtml(actionPlanJsonString)}</pre></p>`, 'html');
        }
        await delay(generationDelayMs);

        // Section 15: Instagram Strategy
        let prompt15 = `${basePromptContext}\nSeção: Estratégia de Conteúdo para Instagram (Foco em Reels).\nSugira 5 ideias de Reels para promover "${businessIdea}", incluindo tipo de conteúdo (educacional, divertido, bastidores), música/áudio sugerido (genérico, ex: "música em alta", "narração com voz IA") e um breve roteiro/descrição para cada Reel.`;
        const instaStrategy = await callGenerativeAI(prompt15, "Instagram Strategy");
        renderContent(instagramStrategyContent, instaStrategy, 'text');
        accumulatedPlanText += `\n\n## Estratégia de Conteúdo para Instagram (Reels)\n${instaStrategy}`;
        await delay(generationDelayMs);

        // Section 16: Financial Analysis (ROI, EBITDA)
        let prompt16 = `${basePromptContext}\nSeção: Análise Financeira Adicional.\nCom base no investimento mensal (R$ ${adjustedMonthlyInvestment.toFixed(2)}) e receita alvo (R$ ${targetRevenue}), forneça uma estimativa conceitual de ROI (Retorno Sobre Investimento) esperado nos primeiros 6-12 meses e uma breve explicação sobre o EBITDA (Lucros antes de juros, impostos, depreciação e amortização) e sua relevância para a empresa. Não faça cálculos complexos, mas explique como seriam calculados e a importância de acompanhá-los.`;
        const financialAnalysis = await callGenerativeAI(prompt16, "Financial Analysis");
        renderContent(financialAnalysisContent, financialAnalysis, 'text');
        accumulatedPlanText += `\n\n## Análise Financeira Adicional\n${financialAnalysis}`;
        await delay(generationDelayMs);

        // Section 17: Competitor Analysis
        let prompt17 = `${basePromptContext}\nSeção: Análise de Concorrência.\nAtue como um analista de mercado. Identifique 2 a 3 concorrentes principais (diretos ou indiretos) para o negócio "${businessIdea}". Para cada concorrente, analise brevemente: Pontos Fortes, Pontos Fracos e Estratégia de Preços. Com base nesta análise, sugira um Diferencial Competitivo Único (USP - Unique Selling Proposition) para a empresa "${companyName}".`;
        const competitorAnalysis = await callGenerativeAI(prompt17, "Competitor Analysis");
        renderContent(competitorAnalysisContent, competitorAnalysis, 'text');
        accumulatedPlanText += `\n\n## Análise de Concorrência\n${competitorAnalysis}`;
        

        // All main sections generated
        currentPlanTextContent = accumulatedPlanText; // Store for assistant

        // Show additional AI resources section
        additionalAiResourcesSection.classList.remove('hidden');
        // Reset additional resources outputs
        clientBotScriptOutput.classList.add('hidden');
        clientBotScriptCode.textContent = '';
        customerChatHistory.innerHTML = ''; // Clear previous prospecting chat
        postPurchaseBotChatHistory.innerHTML = ''; // Clear previous post-purchase chat

        // Deduct credits (simulated)
        // if (loggedInUserEmail) {
        //    currentUserCredits -= REQUIRED_CREDITS_FOR_PLAN; // Assuming REQUIRED_CREDITS_FOR_PLAN is defined
        //    localStorage.setItem(`userCredits_${loggedInUserEmail}`, currentUserCredits.toString());
        //    updateAuthUI();
        // }

    } catch (error) {
        console.error('Error generating business plan:', error);
        let userFriendlyError = `<p class="error-message"><strong>Ocorreu um erro ao gerar o plano de negócios.</strong>`;
        // @ts-ignore
        if (error.message && error.message.includes("API_KEY_INVALID")) {
            userFriendlyError += `<br>A chave da API fornecida é inválida ou não tem as permissões necessárias. Verifique sua chave e tente novamente.</p>`;
        // @ts-ignore
        } else if (error.message && error.message.includes("API_KEY_MISSING")) {
             userFriendlyError += `<br>A chave da API não foi configurada. Não é possível gerar o plano.</p>`;
        } else {
             // @ts-ignore
            userFriendlyError += `<br>Detalhe: ${escapeHtml(String(error.message || String(error)))}. Tente novamente mais tarde.</p>`;
        }
        // Display error in a prominent place, e.g., the first card
        if (businessOverviewContent) {
            renderContent(businessOverviewContent, userFriendlyError, 'html');
        } else {
            outputSection.innerHTML = userFriendlyError; // Fallback if the first card isn't available
        }
        outputSection.classList.remove('hidden'); // Ensure output section is visible to show the error
    } finally {
        showLoading(false);
    }
});


// --- Download Functions ---
function generateHtmlForDownload(theme: 'light' | 'dark' = 'light'): string {
    const allPlanCards = document.querySelectorAll('#output-section .plan-card');
    let planContentHtml = '';
    allPlanCards.forEach(card => {
        const titleElement = card.querySelector('.card-header h3');
        const contentElement = card.querySelector('.content');
        if (titleElement && contentElement) {
            const title = titleElement.textContent || 'Seção do Plano';
             // For landing page, get the iframe srcdoc if it's already rendered
            if (card.id === 'landing-page-preview' && currentLandingPageHtml) {
                 planContentHtml += `<section><h2>${escapeHtml(title)}</h2><div class="iframe-placeholder-for-download"><h4>Conteúdo da Landing Page (HTML completo abaixo):</h4><pre><code>${escapeHtml(currentLandingPageHtml.substring(0, 300))}...</code></pre></div></section><hr/>`;
            } else if (contentElement.querySelector('iframe')) { // general iframe catch, though landing page is specific
                planContentHtml += `<section><h2>${escapeHtml(title)}</h2><div><p>[Pré-visualização de Iframe - Conteúdo não incluído diretamente aqui]</p></div></section><hr/>`;
            }
            else {
                planContentHtml += `<section><h2>${escapeHtml(title)}</h2><div>${contentElement.innerHTML}</div></section><hr/>`;
            }
        }
    });
    
    // Include full landing page HTML at the end if it exists
    if (currentLandingPageHtml) {
        planContentHtml += `
            <section>
                <h2>HTML Completo da Landing Page Gerada</h2>
                <pre><code>${escapeHtml(currentLandingPageHtml)}</code></pre>
            </section>
        `;
    }


    const themeStyles = theme === 'dark' ? `
        body { background-color: #12121f; color: #e0e0e0; font-family: Inter, sans-serif; line-height: 1.6; margin:0; padding:0; }
        .container { max-width: 900px; margin: 20px auto; padding: 20px; background-color: #1a1a2e; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        h1, h2, h3, h4, h5, h6 { color: #00aaff; font-family: Orbitron, sans-serif; margin-top: 1.5em; margin-bottom: 0.5em;}
        h1 { font-size: 2.2em; text-align:center; border-bottom: 2px solid #00e0c4; padding-bottom: 0.5em; }
        h2 { font-size: 1.8em; color: #00e0c4; border-bottom: 1px solid #3a3a4f; padding-bottom: 0.3em;}
        h3 { font-size: 1.4em; }
        p { margin-bottom: 1em; }
        ul, ol { margin-left: 20px; margin-bottom: 1em; padding-left: 1.5em;}
        li { margin-bottom: 0.5em; }
        strong, b { color: #00e0c4; } /* Teal for dark theme bold */
        .highlight-text { background-color: rgba(0, 170, 255, 0.15); color: #00aaff; padding: 0.1em 0.4em; border-radius: 4px; font-weight: 500;}
        table.generated-table, .financial-table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.9em; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        table.generated-table th, .financial-table th { background-color: rgba(0, 170, 255, 0.15); color: #00aaff; font-weight: 600; padding: 0.75em 1em; border: 1px solid #3a3a4f; text-align: left; }
        table.generated-table td, .financial-table td { border: 1px solid #3a3a4f; padding: 0.75em 1em; color: #aabbcc; text-align: left;}
        table.generated-table tbody tr:nth-child(even), .financial-table tbody tr:nth-child(even) { background-color: rgba(255, 255, 255, 0.03); }
        hr { border: none; border-top: 1px dashed #3a3a4f; margin: 2em 0; }
        .iframe-placeholder-for-download { background-color: #232333; padding: 1em; border-radius: 6px; }
        .iframe-placeholder-for-download h4 { margin-top: 0; color: #aabbcc;}
        pre code { display: block; white-space: pre-wrap; word-wrap: break-word; background-color: #101018; color: #c0c0c0; padding: 1em; border-radius: 6px; font-family: 'Courier New', Courier, monospace; font-size: 0.85em; max-height: 500px; overflow-y: auto;}
        /* Add specific styles for flowchart, timeline, financial chart if their HTML structure is simple enough to restyle here */
        .flowchart { border: 1px solid #3a3a4f; padding: 1em; background-color: #101018; border-radius: 6px; }
        .flow-step, .flow-decision, .flow-terminal { background-color: #232333; border: 1px solid #0077cc; padding: 0.5em 1em; border-radius: 4px; text-align: center; margin: 0.5em auto; color: #e0e0e0; }
        .flow-decision { background-color: #00b09c; color: #12121f; transform: skewX(-10deg); }
        .flow-arrow, .flow-arrow-label { text-align: center; color: #00aaff; margin: 0.2em 0; }
        .timeline { border-left: 3px solid #00aaff; padding-left: 1.5em; margin-left: 10px; }
        .timeline-week { margin-bottom: 1.5em; }
        .timeline-content { background-color: #232333; padding: 1em; border-radius: 6px; }
        .week-title { color: #00aaff; }
        .task-list li::before { content: '✓'; color: #00e0c4; margin-right: 0.5em; }
        .financial-chart-container { background-color: #101018; padding: 1em; border-radius: 6px; }
        .bar { height: 20px; line-height: 20px; color: #12121f; padding: 0 5px; font-size:0.8em; border-radius:3px; margin-bottom: 5px;}
        .bar.receita { background-color: #00e0c4; } .bar.custos { background-color: #ff8a65; } .bar.lucro { background-color: #00aaff; }
    ` : `
        body { background-color: #f4f6f8; color: #333; font-family: Arial, sans-serif; line-height: 1.6; margin:0; padding:0;}
        .container { max-width: 900px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1, h2, h3, h4, h5, h6 { color: #2c3e50; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-top: 1.5em; margin-bottom: 0.5em;}
        h1 { font-size: 2em; text-align:center; border-bottom: 2px solid #3498db; padding-bottom: 0.5em; }
        h2 { font-size: 1.6em; color: #3498db; border-bottom: 1px solid #eee; padding-bottom: 0.3em;}
        h3 { font-size: 1.3em; }
        p { margin-bottom: 1em; }
        ul, ol { margin-left: 20px; margin-bottom: 1em; padding-left: 1.5em;}
        li { margin-bottom: 0.5em; }
        strong, b { color: #2980b9; } /* Blue for light theme bold */
        .highlight-text { background-color: rgba(52, 152, 219, 0.1); color: #2980b9; padding: 0.1em 0.4em; border-radius: 4px; font-weight: 500;}
        table.generated-table, .financial-table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.9em; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        table.generated-table th, .financial-table th { background-color: #eaf2f8; color: #2c3e50; font-weight: 600; padding: 0.75em 1em; border: 1px solid #ddd; text-align: left; }
        table.generated-table td, .financial-table td { border: 1px solid #ddd; padding: 0.75em 1em; color: #555; text-align: left;}
        table.generated-table tbody tr:nth-child(even), .financial-table tbody tr:nth-child(even) { background-color: #f9f9f9; }
        hr { border: none; border-top: 1px dashed #ccc; margin: 2em 0; }
        .iframe-placeholder-for-download { background-color: #f0f0f0; padding: 1em; border-radius: 6px; border: 1px solid #e0e0e0; }
        .iframe-placeholder-for-download h4 { margin-top: 0; color: #555;}
        pre code { display: block; white-space: pre-wrap; word-wrap: break-word; background-color: #f8f8f8; color: #333; padding: 1em; border-radius: 6px; border: 1px solid #eee; font-family: 'Courier New', Courier, monospace; font-size: 0.85em; max-height: 500px; overflow-y: auto;}
        /* Add specific styles for flowchart, timeline, financial chart if their HTML structure is simple enough to restyle here */
        .flowchart { border: 1px solid #ddd; padding: 1em; background-color: #f9f9f9; border-radius: 6px; }
        .flow-step, .flow-decision, .flow-terminal { background-color: #fff; border: 1px solid #3498db; padding: 0.5em 1em; border-radius: 4px; text-align: center; margin: 0.5em auto; color: #333; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .flow-decision { background-color: #5dade2; color: #fff; transform: skewX(-10deg); }
        .flow-arrow, .flow-arrow-label { text-align: center; color: #3498db; margin: 0.2em 0; }
        .timeline { border-left: 3px solid #3498db; padding-left: 1.5em; margin-left: 10px; }
        .timeline-week { margin-bottom: 1.5em; }
        .timeline-content { background-color: #fff; border: 1px solid #eee; padding: 1em; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);}
        .week-title { color: #3498db; }
        .task-list li::before { content: '✓'; color: #27ae60; margin-right: 0.5em; }
        .financial-chart-container { background-color: #f9f9f9; border:1px solid #eee; padding: 1em; border-radius: 6px; }
        .bar { height: 20px; line-height: 20px; color: #fff; padding: 0 5px; font-size:0.8em; border-radius:3px; margin-bottom: 5px;}
        .bar.receita { background-color: #2ecc71; } .bar.custos { background-color: #e74c3c; } .bar.lucro { background-color: #3498db; }
    `;
    
    const companyNameValue = (document.getElementById('company-name') as HTMLInputElement)?.value || 'Meu Plano de Negócios';
    const generationDate = new Date().toLocaleDateString('pt-BR');

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Plano de Negócios: ${escapeHtml(companyNameValue)}</title>
            <style>
                ${themeStyles}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Plano de Negócios: ${escapeHtml(companyNameValue)}</h1>
                <p style="text-align:center; font-style:italic; color: ${theme === 'dark' ? '#aabbcc' : '#555'};">Gerado em: ${generationDate}</p>
                <hr/>
                ${planContentHtml}
            </div>
        </body>
        </html>
    `;
}

function downloadFile(filename: string, content: string, type = 'text/html') {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

printPdfButton.addEventListener('click', () => {
    const planHtmlContent = generateHtmlForDownload('light'); // PDF usually from light theme
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(planHtmlContent);
        newWindow.document.close(); // Important for some browsers
        // Delay print to allow content to render
        setTimeout(() => {
            newWindow.print();
            // newWindow.close(); // Optional: close after print dialog
        }, 1000); 
    } else {
        alert('Seu navegador bloqueou a abertura de uma nova janela. Por favor, permita pop-ups para este site.');
    }
});

downloadHtmlLightButton.addEventListener('click', () => {
    const planHtmlContent = generateHtmlForDownload('light');
    downloadFile('plano_de_negocios_claro.html', planHtmlContent);
});

downloadHtmlDarkButton.addEventListener('click', () => {
    const planHtmlContent = generateHtmlForDownload('dark');
    downloadFile('plano_de_negocios_escuro.html', planHtmlContent);
});

downloadLandingPageHtmlButton.addEventListener('click', () => {
    if (currentLandingPageHtml) {
        downloadFile('landing_page.html', currentLandingPageHtml);
    } else {
        alert('Landing page ainda não foi gerada ou não está disponível.');
    }
});

// --- AI Business Assistant ---
function appendMessageToChat(historyElement: HTMLElement, sender: 'user' | 'ai' | 'system' | 'error', messageHtml: string, isStreaming = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);
    if (sender === 'user') {
        messageDiv.innerHTML = `<span class="sender">Você</span><p>${escapeHtml(messageHtml)}</p>`; // Escape user input for display
    } else {
        messageDiv.innerHTML = `<span class="sender">${sender === 'ai' ? 'Assistente AI' : 'Sistema'}</span>${messageHtml}`; // AI/System HTML is already formatted/safe
    }
    
    if (isStreaming && sender === 'ai') {
        messageDiv.classList.add('streaming');
    }

    historyElement.appendChild(messageDiv);
    historyElement.scrollTop = historyElement.scrollHeight; // Scroll to bottom
    return messageDiv; // Return for potential streaming updates
}

function initializeBusinessAssistantChat() {
    if (!ai) {
        appendMessageToChat(assistantChatHistory, 'error', '<p>Erro: Assistente AI não pôde ser inicializado (API Key ausente).</p>');
        return;
    }
    if (!currentPlanTextContent) {
         appendMessageToChat(assistantChatHistory, 'system', '<p>Gere um plano de negócios primeiro para que o assistente possa discuti-lo com você.</p>');
        return;
    }
    const companyNameValue = (document.getElementById('company-name') as HTMLInputElement)?.value || 'minha empresa';
    businessAssistantChat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: `Você é um assistente AI especialista em analisar e discutir planos de negócios. O usuário gerou o seguinte plano para "${companyNameValue}":\n\n${currentPlanTextContent}\n\nResponda às perguntas do usuário sobre este plano. Seja conciso e direto. Use formatação markdown simples (negrito, itálico, listas) quando apropriado.`,
        },
    });
    appendMessageToChat(assistantChatHistory, 'system', `<p>Olá! Sou seu assistente AI. O plano de negócios para <strong>${escapeHtml(companyNameValue)}</strong> foi carregado. Como posso ajudar a analisá-lo?</p>`);
}


openAssistantButton.addEventListener('click', () => {
    if (!isLoggedIn) {
        alert("Por favor, faça login para usar o assistente.");
        return;
    }
    assistantModal.classList.remove('hidden');
    assistantChatHistory.innerHTML = ''; // Clear previous history
    if (!businessAssistantChat && currentPlanTextContent) {
        initializeBusinessAssistantChat();
    } else if (!currentPlanTextContent) {
        appendMessageToChat(assistantChatHistory, 'system', '<p>Por favor, gere um plano de negócios primeiro. O conteúdo do plano será usado pelo assistente.</p>');
    } else if (businessAssistantChat) {
        // If chat exists and modal is reopened, show a welcome back or current status.
        // For simplicity, we re-initialize if plan context changed or just keep existing chat.
        // Here, we assume if chat exists, it's valid for currentPlanTextContent.
         appendMessageToChat(assistantChatHistory, 'system', `<p>Bem-vindo de volta! Continue a discussão sobre o plano de <strong>${escapeHtml((document.getElementById('company-name') as HTMLInputElement)?.value || 'sua empresa')}</strong>.</p>`);
    }
    assistantUserInput.focus();
});

closeAssistantModalButton.addEventListener('click', () => {
    assistantModal.classList.add('hidden');
});

async function sendBusinessAssistantMessage() {
    if (!isLoggedIn) return;
    const messageText = assistantUserInput.value.trim();
    if (!messageText) return;

    if (!businessAssistantChat) {
        appendMessageToChat(assistantChatHistory, 'error', '<p>Assistente não inicializado. Gere um plano e reabra o assistente.</p>');
        return;
    }

    appendMessageToChat(assistantChatHistory, 'user', messageText);
    assistantUserInput.value = '';
    assistantLoadingIndicator.classList.remove('hidden');
    sendAssistantMessageButton.disabled = true;

    try {
        const responseStream = await businessAssistantChat.sendMessageStream({ message: messageText });
        let currentAiMessageDiv: HTMLDivElement | null = null;
        let accumulatedResponseText = "";

        for await (const chunk of responseStream) {
            accumulatedResponseText += chunk.text;
            const formattedChunkHtml = formatTextToHtml(chunk.text); 
            if (!currentAiMessageDiv) {
                currentAiMessageDiv = appendMessageToChat(assistantChatHistory, 'ai', formattedChunkHtml, true);
            } else {
                currentAiMessageDiv.innerHTML += formattedChunkHtml; 
                 assistantChatHistory.scrollTop = assistantChatHistory.scrollHeight;
            }
        }
        if (currentAiMessageDiv) {
            currentAiMessageDiv.classList.remove('streaming');
            currentAiMessageDiv.innerHTML = `<span class="sender">Assistente AI</span>${formatTextToHtml(accumulatedResponseText)}`;

        } else if (accumulatedResponseText) { 
            appendMessageToChat(assistantChatHistory, 'ai', formatTextToHtml(accumulatedResponseText));
        }


    } catch (error) {
        console.error("Error sending/receiving AI assistant message:", error);
        // @ts-ignore
        appendMessageToChat(assistantChatHistory, 'error', `<p>Erro na comunicação com o assistente: ${escapeHtml(String(error.message))}</p>`);
    } finally {
        assistantLoadingIndicator.classList.add('hidden');
        sendAssistantMessageButton.disabled = false;
        assistantUserInput.focus();
    }
}

sendAssistantMessageButton.addEventListener('click', sendBusinessAssistantMessage);
assistantUserInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendBusinessAssistantMessage();
    }
});


// --- Instagram Content Generation (separate from main plan) ---
let currentInstagramContent = ""; // To store for download

async function generateInstagramStrategyContent(formData: FormData): Promise<string> {
    if (!ai) throw new Error("API_KEY_MISSING");
    const companyNameValue = formData.get('company-name') as string;
    const businessIdeaValue = formData.get('business-idea') as string;
    const productDescriptionValue = formData.get('product-description') as string;

    const prompt = `
    Empresa: "${companyNameValue}"
    Negócio: "${businessIdeaValue}"
    Produtos/Serviços: "${productDescriptionValue}"

    Crie uma estratégia de conteúdo para Instagram focada em crescimento e engajamento para esta empresa. Inclua:
    1.  **Público Alvo no Instagram:** Uma breve descrição do perfil ideal de seguidor.
    2.  **Tom de Voz e Estilo Visual:** Sugestões para a comunicação e aparência dos posts.
    3.  **Pilares de Conteúdo:** 3-5 temas centrais para abordar consistentemente.
    4.  **Ideias de Posts (Feed - 5 ideias):**
        *   Formato (Imagem única, Carrossel, Vídeo curto).
        *   Objetivo (Educar, Inspirar, Vender, Engajar).
        *   Breve descrição/roteiro.
        *   Sugestão de CTA (Call to Action).
        *   Hashtags relevantes (5-7 por post).
    5.  **Ideias de Stories (3 ideias):**
        *   Formato (Enquete, Caixa de Perguntas, Quiz, Link).
        *   Objetivo.
        *   Descrição.
    6.  **Ideias de Reels (3 ideias já geradas no plano principal, pode referenciá-las ou criar novas se quiser):**
        *   Tipo (Tutorial, Desafio, Bastidores, Dica Rápida).
        *   Música/Áudio (Ex: em alta, narração).
        *   Roteiro/Descrição.
    7.  **Frequência de Postagem Sugerida:** (Ex: X posts no feed/semana, Y stories/dia).
    8.  **Dicas Extras:** (Ex: Melhor horário para postar, como usar parcerias).

    Formate a resposta de forma clara e organizada, usando títulos e listas.
    Use linguagem apropriada para um guia de marketing digital.
    Não adicione introduções ou conclusões genéricas, vá direto ao conteúdo da estratégia.
    `;
    try {
        const response = await ai.models.generateContent({ model: model, contents: prompt });
        currentInstagramContent = response.text; 
        if (response.usageMetadata) { updateTotalUsageStats(response.usageMetadata); }
        return currentInstagramContent;
    } catch (error) {
        console.error('Error generating Instagram content:', error);
        // @ts-ignore
        const errorMessage = error.message || 'Unknown API error';
         if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('permission')) {
             throw new Error('API_KEY_INVALID');
        }
        throw new Error('Failed to generate Instagram content.');
    }
}

downloadInstagramContentButton.addEventListener('click', async () => {
    if (!isLoggedIn || !ai) {
        alert("Login e API Key são necessários.");
        return;
    }
    const currentFormData = new FormData(form); 
    downloadInstagramContentButton.disabled = true;
    downloadInstagramContentButton.innerHTML = '<div class="spinner-small" style="border-top-color: white; margin: 0 auto;"></div> Gerando...';

    try {
        const content = await generateInstagramStrategyContent(currentFormData);
        const companyNameValue = currentFormData.get('company-name') as string;
        const htmlContent = `
            <!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Estratégia Instagram - ${escapeHtml(companyNameValue)}</title>
            <style>body{font-family:sans-serif;line-height:1.6;padding:20px;max-width:800px;margin:auto;color:#333;background:#f9f9f9;} h1,h2,h3{color:#1a73e8;} h1{text-align:center;} pre{white-space:pre-wrap;background:#eee;padding:15px;border-radius:5px;}</style></head>
            <body><h1>Estratégia de Conteúdo para Instagram</h1><h2>Empresa: ${escapeHtml(companyNameValue)}</h2><hr/>
            <pre>${escapeHtml(content)}</pre></body></html>`;
        downloadFile(`estrategia_instagram_${(companyNameValue).replace(/\s+/g, '_').toLowerCase()}.html`, htmlContent);
    } catch (error) {
        // @ts-ignore
        alert(`Erro ao gerar conteúdo do Instagram: ${error.message}`);
    } finally {
        downloadInstagramContentButton.disabled = false;
        downloadInstagramContentButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="button-icon"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>
            Baixar Conteúdo do Instagram
        `;
    }
});


// --- Customer-Facing Bot Script Generation ---
generateClientBotScriptButton.addEventListener('click', async () => {
    if (!isLoggedIn || !ai) {
         alert("Login e API Key são necessários.");
        return;
    }
    const currentFormData = new FormData(form);
    const companyNameValue = currentFormData.get('company-name') as string;
    const businessIdeaValue = currentFormData.get('business-idea') as string;
    const productDescriptionValue = currentFormData.get('product-description') as string;

    clientBotLoadingIndicator.classList.remove('hidden');
    generateClientBotScriptButton.disabled = true;
    clientBotScriptOutput.classList.add('hidden');

    const prompt = `
    Empresa: "${companyNameValue}"
    Negócio: "${businessIdeaValue}"
    Produtos/Serviços: "${productDescriptionValue}"

    Crie um script inicial para um bot de atendimento ao cliente (foco em prospecção para Instagram/WhatsApp). Inclua:
    1.  **Persona do Bot:** Nome, tom de voz (ex: amigável, profissional, divertido).
    2.  **Saudação Inicial:** Mensagem de boas-vindas quando o cliente inicia o contato.
    3.  **Qualificação Inicial (Perguntas Chave):** 2-3 perguntas para entender a necessidade do cliente.
    4.  **Apresentação Breve da Solução:** Como o bot pode apresentar os produtos/serviços de forma concisa.
    5.  **Coleta de Informações de Contato:** Como pedir email ou telefone para acompanhamento.
    6.  **Encaminhamento (Opcional):** Quando e como o bot sugeriria falar com um humano.
    7.  **Mensagem de Despedida/Próximos Passos:** O que o bot diz ao final da interação inicial.
    8.  **FAQs (3-5 Perguntas Frequentes e Respostas):** Perguntas comuns que o bot poderia responder.

    Formate a resposta de forma clara e organizada, usando títulos e listas.
    O script deve ser prático e pronto para ser adaptado para plataformas de chatbot.
    `;

    try {
        const script = await callGenerativeAI(prompt, "Client Bot Script");
        clientBotScriptCode.textContent = script;
        clientBotScriptOutput.classList.remove('hidden');
    } catch (error) {
        // @ts-ignore
        clientBotScriptCode.textContent = `Erro ao gerar script: ${error.message}`;
        clientBotScriptOutput.classList.remove('hidden');
    } finally {
        clientBotLoadingIndicator.classList.add('hidden');
        generateClientBotScriptButton.disabled = false;
    }
});


// --- Customer Service AI Chat (Prospecting) ---
function initializeCustomerProspectingChat() {
    if (!ai) {
        appendMessageToChat(customerChatHistory, 'error', '<p>Erro: Simulador de chat não pôde ser inicializado (API Key ausente).</p>');
        return;
    }
    if (!companyProfileForCustomerChat) {
        appendMessageToChat(customerChatHistory, 'system', '<p>Gere um plano de negócios primeiro para definir o perfil da empresa para este chat.</p>');
        return;
    }

    customerProspectingChat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: `Você é um atendente virtual para a empresa com o seguinte perfil:\n${companyProfileForCustomerChat}\n\nSeu objetivo é simular uma conversa com um potencial cliente interessado nos produtos/serviços. Seja cordial, responda às perguntas do "cliente" (usuário) e tente entender suas necessidades. Use as informações do perfil da empresa para elaborar suas respostas. Pergunte ao cliente o que ele busca ou qual problema ele quer resolver. Não seja muito longo nas respostas. Tente converter o interesse em um próximo passo (ex: agendar uma demonstração, pedir um contato).`,
        },
    });
    appendMessageToChat(customerChatHistory, 'ai', '<p>Olá! Bem-vindo(a) à nossa empresa. Como posso te ajudar hoje a conhecer nossos serviços?</p>');
}

openCustomerChatButton.addEventListener('click', () => {
    if (!isLoggedIn) { alert("Por favor, faça login."); return; }
    if (!companyProfileForCustomerChat) {
        alert("Por favor, gere um plano de negócios primeiro para fornecer contexto para este chat.");
        return;
    }
    customerChatModal.classList.remove('hidden');
    customerChatHistory.innerHTML = ''; // Clear previous history
    initializeCustomerProspectingChat();
    customerChatUserInput.focus();
});

closeCustomerChatModalButton.addEventListener('click', () => {
    customerChatModal.classList.add('hidden');
});

async function sendCustomerChatMessage() {
    if (!isLoggedIn) return;
    const messageText = customerChatUserInput.value.trim();
    if (!messageText) return;

    if (!customerProspectingChat) {
        appendMessageToChat(customerChatHistory, 'error', '<p>Simulador de chat não inicializado. Gere um plano e reabra o simulador.</p>');
        return;
    }

    appendMessageToChat(customerChatHistory, 'user', messageText); // User's message (as customer)
    customerChatUserInput.value = '';
    customerChatLoadingIndicator.classList.remove('hidden');
    sendCustomerChatMessageButton.disabled = true;

    try {
        const responseStream = await customerProspectingChat.sendMessageStream({ message: messageText });
        let currentAiMessageDiv: HTMLDivElement | null = null;
        let accumulatedResponseText = "";

        for await (const chunk of responseStream) {
            accumulatedResponseText += chunk.text;
            const formattedChunkHtml = formatTextToHtml(chunk.text);
            if (!currentAiMessageDiv) {
                currentAiMessageDiv = appendMessageToChat(customerChatHistory, 'ai', formattedChunkHtml, true);
            } else {
                currentAiMessageDiv.innerHTML += formattedChunkHtml;
                 customerChatHistory.scrollTop = customerChatHistory.scrollHeight;
            }
        }
         if (currentAiMessageDiv) {
            currentAiMessageDiv.classList.remove('streaming');
            currentAiMessageDiv.innerHTML = `<span class="sender">Atendente Virtual</span>${formatTextToHtml(accumulatedResponseText)}`;
        } else if (accumulatedResponseText) {
            appendMessageToChat(customerChatHistory, 'ai', formatTextToHtml(accumulatedResponseText));
        }

    } catch (error) {
        console.error("Error in customer chat simulation:", error);
        // @ts-ignore
        appendMessageToChat(customerChatHistory, 'error', `<p>Erro na simulação: ${escapeHtml(String(error.message))}</p>`);
    } finally {
        customerChatLoadingIndicator.classList.add('hidden');
        sendCustomerChatMessageButton.disabled = false;
        customerChatUserInput.focus();
    }
}
sendCustomerChatMessageButton.addEventListener('click', sendCustomerChatMessage);
customerChatUserInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendCustomerChatMessage();
    }
});


// --- Post-Purchase Bot Simulation ---
function initializePostPurchaseBot() {
    if (!ai) {
        appendMessageToChat(postPurchaseBotChatHistory, 'error', '<p>Erro: Simulador de bot pós-venda não pôde ser inicializado (API Key ausente).</p>');
        return;
    }
    if (!companyProfileForCustomerChat) { // Re-use company profile for context
        appendMessageToChat(postPurchaseBotChatHistory, 'system', '<p>Gere um plano de negócios primeiro para definir o perfil da empresa para este chat.</p>');
        return;
    }

    postPurchaseSupportChat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: `Você é um atendente virtual de PÓS-VENDA para a empresa com o seguinte perfil:\n${companyProfileForCustomerChat}\n\nSeu objetivo é ajudar clientes que JÁ COMPRARAM. Responda a perguntas sobre status de pedido, problemas com produtos/serviços, devoluções, ou dúvidas sobre o uso. Seja prestativo e tente resolver o problema do cliente. Se não puder resolver, ofereça encaminhar para um especialista humano. O cliente (usuário) irá simular ser um comprador.`,
        },
    });
    appendMessageToChat(postPurchaseBotChatHistory, 'ai', '<p>Olá! Obrigado por ser nosso cliente. Como posso te ajudar com seu pedido ou produto/serviço hoje?</p>');
}

openPostPurchaseBotButton.addEventListener('click', () => {
    if (!isLoggedIn) { alert("Por favor, faça login."); return; }
     if (!companyProfileForCustomerChat) {
        alert("Por favor, gere um plano de negócios primeiro para fornecer contexto para este chat.");
        return;
    }
    postPurchaseBotModal.classList.remove('hidden');
    postPurchaseBotChatHistory.innerHTML = ''; // Clear previous history
    initializePostPurchaseBot();
    postPurchaseBotUserInput.focus();
});

closePostPurchaseBotButton.addEventListener('click', () => {
    postPurchaseBotModal.classList.add('hidden');
});

async function sendPostPurchaseBotMessage() {
    if (!isLoggedIn) return;
    const messageText = postPurchaseBotUserInput.value.trim();
    if (!messageText) return;

    if (!postPurchaseSupportChat) {
        appendMessageToChat(postPurchaseBotChatHistory, 'error', '<p>Simulador de bot não inicializado.</p>');
        return;
    }

    appendMessageToChat(postPurchaseBotChatHistory, 'user', messageText); // User's message (as existing customer)
    postPurchaseBotUserInput.value = '';
    postPurchaseBotLoadingIndicator.classList.remove('hidden');
    sendPostPurchaseBotMessageButton.disabled = true;

    try {
        const responseStream = await postPurchaseSupportChat.sendMessageStream({ message: messageText });
        let currentAiMessageDiv: HTMLDivElement | null = null;
        let accumulatedResponseText = "";

        for await (const chunk of responseStream) {
            accumulatedResponseText += chunk.text;
            const formattedChunkHtml = formatTextToHtml(chunk.text);
             if (!currentAiMessageDiv) {
                currentAiMessageDiv = appendMessageToChat(postPurchaseBotChatHistory, 'ai', formattedChunkHtml, true);
            } else {
                currentAiMessageDiv.innerHTML += formattedChunkHtml;
                 postPurchaseBotChatHistory.scrollTop = postPurchaseBotChatHistory.scrollHeight;
            }
        }
         if (currentAiMessageDiv) {
            currentAiMessageDiv.classList.remove('streaming');
            currentAiMessageDiv.innerHTML = `<span class="sender">Atendente Pós-Venda</span>${formatTextToHtml(accumulatedResponseText)}`;
        } else if (accumulatedResponseText) {
            appendMessageToChat(postPurchaseBotChatHistory, 'ai', formatTextToHtml(accumulatedResponseText));
        }

    } catch (error) {
        console.error("Error in post-purchase bot simulation:", error);
        // @ts-ignore
        appendMessageToChat(postPurchaseBotChatHistory, 'error', `<p>Erro na simulação: ${escapeHtml(String(error.message))}</p>`);
    } finally {
        postPurchaseBotLoadingIndicator.classList.add('hidden');
        sendPostPurchaseBotMessageButton.disabled = false;
        postPurchaseBotUserInput.focus();
    }
}

sendPostPurchaseBotMessageButton.addEventListener('click', sendPostPurchaseBotMessage);
postPurchaseBotUserInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendPostPurchaseBotMessage();
    }
});