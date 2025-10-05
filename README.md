# Polls App - Django REST API

A modern, full‑featured polling application built with **Django** and **Django REST Framework**. Create polls, vote in real‑time, and view results with beautiful visualizations.

---

## 🚀 Features

* **RESTful API** — Complete CRUD operations for polls
* **Real‑time Voting** — Instant vote counting with percentages
* **Modern UI** — Responsive design with beautiful gradients
* **CSRF Protection** — Secure form handling
* **Anonymous Voting** — No authentication required
* **Results Visualization** — Percentage bars and vote counts
* **Admin Interface** — Full Django admin support

---

## 🛠️ Tech Stack

* **Backend:** Django 5.0, Django REST Framework
* **Frontend:** Vanilla JavaScript, CSS3, HTML5
* **Database:** SQLite (default, easily configurable for PostgreSQL/MySQL)
* **Authentication:** Session‑based with CSRF protection

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/django-polls-app.git
cd django-polls-app
```

Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Create a superuser:

```bash
python manage.py createsuperuser
```

Run development server:

```bash
python manage.py runserver
```

Visit `http://127.0.0.1:8000/` to see the application.

---

## 🎯 Quick Start

### Using the Web Interface

* **View Polls:** Navigate to `/polls/` to see all active polls
* **Create Poll:** Go to `/polls/create/` to make a new poll
* **Vote:** Click "Vote on this Poll" on any active poll
* **View Results:** See real‑time percentages and vote counts

### Using the API Directly

**List all polls:**

```bash
curl http://127.0.0.1:8000/api/polls/
```

**Create a poll:**

```bash
curl -X POST http://127.0.0.1:8000/api/polls/ \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your favorite color?",
    "choices": ["Red", "Blue", "Green"]
  }'
```

**Vote on a poll:**

```bash
curl -X POST http://127.0.0.1:8000/api/polls/1/vote/2/
```

---

## 📚 API Documentation

### Endpoints

| Method | Endpoint                            | Description                        |
| ------ | ----------------------------------- | ---------------------------------- |
| GET    | `/api/polls/`                       | List all polls                     |
| POST   | `/api/polls/`                       | Create new poll                    |
| GET    | `/api/polls/{id}/`                  | Get poll details                   |
| POST   | `/api/polls/{id}/vote/{choice_id}/` | Vote on a poll                     |
| GET    | `/api/polls/{id}/results/`          | Get poll results                   |
| GET    | `/api/my-polls/`                    | Get the authenticated user's polls |

### Poll Object (example)

```json
{
  "id": 1,
  "question": "Sample question?",
  "created_by": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  },
  "pub_date": "2025-10-04T07:30:00Z",
  "active": true,
  "choices": [
    {
      "id": 1,
      "choice_text": "Option 1",
      "votes": 5,
      "percentage": 50.0
    }
  ],
  "total_votes": 10,
  "user_has_voted": false
}
```

---

## 🗂️ Project Structure

```
polls_project/
├── polls/                 # Main polls app
│   ├── models.py          # Poll, Choice, Vote models
│   ├── views.py           # Template views
│   ├── urls.py            # Frontend URLs
│   └── templates/         # HTML templates
├── api/                   # API app
│   ├── views.py           # API views
│   ├── serializers.py     # DRF serializers
│   └── urls.py            # API endpoints
├── static/                # Static files
│   ├── css/style.css      # All styles
│   └── js/main.js         # All JavaScript
└── polls_project/         # Project settings
    ├── settings.py        # Django settings
    └── urls.py            # Main URL config
```

---

## 🎨 Features in Detail

### Frontend

* **Responsive Design:** Works on desktop and mobile
* **Real‑time Updates:** Vote percentages update automatically
* **Interactive UI:** Hover effects and smooth animations
* **Form Validation:** Client and server‑side validation
* **CSRF Protection:** Secure form submissions

### Backend

* **RESTful API:** Clean, predictable endpoints
* **Data Validation:** Comprehensive input validation
* **Error Handling:** Graceful error responses
* **Pagination:** Efficient data loading
* **Admin Interface:** Full CRUD operations through Django admin

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file for configuration:

```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Database

Switch to PostgreSQL or MySQL by updating `DATABASES` in `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'polls_db',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

---

## 🙏 Acknowledgments

Thanks to the Django & Django REST Framework teams. Inspiration from real‑world polling applications and community contributors.

---

Ready to start polling? Visit `http://127.0.0.1:8000/` and create your first poll!
