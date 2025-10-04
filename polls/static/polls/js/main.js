// Utility Functions
class PollsUtils {
    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static getCSRFToken() {
        let csrfToken = null;
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                csrfToken = value;
                break;
            }
        }
        return csrfToken;
    }

    static showMessage(elementId, text, type) {
        const messageDiv = document.getElementById(elementId);
        if (!messageDiv) {
            console.error('Message element not found:', elementId);
            return;
        }
        
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }
}

// Home Page functionality
class HomePage {
    constructor() {
        this.init();
    }

    init() {
        this.animateCards();
    }

    animateCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }
}

// Polls List Page functionality
class PollsListPage {
    constructor() {
        this.pollsContainer = document.getElementById('polls-container');
        if (this.pollsContainer) {
            this.loadPolls();
        }
    }

    async loadPolls() {
        try {
            const response = await fetch('/api/polls/');
            const data = await response.json();
            
            if (response.ok) {
                this.displayPolls(data.results);
            } else {
                this.showError('Failed to load polls');
            }
        } catch (error) {
            this.showError('Network error: ' + error.message);
        }
    }

    displayPolls(polls) {
        if (polls.length === 0) {
            this.pollsContainer.innerHTML = `
                <div class="error">
                    No polls available. <a href="/polls/create/">Create the first poll!</a>
                </div>
            `;
            return;
        }

        this.pollsContainer.innerHTML = polls.map(poll => `
            <div class="poll-card" id="poll-${poll.id}">
                <h2 class="poll-question">${PollsUtils.escapeHtml(poll.question)}</h2>
                
                <div class="poll-meta">
                    <span>By: ${poll.created_by.username}</span>
                    <span>Created: ${PollsUtils.formatDate(poll.pub_date)}</span>
                    <span>${poll.active ? 'Active' : 'Closed'}</span>
                </div>

                <div class="choices-container">
                    ${poll.choices.map(choice => `
                        <div class="choice">
                            <div class="choice-text">${PollsUtils.escapeHtml(choice.choice_text)}</div>
                            <div class="vote-info">
                                <div class="percentage-bar">
                                    <div class="percentage-fill" style="width: ${choice.percentage}%"></div>
                                </div>
                                <span>${choice.percentage}%</span>
                                <span>(${choice.votes} votes)</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="total-votes">
                    Total Votes: ${poll.total_votes}
                </div>

                ${poll.active ? `
                    <div style="text-align: center; margin-top: 15px;">
                        <a href="/polls/${poll.id}/vote/" class="btn btn-primary">
                            Vote on this Poll
                        </a>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    showError(message) {
        this.pollsContainer.innerHTML = `
            <div class="error">
                ${message}
                <br><br>
                <button onclick="pollsList.loadPolls()" class="btn btn-primary">Try Again</button>
            </div>
        `;
    }
}

// Create Poll Page functionality
class CreatePollPage {
    constructor() {
        this.choiceCount = 2;
        this.init();
    }

    init() {
        const form = document.getElementById('createPollForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    addChoice() {
        this.choiceCount++;
        const container = document.getElementById('choices-container');
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'choice-input';
        choiceDiv.innerHTML = `
            <input type="text" name="choices[]" class="form-control" placeholder="Choice ${this.choiceCount}" required maxlength="200">
            <button type="button" class="remove-choice" onclick="this.parentElement.remove()">×</button>
        `;
        container.appendChild(choiceDiv);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        
        // Get form data
        const formData = new FormData(e.target);
        const question = formData.get('question');
        const choices = formData.getAll('choices[]').filter(choice => choice.trim() !== '');
        
        // Validation
        if (choices.length < 2) {
            PollsUtils.showMessage('message', 'Please add at least 2 choices', 'error');
            return;
        }

        // Prepare data for API
        const pollData = {
            question: question,
            choices: choices
        };

        // Get CSRF token
        const csrfToken = PollsUtils.getCSRFToken();
        if (!csrfToken) {
            PollsUtils.showMessage('message', 'Security token missing. Please refresh the page.', 'error');
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        try {
            const response = await fetch('/api/polls/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(pollData)
            });

            const data = await response.json();

            if (response.ok) {
                PollsUtils.showMessage('message', 'Poll created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/polls/';
                }, 2000);
            } else {
                PollsUtils.showMessage('message', 'Error: ' + (data.detail || JSON.stringify(data)), 'error');
            }
        } catch (error) {
            PollsUtils.showMessage('message', 'Network error: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// Vote Poll Page functionality
class VotePollPage {
    constructor() {
        this.pollId = this.getPollIdFromUrl();
        this.selectedChoice = null;
        if (this.pollId) {
            this.loadPoll();
        }
    }

    getPollIdFromUrl() {
        const path = window.location.pathname;
        const match = path.match(/\/polls\/(\d+)\/vote/);
        return match ? match[1] : null;
    }

    async loadPoll() {
        try {
            const response = await fetch(`/api/polls/${this.pollId}/`);
            const poll = await response.json();
            
            if (response.ok) {
                this.displayPoll(poll);
            } else {
                this.showError('Failed to load poll');
            }
        } catch (error) {
            this.showError('Network error: ' + error.message);
        }
    }

    displayPoll(poll) {
        const container = document.getElementById('poll-container');
        
        if (poll.user_has_voted) {
            container.innerHTML = `
                <div class="poll-card">
                    <h2 class="poll-question">${PollsUtils.escapeHtml(poll.question)}</h2>
                    <div class="poll-meta">
                        <p>You have already voted in this poll.</p>
                        <p>Total votes: ${poll.total_votes}</p>
                    </div>
                    <div class="results-link">
                        <a href="/polls/#poll-${poll.id}" class="btn btn-primary">View Results</a>
                    </div>
                </div>
            `;
            return;
        }

        if (!poll.active) {
            container.innerHTML = `
                <div class="poll-card">
                    <h2 class="poll-question">${PollsUtils.escapeHtml(poll.question)}</h2>
                    <div class="poll-meta">
                        <p>This poll is no longer active.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="poll-card">
                <h2 class="poll-question">${PollsUtils.escapeHtml(poll.question)}</h2>
                
                <div class="poll-meta">
                    <p>By: ${poll.created_by.username} • Created: ${PollsUtils.formatDate(poll.pub_date)}</p>
                    <p>Total votes so far: ${poll.total_votes}</p>
                </div>

                <div class="choices-container">
                    ${poll.choices.map(choice => `
                        <label class="choice-option">
                            <input type="radio" name="poll-choice" value="${choice.id}" 
                                   onchange="votePoll.selectChoice(${choice.id})">
                            ${PollsUtils.escapeHtml(choice.choice_text)}
                        </label>
                    `).join('')}
                </div>

                <button id="submitVote" class="btn btn-success" disabled onclick="votePoll.submitVote()">
                    Submit Vote
                </button>

                <div id="message" class="message"></div>
            </div>
        `;
    }

    selectChoice(choiceId) {
        this.selectedChoice = choiceId;
        
        // Update UI to show selected choice
        document.querySelectorAll('.choice-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        const selectedOption = document.querySelector(`input[value="${choiceId}"]`).parentElement;
        selectedOption.classList.add('selected');
        
        // Enable submit button
        document.getElementById('submitVote').disabled = false;
    }

    async submitVote() {
        if (!this.selectedChoice) {
            PollsUtils.showMessage('message', 'Please select a choice', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitVote');
        const originalText = submitBtn.textContent;

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Voting...';

        try {
            // Get CSRF token
            const csrfToken = PollsUtils.getCSRFToken();
            
            const response = await fetch(`/api/polls/${this.pollId}/vote/${this.selectedChoice}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                PollsUtils.showMessage('message', '✓ ' + (data.message || 'Vote submitted successfully!'), 'success');
                setTimeout(() => {
                    window.location.href = '/polls/';
                }, 1500);
            } else {
                PollsUtils.showMessage('message', '❌ ' + (data.error || data.detail || 'Failed to submit vote'), 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            PollsUtils.showMessage('message', '❌ Network error: ' + error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showError(message) {
        document.getElementById('poll-container').innerHTML = `
            <div class="poll-card">
                <div class="error">${message}</div>
                <div style="text-align: center; margin-top: 15px;">
                    <button onclick="votePoll.loadPoll()" class="btn btn-primary">Try Again</button>
                </div>
            </div>
        `;
    }
}

// Initialize appropriate page based on current page
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
        window.homePage = new HomePage();
    } else if (path === '/polls/' || path.startsWith('/polls') && !path.includes('/vote') && !path.includes('/create')) {
        window.pollsList = new PollsListPage();
    } else if (path.includes('/polls/create')) {
        window.createPoll = new CreatePollPage();
    } else if (path.includes('/polls/') && path.includes('/vote')) {
        window.votePoll = new VotePollPage();
    }
});

// Global function for adding choices (used in HTML onclick)
function addChoice() {
    if (window.createPoll) {
        window.createPoll.addChoice();
    }
}