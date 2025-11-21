import os

def create_backend_structure(base_path="backend"):
    """
    Create the backend directory structure for a Node.js application
    """
    
    # Define the directory structure
    structure = {
        "": [
            "package.json",
            "server.js", 
            "app.js",
            ".env"
        ],
        "config": [
            "database.js"
        ],
        "controllers": [
            "authController.js",
            "userController.js", 
            "productController.js"
        ],
        "middleware": [
            "auth.js"
        ],
        "models": [
            "User.js",
            "Product.js"
        ],
        "routes": [
            "auth.js",
            "users.js",
            "products.js"
        ],
        "utils": [
            "helpers.js"
        ]
    }
    
    # Create directories and files
    for directory, files in structure.items():
        # Create directory path
        dir_path = os.path.join(base_path, directory) if directory else base_path
        
        # Create directory if it doesn't exist
        os.makedirs(dir_path, exist_ok=True)
        print(f"Created directory: {dir_path}")
        
        # Create files in the directory
        for file in files:
            file_path = os.path.join(dir_path, file)
            with open(file_path, 'w') as f:
                # Add basic content based on file type
                if file.endswith('.js'):
                    f.write(get_js_template(file))
                elif file == 'package.json':
                    f.write(get_package_json_template())
                elif file == '.env':
                    f.write(get_env_template())
                else:
                    f.write('')
            
            print(f"Created file: {file_path}")

def get_js_template(filename):
    """Return basic JS template based on filename"""
    if filename == 'server.js':
        return """const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
"""
    elif filename == 'app.js':
        return """const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;
"""
    elif 'Controller' in filename:
        return """// Controller functions for """ + filename.replace('Controller.js', '') + """
\nexports.get = async (req, res) => {
    try {
        // Implementation here
        res.status(200).json({ message: 'GET request successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        // Implementation here
        res.status(201).json({ message: 'CREATE request successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        // Implementation here
        res.status(200).json({ message: 'UPDATE request successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        // Implementation here
        res.status(200).json({ message: 'DELETE request successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
"""
    elif filename in ['auth.js', 'users.js', 'products.js']:
        return """const express = require('express');
const router = express.Router();
const controller = require('../controllers/""" + filename.replace('.js', 'Controller.js') + """');

// Define routes
router.get('/', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
"""
    else:
        return "// " + filename + "\n\nmodule.exports = {};"

def get_package_json_template():
    """Return basic package.json template"""
    return """{
  "name": "backend",
  "version": "1.0.0",
  "description": "Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "mongoose": "^6.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
"""

def get_env_template():
    """Return basic .env template"""
    return """PORT=3000
DB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
"""

if __name__ == "__main__":
    # Get current directory or specify a path
    current_dir = os.getcwd()
    backend_path = os.path.join(current_dir, "backend")
    
    print("Creating backend structure...")
    create_backend_structure(backend_path)
    print("Backend structure created successfully!")
    print(f"Location: {backend_path}")