// Create animated stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// File upload handling
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileStatus = document.getElementById('fileStatus');

uploadBox.addEventListener('click', () => {
    fileInput.click();
});

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.background = 'rgba(255, 255, 255, 0.2)';
    uploadBox.style.borderColor = 'rgba(255, 215, 0, 1)';
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.background = 'rgba(255, 255, 255, 0.1)';
    uploadBox.style.borderColor = 'rgba(255, 215, 0, 0.5)';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.background = 'rgba(255, 255, 255, 0.1)';
    uploadBox.style.borderColor = 'rgba(255, 215, 0, 0.5)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    fileStatus.textContent = `✓ File loaded: ${file.name}`;
    
    // Simulate file analysis with animation
    analyzeResume();
}

function analyzeResume() {
    const reader = new FileReader();
    
    // Show loading state
    fileStatus.textContent = '⏳ Analyzing your resume...';
    const startTime = performance.now();
    
    reader.onload = function(e) {
        try {
            const fileContent = e.target.result;
            const analysisResults = performDeepAnalysis(fileContent);
            
            const endTime = performance.now();
            const analysisTime = (endTime - startTime).toFixed(2);
            
            // Use requestAnimationFrame for smooth animations
            requestAnimationFrame(() => {
                animateScore(analysisResults.overall);
                animateMetric(0, analysisResults.readability);
                animateMetric(1, analysisResults.ats);
                animateMetric(2, analysisResults.impact);
                showSuggestions(analysisResults);
            });
            
            fileStatus.textContent = `✓ Analysis complete in ${analysisTime}ms`;
        } catch (error) {
            fileStatus.textContent = '❌ Error analyzing resume';
            console.error('Analysis error:', error);
        }
    };
    
    reader.onerror = function() {
        fileStatus.textContent = '❌ Error reading file';
    };
    
    // Use appropriate read method based on file size
    const file = fileInput.files[0];
    if (file.size > 5 * 1024 * 1024) {
        fileStatus.textContent = '❌ File too large (max 5MB)';
    } else {
        reader.readAsText(file);
    }
}

// Pre-compile regexes and constants for performance
const REGEX_EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const REGEX_PHONE = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})/;
const REGEX_METRICS = /\d+%|\$\d+|(\d+)[KMB]?(?:\s*(increase|decrease|growth|improvement|revenue|profit|cost|save))/gi;
const REGEX_SECTIONS = /EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS|ACHIEVEMENTS/gi;

const ACTION_VERBS = ['managed', 'led', 'developed', 'created', 'implemented', 'designed', 'built', 'improved', 'increased', 'decreased', 'reduced', 'achieved', 'accomplished', 'organized', 'coordinated', 'directed', 'established', 'enhanced', 'expanded', 'facilitated', 'generated', 'handled', 'initiated', 'launched', 'optimized', 'oversaw', 'produced', 'promoted', 'provided', 'reorganized', 'resolved', 'resulted', 'spearheaded', 'streamlined', 'structured', 'supervised', 'transformed', 'upgraded'];

const SUMMARY_KEYWORDS = ['summary', 'objective', 'professional profile', 'about'];
const ATS_KEYWORDS = ['experience', 'skills', 'education', 'certification', 'programming', 'technical', 'communication', 'leadership', 'project', 'achievement'];

function performDeepAnalysis(content) {
    // Early exit for empty content
    if (!content || content.trim().length === 0) {
        return getDefaultAnalysis();
    }

    const lowerContent = content.toLowerCase();
    const words = lowerContent.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Quick exit for very short content
    if (wordCount < 50) {
        return getDefaultAnalysis();
    }

    const analysis = {
        wordCount: wordCount,
        hasContactInfo: REGEX_EMAIL.test(content) && REGEX_PHONE.test(content),
        hasSummary: SUMMARY_KEYWORDS.some(kw => lowerContent.includes(kw)),
        hasMetrics: REGEX_METRICS.test(content),
        actionVerbs: countMatches(lowerContent, ACTION_VERBS),
        totalSentences: Math.max(1, content.split(/[.!?]+/).filter(s => s.trim().length > 0).length),
        keywordMatches: countMatches(lowerContent, ATS_KEYWORDS),
        issues: [],
        suggestions: []
    };

    // Optimized calculations
    analysis.readability = calculateReadability(words, analysis.totalSentences);
    analysis.ats = calculateATSScore(analysis);
    analysis.impact = calculateImpactScore(analysis, ACTION_VERBS.length);
    analysis.formattingScore = calculateFormattingScore(content);
    analysis.overall = Math.round((analysis.readability + analysis.ats + analysis.impact + analysis.formattingScore) / 4);

    // Generate issues and suggestions
    generateAnalysisIssues(analysis);

    return analysis;
}

