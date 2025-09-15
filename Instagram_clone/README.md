# Social Media App (Instagram Clone)

A full-stack social media application built with Django REST Framework backend and React TypeScript frontend, featuring post creation, commenting, liking, and media upload functionality with Cloudinary integration.

## 🚀 Features

- **User Authentication**: Registration and JWT-based login
- **Post Management**: Create, read, update, delete posts with text, images, and videos
- **Media Upload**: Cloudinary integration for image and video storage
- **Social Interactions**: Like and comment on posts
- **Real-time Updates**: Dynamic content loading with pagination
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **File Upload**: Support for both image and video uploads

## 🛠 Tech Stack

### Backend
- **Django 5.2**: Web framework
- **Django REST Framework**: API development
- **MySQL**: Database
- **Cloudinary**: Media storage and CDN
- **JWT Authentication**: Secure user authentication
- **CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling framework
- **DaisyUI**: UI component library
- **Redux Toolkit**: State management
- **React Router**: Navigation
- **Axios**: HTTP client
- **React Toastify**: Notifications

## 📁 Project Structure

```
blog-api/
├── blog_app/                 # Django backend
│   ├── api/                  # Main API app
│   │   ├── models.py         # Database models
│   │   ├── serializers.py    # API serializers
│   │   ├── views.py          # API views
│   │   └── urls.py           # API routes
│   ├── blog_app/             # Project settings
│   │   ├── settings.py       # Django configuration
│   │   └── urls.py           # Main URL configuration
│   └── manage.py             # Django management script
└── Instagram_clone/          # React frontend
    ├── src/
    │   ├── components/       # Reusable components
    │   ├── pages/            # Page components
    │   ├── services/         # API service functions
    │   ├── features/         # Redux slices
    │   └── app/              # Redux store
    └── package.json
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL database
- Cloudinary account

### Backend Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd blog-api/blog_app
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install django djangorestframework django-cors-headers python-decouple mysqlclient cloudinary django-cloudinary-storage djangorestframework-simplejwt
```

4. **Configure environment variables**
Create a `.env` file in the `blog_app` directory:
```env
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

DB_NAME=instagram
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

5. **Database setup**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE instagram;
exit

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

6. **Start development server**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../Instagram_clone
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

## 🔑 Environment Configuration

### Backend (`blog_app/.env`)
```env
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
DB_NAME=instagram
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

### Frontend (Optional `.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 📚 API Endpoints

### Authentication
- `POST /api/token/` - Login
- `POST /api/token/refresh/` - Refresh token
- `POST /register/` - User registration

### Posts
- `GET /posts/` - List posts (paginated)
- `POST /posts/` - Create post
- `GET /post/{id}/` - Get specific post
- `PUT /post/{id}/` - Update post
- `DELETE /post/{id}/` - Delete post

### Comments
- `GET /comments/` - List comments
- `POST /comments/` - Create comment

### Likes
- `GET /postlikes/{id}/` - Get post likes
- `POST /postlikes/{id}/` - Toggle like

## 🎨 Key Features Implementation

### Media Upload with Cloudinary
```python
# models.py
from cloudinary.models import CloudinaryField

class Post(models.Model):
    image = CloudinaryField('image', blank=True, null=True)
    video = CloudinaryField('video', blank=True, null=True, resource_type='video')
```

### JWT Authentication
```typescript
// Automatic token refresh interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401 && !originalRequest._retry) {
      // Refresh token logic
    }
  }
);
```

### Redux State Management
```typescript
// Post slice with CRUD operations
const postsSlice = createSlice({
  name: "posts",
  reducers: {
    setPosts, addPost, removePost, updatePost
  }
});
```

## 🔐 Security Features

- JWT token authentication with automatic refresh
- CORS configuration for frontend-backend communication
- Input validation and sanitization
- Protected routes requiring authentication
- User authorization for post modifications

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive sidebar navigation
- Adaptive media display
- Touch-friendly interface

## 🚀 Deployment

### Backend Deployment
1. Configure production settings
2. Set up static file serving
3. Configure database for production
4. Set environment variables

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy to hosting service (Vercel, Netlify, etc.)
3. Configure API base URL

## 🧪 Testing

### Backend
```bash
python manage.py test
```

### Frontend
```bash
npm run test
```

## 📈 Future Enhancements

- [ ] Real-time messaging
- [ ] Story feature
- [ ] Advanced search functionality
- [ ] User profiles and followers
- [ ] Email notifications
- [ ] Mobile app with React Native

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Django REST Framework documentation
- React and TypeScript communities
- Cloudinary for media management
- Tailwind CSS for styling inspiration
```