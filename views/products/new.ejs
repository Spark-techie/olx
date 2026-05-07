<%- include('../partials/header') %>
<main class="container" style="max-width:700px;margin:40px auto;padding:0 20px;">
  <div class="card" style="padding:32px;">
    <h1 style="font-size:1.5rem;font-weight:800;margin-bottom:8px;">📢 Post Your Ad</h1>
    <p style="color:var(--text-muted);margin-bottom:28px;font-size:.9rem;">Fill in the details below to list your item for sale.</p>

    <form action="/products" method="POST" enctype="multipart/form-data">
      <div class="form-group">
        <label class="form-label">Product Title *</label>
        <input type="text" name="title" class="form-input" placeholder="e.g. Engineering Maths Textbook R2017" required maxlength="200"/>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label class="form-label">Price (₹) *</label>
          <input type="number" name="price" class="form-input" placeholder="e.g. 250" required min="0" step="0.01"/>
        </div>
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select name="category" class="form-input" required>
            <option value="">Select category</option>
            <% categories.forEach(c => { %><option value="<%= c %>"><%= c %></option><% }) %>
          </select>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="form-group">
          <label class="form-label">Condition *</label>
          <select name="condition_type" class="form-input" required>
            <option value="New">New</option>
            <option value="Like New" selected>Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Location *</label>
          <input type="text" name="location" class="form-input" placeholder="e.g. KRCT Campus Block A" required/>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Contact Number *</label>
        <input type="tel" name="contact_number" class="form-input" placeholder="e.g. 9876543210" required maxlength="15"/>
      </div>

      <div class="form-group">
        <label class="form-label">Description *</label>
        <textarea name="description" class="form-input" rows="5" placeholder="Describe your product – condition, age, any defects, what's included..." required></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Product Image</label>
        <div class="upload-area" id="uploadArea" onclick="document.getElementById('imageInput').click()">
          <div id="uploadPlaceholder">
            <div style="font-size:2.5rem;margin-bottom:8px;">📷</div>
            <div style="font-weight:600;margin-bottom:4px;">Click to upload image</div>
            <div style="font-size:.8rem;color:var(--text-muted)">JPG, PNG, GIF up to 5MB</div>
          </div>
          <img id="imagePreview" style="display:none;max-width:100%;max-height:200px;border-radius:8px;"/>
        </div>
        <input type="file" name="image" id="imageInput" accept="image/*" style="display:none" onchange="previewImage(this)"/>
      </div>

      <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:1rem;font-weight:700;">
        🚀 Post Ad Now
      </button>
    </form>
  </div>
</main>

<script>
function previewImage(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('imagePreview').src = e.target.result;
      document.getElementById('imagePreview').style.display = 'block';
      document.getElementById('uploadPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}
</script>

<style>
.upload-area {
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all .2s;
  background: var(--bg-secondary);
}
.upload-area:hover { border-color: var(--primary); background: rgba(var(--primary-rgb), .05); }
</style>
<%- include('../partials/footer') %>
