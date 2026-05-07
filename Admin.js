<%- include('../partials/header') %>
<main class="container" style="max-width:1100px;margin:40px auto;padding:0 20px;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
    <div>
      <h1 style="font-size:1.5rem;font-weight:800;">📦 My Ads</h1>
      <p style="color:var(--text-muted);margin-top:4px;"><%= products.length %> listing<%= products.length!==1?'s':'' %></p>
    </div>
    <a href="/products/new" class="btn btn-primary">+ Post New Ad</a>
  </div>

  <% if (products.length > 0) { %>
    <div class="table-responsive">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid var(--border);">
            <th style="text-align:left;padding:12px 16px;font-size:.8rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Product</th>
            <th style="text-align:left;padding:12px 16px;font-size:.8rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Price</th>
            <th style="text-align:left;padding:12px 16px;font-size:.8rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Category</th>
            <th style="text-align:left;padding:12px 16px;font-size:.8rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Status</th>
            <th style="text-align:left;padding:12px 16px;font-size:.8rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Views</th>
            <th style="text-align:left;padding:12px 16px;font-size:.8rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Posted</th>
            <th style="text-align:left;padding:12px 16px;font-size:.8rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <% products.forEach(p => { %>
          <tr style="border-bottom:1px solid var(--border);transition:background .15s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background=''">
            <td style="padding:14px 16px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <% if (p.image_url) { %>
                  <img src="/uploads/<%= p.image_url %>" style="width:46px;height:46px;border-radius:8px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'"/>
                <% } else { %>
                  <div style="width:46px;height:46px;border-radius:8px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">📦</div>
                <% } %>
                <div>
                  <a href="/products/<%= p.id %>" style="font-weight:600;color:var(--text);text-decoration:none;font-size:.9rem;display:block;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><%= p.title %></a>
                  <span style="font-size:.75rem;color:var(--text-muted);"><%= p.location %></span>
                </div>
              </div>
            </td>
            <td style="padding:14px 16px;font-weight:700;color:#43e97b;">₹<%= parseFloat(p.price).toLocaleString('en-IN') %></td>
            <td style="padding:14px 16px;">
              <span style="background:var(--bg-secondary);padding:3px 10px;border-radius:20px;font-size:.78rem;font-weight:600;"><%= p.category %></span>
            </td>
            <td style="padding:14px 16px;">
              <% if (p.status==='active') { %>
                <span style="background:rgba(67,233,123,.15);color:#43e97b;padding:3px 10px;border-radius:20px;font-size:.78rem;font-weight:700;">● Active</span>
              <% } else if (p.status==='sold') { %>
                <span style="background:rgba(247,151,30,.15);color:#f7971e;padding:3px 10px;border-radius:20px;font-size:.78rem;font-weight:700;">● Sold</span>
              <% } else { %>
                <span style="background:rgba(255,107,107,.15);color:#ff6b6b;padding:3px 10px;border-radius:20px;font-size:.78rem;font-weight:700;">● Inactive</span>
              <% } %>
            </td>
            <td style="padding:14px 16px;color:var(--text-muted);font-size:.85rem;">👁 <%= p.views || 0 %></td>
            <td style="padding:14px 16px;color:var(--text-muted);font-size:.82rem;"><%= new Date(p.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) %></td>
            <td style="padding:14px 16px;">
              <div style="display:flex;gap:8px;">
                <a href="/products/<%= p.id %>/edit" class="btn btn-secondary btn-sm">✏️</a>
                <form method="POST" action="/products/<%= p.id %>/delete" onsubmit="return confirm('Delete this ad permanently?')">
                  <button type="submit" class="btn btn-sm" style="background:rgba(255,107,107,.15);color:#ff6b6b;border:1px solid rgba(255,107,107,.3);">🗑️</button>
                </form>
              </div>
            </td>
          </tr>
          <% }) %>
        </tbody>
      </table>
    </div>
  <% } else { %>
    <div class="empty-state">
      <div style="font-size:4rem;margin-bottom:16px;">📭</div>
      <h2>No ads yet</h2>
      <p>List your first item for sale to your college community.</p>
      <a href="/products/new" class="btn btn-primary" style="margin-top:20px;">+ Post Your First Ad</a>
    </div>
  <% } %>
</main>
<%- include('../partials/footer') %>
