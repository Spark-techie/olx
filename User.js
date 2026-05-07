<%- include('../partials/header') %>
<main class="container" style="max-width:500px;margin:60px auto;padding:0 20px;">
  <div class="card" style="padding:32px;">
    <h1 style="font-size:1.3rem;font-weight:800;margin-bottom:24px;">🔒 Change Password</h1>
    <form action="/profile/change-password" method="POST">
      <div class="form-group">
        <label class="form-label">Current Password *</label>
        <input type="password" name="current_password" class="form-input" placeholder="Enter current password" required/>
      </div>
      <div class="form-group">
        <label class="form-label">New Password *</label>
        <input type="password" name="new_password" class="form-input" placeholder="Minimum 6 characters" required minlength="6"/>
      </div>
      <div class="form-group">
        <label class="form-label">Confirm New Password *</label>
        <input type="password" name="confirm_password" class="form-input" placeholder="Repeat new password" required/>
      </div>
      <div style="display:flex;gap:12px;margin-top:8px;">
        <a href="/profile" class="btn btn-secondary" style="flex:1;text-align:center;padding:12px;">Cancel</a>
        <button type="submit" class="btn btn-primary" style="flex:2;padding:12px;font-weight:700;">🔐 Update Password</button>
      </div>
    </form>
  </div>
</main>
<%- include('../partials/footer') %>
