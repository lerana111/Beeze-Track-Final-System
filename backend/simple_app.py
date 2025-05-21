from flask import Flask, jsonify, request
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/test/upload', methods=['POST'])
def test_upload():
    # Check if the post request has the file part
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
        
    file = request.files['image']
    
    # Check if the file is empty
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400
        
    # Check if the file type is allowed
    if file and allowed_file(file.filename):
        # Create a unique filename
        filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
        
        # Save the file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        image_url = f"/static/uploads/{filename}"
        
        return jsonify({
            "message": "Image uploaded successfully",
            "imageUrl": image_url,
        }), 200
    else:
        return jsonify({"error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

@app.route('/')
def index():
    return """
    <html>
    <head>
        <title>BeezeTrack Backend</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #0066cc; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
            form { margin-top: 20px; padding: 20px; background: #f9f9f9; border-radius: 5px; }
            .result { margin-top: 20px; padding: 20px; background: #e6f7ff; border-radius: 5px; display: none; }
            .error { background: #fff0f0; color: #d32f2f; }
        </style>
    </head>
    <body>
        <h1>BeezeTrack Backend API</h1>
        <p>The API is running. Use the following endpoints:</p>
        <pre>
/api/health              - Health check
/api/auth/register       - Register a new user
/api/auth/login          - Login
/api/auth/me             - Get current user info
/api/deliveries          - Get or create deliveries
/api/deliveries/track    - Track a delivery
/api/deliveries/statistics - Get user statistics
/api/test/upload         - Test image upload
        </pre>

        <form id="uploadForm" enctype="multipart/form-data">
            <h2>Test Image Upload</h2>
            <input type="file" name="image" accept="image/*">
            <button type="submit">Upload</button>
        </form>

        <div id="result" class="result"></div>

        <script>
            document.getElementById('uploadForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(this);
                
                fetch('/api/test/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    const resultDiv = document.getElementById('result');
                    resultDiv.style.display = 'block';
                    
                    if (data.error) {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = `<h3>Error</h3><p>${data.error}</p>`;
                    } else {
                        resultDiv.className = 'result';
                        resultDiv.innerHTML = `
                            <h3>Upload Successful</h3>
                            <p>Image URL: ${data.imageUrl}</p>
                            <img src="${data.imageUrl}" style="max-width: 300px; max-height: 300px;">
                        `;
                    }
                })
                .catch(error => {
                    const resultDiv = document.getElementById('result');
                    resultDiv.style.display = 'block';
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = `<h3>Error</h3><p>${error.message}</p>`;
                });
            });
        </script>
    </body>
    </html>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 