function getDefaultAnalysis() {
    return {
        wordCount: 0,
        hasContactInfo: false,
        hasSummary: false,
        hasMetrics: false,
        actionVerbs: 0,
        totalSentences: 0,
        keywordMatches: 0,
        readability: 0,
        ats: 25,
        impact: 0,
        formattingScore: 25,
        overall: 12,
        issues: ['Resume content is too short or empty'],
        suggestions: ['Add at least 200 words to your resume']
    };
}

// Optimized helper to count keyword matches
function countMatches(text, keywords) {
    let count = 0;
    for (let keyword of keywords) {
        if (text.includes(keyword)) count++;
    }
    return count;
}

// Optimized readability calculation
function calculateReadability(words, totalSentences) {
    if (totalSentences === 0) return 0;
    
    let totalWordLength = 0;
    for (let i = 0; i < Math.min(words.length, 500); i++) {
        totalWordLength += words[i].length;
    }
    
    const avgWordLength = totalWordLength / Math.min(words.length, 500);
    const avgSentenceLength = words.length / totalSentences;
    
    let readabilityScore = 206.835 - 1.015 * avgSentenceLength - 84.6 * (avgWordLength / 5);
    readabilityScore = Math.max(0, Math.min(100, readabilityScore));
    return Math.round(readabilityScore);
}

// Optimized ATS score calculation
function calculateATSScore(analysis) {
    let atsScore = 50;
    if (analysis.hasContactInfo) atsScore += 10;
    if (analysis.hasSummary) atsScore += 10;
    atsScore += (analysis.keywordMatches / ATS_KEYWORDS.length) * 20;
    atsScore += Math.min(10, analysis.wordCount / 50);
    return Math.round(Math.min(100, atsScore));
}

// Optimized impact score calculation
function calculateImpactScore(analysis, totalActionVerbs) {
    let impactScore = 40;
    impactScore += (analysis.actionVerbs / totalActionVerbs) * 30;
    if (analysis.hasMetrics) impactScore += 20;
    impactScore += Math.min(10, analysis.totalSentences / 5);
    return Math.round(Math.min(100, impactScore));
}

// Optimized formatting score calculation
function calculateFormattingScore(content) {
    let formattingScore = 50;
    if (content.includes('\n')) formattingScore += 15;
    const sectionMatches = content.match(REGEX_SECTIONS) || [];
    formattingScore += Math.min(20, sectionMatches.length * 5);
    return Math.round(Math.min(100, formattingScore));
}

