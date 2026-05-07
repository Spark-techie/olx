<%- include('../partials/header') %>
<main class="container" style="max-width:600px;margin:40px auto;padding:0 20px;">
  <div class="card" style="padding:32px;">
    <h1 style="font-size:1.4rem;font-weight:800;margin-bottom:24px;">✏️ Edit Profile</h1>
    <form action="/profile/edit" method="POST" enctype="multipart/form-data">
      <div style="display:flex;justify-content:center;margin-bottom:24px;">
        <div style="position:relative;">
          <div id="avatarDisplay" style="width:90px;height:90px;border-radius:50%;overflow:hidden;background:linear-gradient(135deg,#6c63ff,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:800;color:#fff;cursor:pointer;" onclick="document.getElementById('avatarInput').click()">
            <% if (profileUser.profile_image) { %>
              <img id="avatarImg" src="/uploads/<%= profileUser.profile_image %>" style="width:100%;height:100%;object-fit:cover;"/>
            <% } else { %>
              <span id="avatarInitial"><%= profileUser.full_name.charAt(0).toUpperCase() %></span>
            <% } %>
          </div>
          <div style="position:absolute;bottom:0;right:0;background:var(--primary);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:.7rem;cursor:pointer;color:#fff;" onclick="document.getElementById('avatarInput').click()">📷</div>
        </div>
      </div>
      <input type="file" name="avatar" id="avatarInput" accept="image/*" style="display:none" onchange="previewAvatar(this)"/>

      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input type="text" name="full_name" class="form-input" value="<%= profileUser.full_name %>" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Phone Number</label>
        <input type="tel" name="phone" class="form-input" value="<%= profileUser.phone || '' %>" placeholder="10-digit mobile number"/>
      </div>
      <div class="form-group">
        <label class="form-label">Bio</label>
        <textarea name="bio" class="form-input" rows="3" placeholder="A little about yourself..."><%= profileUser.bio || '' %></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">College</label>
        <input type="text" class="form-input" value="<%= profileUser.college_name %>" disabled style="opacity:.6;cursor:not-allowed;"/>
        <small style="color:var(--text-muted);font-size:.75rem;">College cannot be changed (linked to email domain)</small>
      </div>
      <div style="display:flex;gap:12px;margin-top:8px;">
        <a href="/profile" class="btn btn-secondary" style="flex:1;text-align:center;padding:12px;">Cancel</a>
        <button type="submit" class="btn btn-primary" style="flex:2;padding:12px;font-weight:700;">💾 Save Changes</button>
      </div>
    </form>
  </div>
</main>
<script>
function previewAvatar(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      const d = document.getElementById('avatarDisplay');
      d.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;"/>`;
    };
    reader.readAsDataURL(file);
  }
}
</script>
<%- include('../partials/footer') %>
