// DOM Elements
const form = document.getElementById('recommendation-form');
const resultSection = document.getElementById('result-section');
const exportBtn = document.getElementById('export-pdf');
let currentRecommendation = null;
let progressChart = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initProgressChart();
    loadJSPDF();
});

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate inputs
        if (!validateInputs(data)) return;
        
        // Show loading state
        toggleLoading(true);
        
        // Get recommendation
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                age: parseInt(data.age),
                gpa: parseFloat(data.gpa),
                math_skill: parseInt(data.math_skill),
                goal: data.goal
            })
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        currentRecommendation = await response.json();
        displayResult(currentRecommendation);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to get recommendation');
    } finally {
        toggleLoading(false);
    }
});

// PDF Export handler
exportBtn.addEventListener('click', () => {
    if (!currentRecommendation) return;
    generatePDF(currentRecommendation.roadmap, currentRecommendation.level);
});

// Initialize progress chart
function initProgressChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    progressChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 100 }},
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index' }
            }
        }
    });
}

// Load jsPDF dynamically
function loadJSPDF() {
    if (window.jspdf) return;
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
        window.jspdf = window.jsPDF;
        console.log('PDF library loaded');
    };
    document.head.appendChild(script);
}

// Display results
function displayResult(data) {
    // Update level badge
    const levelBadge = document.getElementById('level-badge');
    levelBadge.textContent = data.level;
    levelBadge.className = `level-badge ${data.level}-badge`;
    
    // Format roadmap content
    const roadmapContent = document.getElementById('roadmap-content');
    roadmapContent.innerHTML = formatRoadmapText(data.roadmap);
    
    // Show result section
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    // Update chart with sample progress data
    updateProgressChart(data.level);
}

// Format roadmap text with HTML
function formatRoadmapText(text) {
    return text.split('\n').map(line => {
        if (line.trim().endsWith(':')) {
            return `<h3 class="text-lg font-semibold mt-4">${line}</h3>`;
        }
        return `<p class="my-2">${line}</p>`;
    }).join('');
}

// Update progress chart
function updateProgressChart(level) {
    const progressData = {
        beginner: [20, 40, 65, 85],
        intermediate: [15, 35, 70, 95],
        advanced: [10, 30, 60, 90]
    };
    
    progressChart.data = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Completion %',
            data: progressData[level] || progressData.beginner,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    };
    progressChart.update();
}

// Input validation
function validateInputs(data) {
    if (!data.age || data.age < 13 || data.age > 25) {
        showError('Please enter a valid age (13-25)');
        return false;
    }
    if (!data.gpa || data.gpa < 0 || data.gpa > 10) {
        showError('Please enter a valid GPA (0-10)');
        return false;
    }
    if (!data.math_skill || data.math_skill < 1 || data.math_skill > 10) {
        showError('Please rate math skills (1-10)');
        return false;
    }
    return true;
}

// UI Helpers
function toggleLoading(isLoading) {
    const btn = form.querySelector('button[type="submit"]');
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    } else {
        btn.disabled = false;
        btn.textContent = 'Generate My Roadmap';
    }
}

function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4';
    errorEl.innerHTML = `<p>${message}</p>`;
    
    // Insert after form
    form.parentNode.insertBefore(errorEl, form.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => errorEl.remove(), 5000);
}