function generateAnalysisIssues(analysis) {
    // Contact Information
    if (!analysis.hasContactInfo) {
        analysis.issues.push('Missing contact information');
        analysis.suggestions.push('📧 Add your email and phone number at the top of your resume');
    } else {
        analysis.suggestions.push('✓ Contact information is properly included');
    }

    // Professional Summary
    if (!analysis.hasSummary) {
        analysis.issues.push('No professional summary or objective');
        analysis.suggestions.push('📝 Write a 2-3 line professional summary with your key strengths and career goal. Example: "Results-driven professional with 5+ years experience in XYZ, proven track record of increasing productivity by 30%"');
    } else {
        analysis.suggestions.push('✓ Professional summary included');
    }

    // Action Verbs - Provide specific examples based on count
    if (analysis.actionVerbs === 0) {
        analysis.issues.push('No action verbs found');
        analysis.suggestions.push('💪 Start each bullet point with strong action verbs. Examples: "Managed 5-person team", "Developed new process", "Implemented solution"');
    } else if (analysis.actionVerbs < 5) {
        analysis.issues.push('Low number of action verbs');
        analysis.suggestions.push('💪 Increase action verbs from ' + analysis.actionVerbs + ' to at least 10. Use: led, developed, implemented, designed, created, managed, improved, increased, reduced, achieved');
    } else if (analysis.actionVerbs < 10) {
        analysis.suggestions.push('✓ Good use of action verbs (' + analysis.actionVerbs + ' found)');
    } else {
        analysis.suggestions.push('✓ Excellent use of action verbs (' + analysis.actionVerbs + ' found)');
    }

    // Metrics and Numbers
    if (!analysis.hasMetrics) {
        analysis.issues.push('Missing quantifiable results');
        analysis.suggestions.push('📊 Add specific metrics to your achievements. Examples: "Increased sales by 25%", "Reduced costs by $50K", "Improved efficiency to 95%"');
    } else {
        analysis.suggestions.push('✓ Strong use of quantifiable metrics');
    }

    // Word Count - Provide specific guidance
    if (analysis.wordCount < 100) {
        analysis.issues.push('Resume is critically short (' + analysis.wordCount + ' words)');
        analysis.suggestions.push('📄 Expand your resume to at least 200 words. Add more achievements, skills, and relevant details');
    } else if (analysis.wordCount < 200) {
        analysis.issues.push('Resume appears too brief (' + analysis.wordCount + ' words)');
        analysis.suggestions.push('📄 Expand to 200+ words by adding more accomplishments and key achievements in each role');
    } else if (analysis.wordCount > 1500) {
        analysis.issues.push('Resume is too long (' + analysis.wordCount + ' words)');
        analysis.suggestions.push('📄 Reduce to 500-1000 words max. Cut less relevant details and focus on recent, impactful achievements');
    } else if (analysis.wordCount > 1000) {
        analysis.issues.push('Resume may be slightly long (' + analysis.wordCount + ' words)');
        analysis.suggestions.push('📄 Consider trimming to 1000 words for better readability. Keep most impactful achievements');
    } else {
        analysis.suggestions.push('✓ Good resume length (' + analysis.wordCount + ' words)');
    }

    // Readability
    if (analysis.readability < 40) {
        analysis.issues.push('Very poor readability (score: ' + analysis.readability + ')');
        analysis.suggestions.push('🔤 Simplify your language. Use shorter sentences (15-20 words), active voice, and avoid jargon');
    } else if (analysis.readability < 50) {
        analysis.issues.push('Poor readability (score: ' + analysis.readability + ')');
        analysis.suggestions.push('🔤 Improve readability by breaking long sentences into shorter ones and using simpler vocabulary');
    } else if (analysis.readability < 60) {
        analysis.issues.push('Moderate readability (score: ' + analysis.readability + ')');
        analysis.suggestions.push('🔤 Consider simplifying some complex sentences for better readability');
    } else if (analysis.readability > 75) {
        analysis.suggestions.push('✓ Excellent readability (score: ' + analysis.readability + ')');
    } else {
        analysis.suggestions.push('✓ Good readability (score: ' + analysis.readability + ')');
    }

    // ATS Compatibility
    if (analysis.ats < 50) {
        analysis.issues.push('Poor ATS compatibility (score: ' + analysis.ats + ')');
        analysis.suggestions.push('🤖 Add standard section headers: EXPERIENCE, EDUCATION, SKILLS, CERTIFICATIONS. Use clean formatting without special characters');
    } else if (analysis.ats < 70) {
        analysis.issues.push('Moderate ATS compatibility (score: ' + analysis.ats + ')');
        analysis.suggestions.push('🤖 Improve ATS score by using standard formatting, clear headers, and including all relevant keywords from job descriptions');
    } else {
        analysis.suggestions.push('✓ Good ATS compatibility (score: ' + analysis.ats + ')');
    }

    // Impact Score
    if (analysis.impact < 50) {
        analysis.issues.push('Low impact score (score: ' + analysis.impact + ')');
        analysis.suggestions.push('⭐ Focus on achievements with measurable outcomes. Add context to each accomplishment. Include impact statements');
    } else if (analysis.impact < 70) {
        analysis.suggestions.push('💡 Enhance impact by adding more quantifiable results and business outcomes to your achievements');
    } else {
        analysis.suggestions.push('✓ Strong achievement-focused content (score: ' + analysis.impact + ')');
    }

    // Additional Pro Tips
    if (analysis.wordCount > 0) {
        const avgWordsPerLine = Math.round(analysis.wordCount / analysis.totalSentences);
        if (avgWordsPerLine > 25) {
            analysis.suggestions.push('⚡ Pro Tip: Break up long bullet points into shorter, punchier statements (aim for 15-20 words per line)');
        }
    }

    // Overall Quality Assessment
    if (analysis.overall >= 80) {
        analysis.suggestions.push('🏆 Your resume is excellent! You\'re ready to apply to top positions');
    } else if (analysis.overall >= 70) {
        analysis.suggestions.push('👍 Your resume is good! Minor improvements could make it even stronger');
    } else if (analysis.overall >= 60) {
        analysis.suggestions.push('📋 Your resume needs some work. Focus on the suggestions above to improve');
    }
}

function animateScore(finalScore) {
    const scoreValue = document.getElementById('scoreValue');
    let currentScore = 0;
    const increment = Math.max(1, finalScore / 50);
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / 600, 1); // 600ms animation
        
        currentScore = Math.floor(progress * finalScore);
        scoreValue.textContent = currentScore;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            scoreValue.textContent = finalScore;
        }
    }
    
    requestAnimationFrame(update);
}

function animateMetric(index, finalValue) {
    const metric = document.getElementById(`metric${index + 1}`);
    const fill = metric.querySelector('.metric-fill');
    const valueDisplay = metric.querySelector('.metric-value');
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / 600, 1); // 600ms animation
        
        const currentValue = Math.floor(progress * finalValue);
        fill.style.width = currentValue + '%';
        valueDisplay.textContent = currentValue + '%';
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            fill.style.width = finalValue + '%';
            valueDisplay.textContent = finalValue + '%';
        }
    }
    
    requestAnimationFrame(update);
}

function showSuggestions(analysisResults) {
    const suggestionsList = document.querySelector('.suggestions-content');
    suggestionsList.innerHTML = '';

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    // Add suggestions based on analysis
    const displaySuggestions = analysisResults.suggestions.slice(0, 10);
    
    displaySuggestions.forEach((suggestion, index) => {
        const li = document.createElement('div');
        li.className = 'suggestion-item';
        li.textContent = suggestion;
        
        // Color code based on suggestion type
        if (suggestion.includes('✓')) {
            li.classList.add('success');
        } else if (suggestion.includes('🏆') || suggestion.includes('Your resume is excellent')) {
            li.classList.add('excellent');
        } else if (suggestion.includes('⚡ Pro Tip')) {
            li.classList.add('pro-tip');
        } else if (suggestion.includes('👍') || suggestion.includes('Your resume is good')) {
            li.classList.add('warning');
        } else if (suggestion.includes('💡')) {
            li.classList.add('info');
        } else if (suggestion.includes('📧') || suggestion.includes('📝') || suggestion.includes('💪') || 
                   suggestion.includes('📊') || suggestion.includes('📄') || suggestion.includes('🔤') || 
                   suggestion.includes('🤖') || suggestion.includes('⭐')) {
            li.classList.add('warning');
        } else {
            li.classList.add('warning');
        }
        
        fragment.appendChild(li);
    });

    // Add issues section if there are any
    if (analysisResults.issues && analysisResults.issues.length > 0) {
        const issuesHeader = document.createElement('div');
        issuesHeader.className = 'issue-header';
        issuesHeader.textContent = '⚠ Areas to Improve:';
        fragment.appendChild(issuesHeader);

        analysisResults.issues.forEach(issue => {
            const li = document.createElement('div');
            li.className = 'suggestion-item error';
            li.textContent = '❌ ' + issue;
            fragment.appendChild(li);
        });
    }
    
    // Append all at once
    suggestionsList.appendChild(fragment);
}

// CTA Button scroll
document.querySelector('.cta-button').addEventListener('click', () => {
    document.querySelector('#checker').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

// Initialize on load
window.addEventListener('load', () => {
    createStars();
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.feature-card, .stat, .metric').forEach(el => {
    observer.observe(el);
});

// Mouse parallax effect on hero
document.addEventListener('mousemove', (e) => {
    const floatingCard = document.querySelector('.floating-card');
    if (floatingCard) {
        const x = (e.clientX / window.innerWidth) * 20 - 10;
        const y = (e.clientY / window.innerHeight) * 20 - 10;
        floatingCard.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
});

// Add glow effect to nav on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(0, 0, 0, 0.5)';
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.3)';
        navbar.style.boxShadow = 'none';
    }
});
